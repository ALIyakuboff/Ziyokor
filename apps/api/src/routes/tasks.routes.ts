import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../auth";
import { mustParse, zISODate } from "../utils/validate";
import { query } from "../db";
import { todayISO, weekDaysMonToSat, APP_TZ } from "../utils/date";
import { emitToUser, emitToRole } from "../socket";
import { DateTime } from "luxon";

export const tasksRouter = Router();

// Cutoff for task creation and carryovers (20:00)
const CUTOFF_HOUR = 20;

// Helper to get next work day (Mon-Sat)
function nextWorkDay(iso: string): string {
    let d = DateTime.fromISO(iso).setZone(APP_TZ).plus({ days: 1 });
    while (d.weekday === 7) { // Skip Sunday
        d = d.plus({ days: 1 });
    }
    return d.toISODate()!;
}

// Helper to ensure YYYY-MM-DD string in UZB time
function ensureDateStr(d: any) {
    if (!d) return d;
    if (d instanceof Date) return DateTime.fromJSDate(d).setZone(APP_TZ).toISODate();
    if (typeof d === "string" && d.includes("T")) return DateTime.fromISO(d).setZone(APP_TZ).toISODate();
    return d;
}

// Logic to move unfinished tasks forward
export async function syncCarryovers(userId: string) {
    const now = DateTime.now().setZone(APP_TZ);
    const today = now.toISODate()!;

    // Active day is today if before CUTOFF_HOUR, else next work day
    const activeDay = now.hour < CUTOFF_HOUR ? today : nextWorkDay(today);

    // Update tasks that are past their visible_date or are today but it's past 20:00
    // Actually, visible_date < activeDay covers both cases perfectly.
    // Update tasks that are past their visible_date or are today but it's past 20:00
    // Logic: Move all normal/mandatory tasks.
    // Logic: Move 'project' tasks ONLY if within 60 days of assigned_date.
    await query(
        `UPDATE tasks 
         SET carryover_from_date = visible_date,
             visible_date = $2,
             is_carryover = true
         WHERE user_id = $1 
           AND status != 'done' 
           AND visible_date < $2::date
           AND deleted_at IS NULL
           AND (
             is_project = false 
             OR 
             (is_project = true AND $2::date <= (assigned_date + INTERVAL '60 days'))
           )`,
        [userId, activeDay]
    );

    // Mark expired project tasks as missed
    // If today > assigned_date + 60 days, and status is not done/missed, mark as missed.
    await query(
        `UPDATE tasks
         SET status = 'missed'
         WHERE user_id = $1
           AND status != 'done' AND status != 'missed'
           AND is_project = true
           AND $2::date > (assigned_date + INTERVAL '60 days')`,
        [userId, activeDay]
    );
}

async function runCleanup() {
    try {
        const result = await query(
            "DELETE FROM tasks WHERE visible_date < NOW() - INTERVAL '3 months' AND deleted_at IS NOT NULL"
        );
        // Also possibly delete comments first to respect FK, although DELETE CASCADE might be on DB.
        // Let's be safe:
        await query(
            "DELETE FROM task_comments WHERE task_id IN (SELECT id FROM tasks WHERE visible_date < NOW() - INTERVAL '3 months')"
        );
        await query(
            "DELETE FROM tasks WHERE visible_date < NOW() - INTERVAL '3 months'"
        );
        console.log("Cleanup: Deleted tasks older than 3 months.");
    } catch (e) {
        console.error("Cleanup error:", e);
    }
}
// Run on startup
runCleanup();

tasksRouter.use(authRequired);

// Analytics
const workHoursCheck = (res: any) => {
    const now = DateTime.now().setZone(APP_TZ);
    const h = now.hour;
    // 08:00 to CUTOFF_HOUR
    if (h < 8 || h >= CUTOFF_HOUR) {
        return res.status(403).json({ error: `WORK_HOURS_08_${CUTOFF_HOUR}` });
    }
    return null;
};

tasksRouter.get("/analytics", async (req: any, res: any, next: any) => {
    try {
        const me = (req as any).user as { id: string; role: string };
        const workerId = (req.query.workerId as string) || (me.role === "admin" ? "all" : me.id);
        const range = (req.query.range as "week" | "month" | "year") || "week";
        const anchor = (req.query.anchor as string) || todayISO();

        // Permission check
        if (workerId !== "all" && workerId !== me.id && me.role !== "admin") {
            return res.status(403).json({ error: "FORBIDDEN" });
        }

        const d = DateTime.fromISO(anchor).setZone(APP_TZ);
        if (!d.isValid) return res.status(400).json({ error: "INVALID_DATE" });

        let start: DateTime;
        let end: DateTime;
        let buckets: { start: string; end: string; label: string }[] = [];

        if (range === "week") {
            // Mon-Sat
            const mon = d.startOf("week"); // Luxon defaults Mon
            start = mon;
            end = mon.plus({ days: 5 }).endOf("day");
            // Buckets: individual days
            for (let i = 0; i < 6; i++) {
                const day = mon.plus({ days: i });
                buckets.push({
                    start: day.toISODate()!,
                    end: day.toISODate()!,
                    label: day.toFormat("ccc", { locale: "uz" }) // Du, Se...
                });
            }
        } else if (range === "month") {
            start = d.startOf("month");
            end = d.endOf("month");
            // Buckets: Weeks (W1..W5)
            // Logic: partial weeks are fine.
            let curr = start;
            let w = 1;
            while (curr < end) {
                const wEnd = curr.endOf("week"); // Sunday
                const actualEnd = wEnd < end ? wEnd : end;
                buckets.push({
                    start: curr.toISODate()!,
                    end: actualEnd.toISODate()!,
                    label: `W${w}`
                });
                curr = actualEnd.plus({ days: 1 }).startOf("day");
                w++;
            }
        } else {
            // Year
            start = d.startOf("year");
            end = d.endOf("year");
            // Buckets: Months
            for (let i = 0; i < 12; i++) {
                const mStart = start.plus({ months: i });
                const mEnd = mStart.endOf("month");
                buckets.push({
                    start: mStart.toISODate()!,
                    end: mEnd.toISODate()!,
                    label: mStart.toFormat("MMM", { locale: "en" }) // Jan, Feb...
                });
            }
        }

        // Query
        // We need: total tasks, completed tasks, mandatory tasks, completed mandatory tasks
        // grouped by our buckets. Since buckets are variable, best to fetch all tasks in range and aggregate in JS or careful SQL case.
        // JS aggregation is easier for complex buckets (like broken weeks).

        let sql = `SELECT id, status, is_mandatory, visible_date
             FROM tasks
             WHERE visible_date >= $1
               AND visible_date <= $2
               AND deleted_at IS NULL`;
        const params: any[] = [start.toISODate(), end.toISODate()];

        if (workerId !== "all") {
            sql += ` AND user_id=$3`;
            params.push(workerId);
        } else {
            // "all" - verify admin role again just to be safe, though handled above
            if (me.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
        }

        const r = await query<any>(sql, params);

        const tasks = r.rows.map(t => ({
            ...t,
            // Ensure visible_date is string YYYY-MM-DD
            visible_date: t.visible_date instanceof Date
                ? DateTime.fromJSDate(t.visible_date).setZone(APP_TZ).toISODate()
                : (typeof t.visible_date === 'string' && t.visible_date.includes('T')
                    ? DateTime.fromISO(t.visible_date).setZone(APP_TZ).toISODate()
                    : t.visible_date)
        }));

        const productivity: { label: string; value: number }[] = [];
        const compliance: { label: string; value: number }[] = [];
        const series: any[] = [];

        for (const bucket of buckets) {
            const bucketTasks = tasks.filter(t => t.visible_date >= bucket.start && t.visible_date <= bucket.end);

            const total = bucketTasks.length;
            const done = bucketTasks.filter(t => t.status === "done").length;
            const prodVal = total > 0 ? Math.round((done / total) * 100) : (done > 0 ? 100 : 0);
            productivity.push({ label: bucket.label, value: prodVal });

            const mandTasks = bucketTasks.filter(t => t.is_mandatory);
            const mandTotal = mandTasks.length;
            const mandDone = mandTasks.filter(t => t.status === "done").length;
            const compVal = mandTotal > 0 ? Math.round((mandDone / mandTotal) * 100) : 100;
            compliance.push({ label: bucket.label, value: compVal });

            series.push({
                label: bucket.label,
                completion_rate: prodVal,
                mandatory_compliance: compVal
            });
        }

        res.json({ productivity, compliance, series });

    } catch (e) {
        next(e);
    }
});

// Helper to ensure YYYY-MM-DD string in UZB time


// Get my week (6 days)
tasksRouter.get("/me/week", async (req: any, res: any, next: any) => {
    try {
        const anchor = (req.query.anchor as string) || todayISO();
        const days = weekDaysMonToSat(anchor);
        if (!days) return res.status(400).json({ error: "INVALID_DATE" });

        const me = (req as any).user as { id: string };
        await syncCarryovers(me.id);

        const r = await query<any>(
            `SELECT t.*, (SELECT COUNT(*)::int FROM task_comments WHERE task_id = t.id) as comment_count
       FROM tasks t
       WHERE t.user_id=$1 AND t.visible_date = ANY($2::date[])
         AND t.deleted_at IS NULL
       ORDER BY t.visible_date ASC,
         CASE
           WHEN t.is_mandatory THEN 1
           WHEN t.is_carryover THEN 3
           ELSE 2
         END ASC,
         t.created_at ASC`,
            [me.id, days]
        );

        const grouped: Record<string, { mandatory: any[]; normal: any[]; project: any[]; carryover: any[]; progress: { done: number; total: number; percent: number } }> = {};
        for (const d of days) {
            grouped[d] = { mandatory: [], normal: [], project: [], carryover: [], progress: { done: 0, total: 0, percent: 0 } };
        }

        for (const t of r.rows) {
            let d = t.visible_date;
            if (d instanceof Date) {
                // Fix: Ensure we don't shift to previous day via UTC conversion
                d = DateTime.fromJSDate(d).setZone(APP_TZ).toISODate();
            }
            if (!grouped[d]) continue;
            grouped[d].progress.total++;
            if (t.status === "done") grouped[d].progress.done++;

            if (t.is_mandatory) grouped[d].mandatory.push(t);
            else if (t.is_project) grouped[d].project.push(t);
            else if (t.is_carryover) grouped[d].carryover.push(t);
            else grouped[d].normal.push(t);
        }

        for (const d of days) {
            const { done, total } = grouped[d].progress;
            grouped[d].progress.percent = total ? Math.round((done / total) * 100) : 0;
        }

        res.json({ anchor, days, data: grouped });
    } catch (e) {
        next(e);
    }
});

// Create my normal task
tasksRouter.post("/me", async (req: any, res: any, next: any) => {
    try {
        const me = (req as any).user as { id: string };

        const body = mustParse(
            z.object({
                title: z.string().min(1).max(200),
                date: zISODate.optional() // visible/assigned date
            }),
            req.body
        );

        const date = body.date || todayISO();

        // Ensure not past
        if (ensureDateStr(date) < todayISO()) {
            return res.status(403).json({ error: "CANNOT_CREATE_PAST_TASK" });
        }

        // CUTOFF_HOUR limit for TODAY
        const now = DateTime.now().setZone(APP_TZ);
        if (ensureDateStr(date) === todayISO() && now.hour >= CUTOFF_HOUR) {
            return res.status(403).json({ error: `CANNOT_CREATE_TASK_AFTER_${CUTOFF_HOUR}_00` });
        }

        const closed = await query<{ date: string }>("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
        if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

        const ins = await query<any>(
            `INSERT INTO tasks
        (user_id, title, is_mandatory, status, assigned_date, visible_date,
         is_carryover, carryover_from_date, template_id, one_off_by_admin,
         created_by, created_by_id)
       VALUES
        ($1,$2,false,'pending',$3,$3,false,NULL,NULL,false,'worker',$1)
       RETURNING *`,
            [me.id, body.title, date]
        );

        const task = ins.rows[0];

        // Fix: Ensure dates are strings YYYY-MM-DD in UZB time
        task.visible_date = ensureDateStr(task.visible_date);
        task.assigned_date = ensureDateStr(task.assigned_date);

        // Emit real-time event to Worker
        emitToUser(me.id, "task:created", { task });
        // Emit to Admin
        emitToRole("admin", "task:created", { task, userId: me.id });

        res.json({ task });
    } catch (e) {
        next(e);
    }
});

// Start task
tasksRouter.patch("/:id/start", async (req: any, res: any, next: any) => {
    try {
        const me = (req as any).user as { id: string };
        const id = req.params.id;
        if (workHoursCheck(res)) return;

        // Only own tasks
        const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
        if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
        if (t.rows[0].user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });

        const date = t.rows[0].visible_date;
        const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
        if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

        // Ensure not future
        if (ensureDateStr(date) > todayISO()) {
            return res.status(403).json({ error: "CANNOT_WORK_ON_FUTURE_TASK" });
        }

        const up = await query<any>(
            `UPDATE tasks SET status='in_progress', started_at=NOW()
       WHERE id=$1
       RETURNING *`,
            [id]
        );

        const task = up.rows[0];

        // Fix dates
        task.visible_date = ensureDateStr(task.visible_date);
        task.assigned_date = ensureDateStr(task.assigned_date);

        // Emit real-time event
        emitToUser(me.id, "task:started", { task });
        emitToRole("admin", "task:started", { task, userId: me.id });

        res.json({ task });
    } catch (e) {
        next(e);
    }
});

// Update task status (Generic)
tasksRouter.patch("/:id/status", async (req: any, res: any, next: any) => {
    try {
        const me = (req as any).user as { id: string };
        const id = req.params.id;
        const body = mustParse(
            z.object({
                status: z.enum(['pending', 'in_progress', 'started', 'testing', 'problem', 'done', 'missed'])
            }),
            req.body
        );

        if (workHoursCheck(res)) return;

        const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
        if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
        const task = t.rows[0];
        if (task.user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });

        const date = task.visible_date;
        const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
        if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

        // Ensure not future
        if (ensureDateStr(date) > todayISO()) {
            return res.status(403).json({ error: "CANNOT_WORK_ON_FUTURE_TASK" });
        }

        const updates: string[] = ["status=$2"];
        const params: any[] = [id, body.status];
        let pIdx = 3;

        // If becoming done
        if (body.status === 'done') {
            // Enforce comment for done tasks ? (User didn't specify, but existing doneTask does)
            // Let's reuse comment check if 'done'
            const c = await query<{ cnt: number }>("SELECT COUNT(*)::int AS cnt FROM task_comments WHERE task_id=$1", [id]);
            if ((c.rows[0]?.cnt || 0) < 1) {
                return res.status(400).json({ error: "COMMENT_REQUIRED" });
            }
            updates.push(`completed_at=NOW()`, `completed_date='${todayISO()}'`);
        }
        // If becoming in_progress or started
        if (body.status === 'in_progress' || body.status === 'started') {
            updates.push(`started_at=COALESCE(started_at, NOW())`);
        }

        const up = await query<any>(
            `UPDATE tasks
             SET ${updates.join(", ")}
             WHERE id=$1
             RETURNING *`,
            params
        );

        const updatedTask = up.rows[0];
        updatedTask.visible_date = ensureDateStr(updatedTask.visible_date);
        updatedTask.assigned_date = ensureDateStr(updatedTask.assigned_date);

        // Emit
        emitToUser(me.id, "task:updated", { task: updatedTask });
        emitToRole("admin", "task:updated", { task: updatedTask, userId: me.id });

        res.json({ task: updatedTask });

        // Done task (mandatory requires comment)
        tasksRouter.patch("/:id/done", async (req: any, res: any, next: any) => {
            try {
                const me = (req as any).user as { id: string };
                const id = req.params.id;
                if (workHoursCheck(res)) return;

                const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
                if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
                const task = t.rows[0];
                if (task.user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });

                const date = task.visible_date;
                const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
                if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

                // Ensure not future
                if (ensureDateStr(date) > todayISO()) {
                    return res.status(403).json({ error: "CANNOT_WORK_ON_FUTURE_TASK" });
                }

                // Enforce comment for ALL tasks
                const c = await query<{ cnt: number }>("SELECT COUNT(*)::int AS cnt FROM task_comments WHERE task_id=$1", [id]);
                if ((c.rows[0]?.cnt || 0) < 1) {
                    return res.status(400).json({ error: "COMMENT_REQUIRED" });
                }

                const up = await query<any>(
                    `UPDATE tasks
       SET status='done', completed_at=NOW(), completed_date=$2
       WHERE id=$1
       RETURNING *`,
                    [id, todayISO()]
                );

                const updatedTask = up.rows[0];

                // Fix dates
                updatedTask.visible_date = ensureDateStr(updatedTask.visible_date);
                updatedTask.assigned_date = ensureDateStr(updatedTask.assigned_date);

                // Emit real-time event
                emitToUser(me.id, "task:completed", { task: updatedTask });
                emitToRole("admin", "task:completed", { task: updatedTask, userId: me.id });

                res.json({ task: updatedTask });
            } catch (e) {
                next(e);
            }
        });

        // Delete my normal task (cannot delete mandatory)
        tasksRouter.delete("/:id", async (req: any, res: any, next: any) => {
            try {
                const me = (req as any).user as { id: string };
                const id = req.params.id;

                const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
                if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
                const task = t.rows[0];

                if (task.user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });
                if (task.is_mandatory) return res.status(403).json({ error: "CANNOT_DELETE_MANDATORY" });

                const date = task.visible_date;
                const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
                if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

                // User requested "serverdan ham o'chsin" (Hard Delete)
                await query("DELETE FROM task_comments WHERE task_id=$1", [id]);
                await query("DELETE FROM tasks WHERE id=$1", [id]);

                // Emit real-time event
                emitToUser(me.id, "task:deleted", { taskId: id });
                emitToRole("admin", "task:deleted", { taskId: id, userId: me.id });

                res.json({ ok: true });
            } catch (e) {
                next(e);
            }
        });

        tasksRouter.get("/:id/comments", async (req: any, res: any, next: any) => {
            try {
                const me = (req as any).user as { id: string; role: string };
                const id = req.params.id;

                const t = await query<any>("SELECT user_id FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
                if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
                if (t.rows[0].user_id !== me.id && me.role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

                const r = await query<{ items: any }>("SELECT items FROM task_comments WHERE task_id=$1 ORDER BY created_at ASC", [id]);
                let all: string[] = [];
                for (const row of r.rows) {
                    let list = row.items;
                    if (typeof list === 'string') {
                        try {
                            list = JSON.parse(list);
                        } catch { list = []; }
                    }
                    if (Array.isArray(list)) all.push(...list);
                }

                res.json({ items: all });
            } catch (e) {
                next(e);
            }
        });

        tasksRouter.put("/:id/comments", async (req: any, res: any, next: any) => {
            try {
                const me = (req as any).user as { id: string };
                const id = req.params.id;

                const body = mustParse(
                    z.object({
                        items: z.array(z.string().min(1).max(500)).min(1)
                    }),
                    req.body
                );

                const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
                if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
                const task = t.rows[0];
                if (task.user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });

                const date = task.visible_date;
                const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
                if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

                // REPLACE logic
                await query("DELETE FROM task_comments WHERE task_id=$1", [id]);

                const ins = await query<any>(
                    `INSERT INTO task_comments (task_id, user_id, items)
       VALUES ($1,$2,$3)
       RETURNING *`,
                    [id, me.id, JSON.stringify(body.items)]
                );

                const comment = ins.rows[0];

                // Emit real-time event
                emitToUser(me.id, "task:comments_updated", { taskId: id, items: body.items });
                emitToRole("admin", "task:comments_updated", { taskId: id, items: body.items, userId: me.id });

                res.json({ comment });
            } catch (e) {
                next(e);
            }
        });

        tasksRouter.post("/:id/comments", async (req: any, res: any, next: any) => {
            try {
                const me = (req as any).user as { id: string };
                const id = req.params.id;

                const body = mustParse(
                    z.object({
                        items: z.array(z.string().min(1).max(500)).min(1)
                    }),
                    req.body
                );

                const t = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
                if (!t.rows.length) return res.status(404).json({ error: "NOT_FOUND" });
                const task = t.rows[0];
                if (task.user_id !== me.id) return res.status(403).json({ error: "FORBIDDEN" });

                const date = task.visible_date;
                const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [date]);
                if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

                const ins = await query<any>(
                    `INSERT INTO task_comments (task_id, user_id, items)
       VALUES ($1,$2,$3)
       RETURNING *`,
                    [id, me.id, JSON.stringify(body.items)]
                );

                const comment = ins.rows[0];

                // Emit real-time event
                emitToUser(me.id, "task:comment_added", { taskId: id, comment });
                emitToRole("admin", "task:comment_added", { taskId: id, comment, userId: me.id });

                res.json({ comment });
            } catch (e) {
                next(e);
            }
        });

        // GET my report (for PDF)
        tasksRouter.get("/me/report", async (req: any, res: any, next: any) => {

            try {
                const qv = mustParse(
                    z.object({
                        start: zISODate,
                        end: zISODate
                    }),
                    req.query
                );
                const me = (req as any).user as { id: string; full_name: string };

                const r = await query<any>(
                    `SELECT t.*, u.full_name as worker_name,
               (SELECT COUNT(*)::int FROM task_comments WHERE task_id = t.id) as comment_count
             FROM tasks t
             JOIN users u ON t.user_id = u.id
             WHERE t.user_id = $1
               AND t.deleted_at IS NULL
               AND t.visible_date >= $2::date
               AND t.visible_date <= $3::date
             ORDER BY t.visible_date ASC, t.is_mandatory DESC, t.created_at ASC`,
                    [me.id, qv.start, qv.end]
                );

                // Grouping is simple here as it's only one worker
                const report = [{
                    worker_name: me.full_name,
                    tasks: r.rows.map(row => ({
                        ...row,
                        visible_date: row.visible_date instanceof Date
                            ? DateTime.fromJSDate(row.visible_date).setZone(APP_TZ).toISODate()
                            : row.visible_date
                    }))
                }];

                res.json({
                    start: qv.start,
                    end: qv.end,
                    data: report
                });
            } catch (e) {
                next(e);
            }
        });


