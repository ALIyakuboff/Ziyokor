```
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authRequired, roleRequired } from "../auth";
import { mustParse, zISODate } from "../utils/validate";
import { query } from "../db";
import { todayISO, weekDaysMonToSat, APP_TZ } from "../utils/date";
import { DateTime } from "luxon";

// Socket.IO is optional (not available in serverless)
let emitToUser: any = () => {};
try {
    const socketModule = require("../socket");
    emitToUser = socketModule.emitToUser;
} catch (e) {
    console.log("[admin] Socket.IO not available (serverless mode)");
}
import { syncCarryovers } from "./tasks.routes";
import { generateMandatoryJob } from "../cron/generateMandatory";

export const adminRouter = Router();

adminRouter.use(authRequired);

// Create Recurring Task Template (Continuing Mandatory)
adminRouter.post("/templates", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const body = mustParse(
            z.object({
                titles: z.array(z.string().min(1)).min(1),
                user_ids: z.array(z.string().uuid()).min(1),
                is_mandatory: z.boolean().default(true),
                recurrence: z.enum(["daily"]).default("daily")
            }),
            req.body
        );

        const me = (req as any).user;
        let createdCount = 0;

        for (const uid of body.user_ids) {
            for (const title of body.titles) {
                await query(
                    `INSERT INTO mandatory_task_templates
    (user_id, title, recurrence_type, is_active, created_by_admin_id, is_mandatory)
VALUES($1, $2, $3, true, $4, $5)`,
                    [uid, title, body.recurrence, me.id, body.is_mandatory]
                );
                createdCount++;
            }
        }

        // OPTIONAL: Immediately generate tasks for TODAY if they don't exist?
        // The user implied "click -> appearence". 
        // If we only wait for cron (08:00), they won't see it today.
        // Let's manually trigger generation for today for these specific users/templates?
        // Or just re-run the daily generator safely (it skips duplicates).
        const today = todayISO();
        await generateMandatoryJob(today);
        // generateMandatoryJob imports are in cron folder. 
        // We can import it here.

        res.json({ ok: true, created: createdCount });
    } catch (e) {
        next(e);
    }
});
// requireRole("admin") will be applied per-route or after analytics if we wanted, 
// but easier to keep it on individual routes for now if we want one route public-ish to workers.
// Actually, let's keep adminRouter for admins mostly.
// Better: Move analytics to tasks.routes.ts and make it robust there.

// Workers list (faqat ism)
adminRouter.get("/workers", requireRole("admin"), async (_req: any, res: any, next: any) => {
    try {
        const r = await query<{ id: string; full_name: string }>(
            "SELECT id, full_name FROM users WHERE (role='worker' OR role='admin') AND is_active=true ORDER BY full_name ASC"
        );
        res.json({ workers: r.rows });
    } catch (e) {
        next(e);
    }
});

// Create worker (password = last4)
adminRouter.post("/workers", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const body = mustParse(
            z.object({
                full_name: z.string().min(2).max(120),
                phone_login: z.string().min(7).max(30)
            }),
            req.body
        );

        const phone = normalizePhoneDigits(body.phone_login);
        if (!phone || phone.length < 4) return res.status(400).json({ error: "INVALID_PHONE" });

        const exists = await query("SELECT id FROM users WHERE phone_login=$1 LIMIT 1", [phone]);
        if (exists.rows.length) return res.status(409).json({ error: "PHONE_ALREADY_EXISTS" });

        const pwd = last4Digits(phone);
        const hash = await bcrypt.hash(pwd, 10);

        const ins = await query<any>(
            `INSERT INTO users(full_name, phone_login, password_hash, role, is_active)
VALUES($1, $2, $3, 'worker', true)
       RETURNING id, full_name, phone_login, role, is_active`,
            [body.full_name, phone, hash]
        );

        // Only return initial password at creation time
        res.json({ worker: ins.rows[0], initial_password_last4: pwd });
    } catch (e) {
        next(e);
    }
});

// Deactivate worker
adminRouter.patch("/workers/:id/deactivate", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const id = req.params.id;
        await query("UPDATE users SET is_active=false WHERE id=$1", [id]);
        res.json({ ok: true });
    } catch (e) {
        next(e);
    }
});

// Admin: worker week view (6 cards)
adminRouter.get("/workers/:id/week", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const workerId = req.params.id;
        const anchor = (req.query.anchor as string) || undefined;
        const date = anchor && /^\d{4}-\d{2}-\d{2}$/.test(anchor) ? anchor : undefined;
        const days = weekDaysMonToSat(date || todayISO());
        if (!days) return res.status(400).json({ error: "INVALID_DATE" });

        const u = await query<{ id: string; full_name: string }>("SELECT id, full_name FROM users WHERE id=$1 LIMIT 1", [workerId]);
        if (!u.rows.length) return res.status(404).json({ error: "WORKER_NOT_FOUND" });

        await syncCarryovers(workerId);

        const r = await query<any>(
            `SELECT t.*, (SELECT COUNT(*)::int FROM task_comments WHERE task_id = t.id) as comment_count
       FROM tasks t
       WHERE t.user_id = $1 AND t.visible_date = ANY($2:: date[])
         AND t.deleted_at IS NULL
       ORDER BY t.visible_date ASC,
    CASE
           WHEN t.is_mandatory THEN 1
           WHEN t.is_carryover THEN 3
           ELSE 2
         END ASC,
    t.created_at ASC`,
            [workerId, days]
        );

        const grouped: Record<
            string,
            { mandatory: any[]; normal: any[]; project: any[]; carryover: any[]; progress: { done: number; total: number; percent: number } }
        > = {};
        for (const d of days) {
            grouped[d] = { mandatory: [], normal: [], project: [], carryover: [], progress: { done: 0, total: 0, percent: 0 } };
        }

        for (const t of r.rows) {
            const d = t.visible_date;
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

        res.json({ worker: u.rows[0], anchor: date || null, days, data: grouped });
    } catch (e) {
        next(e);
    }
});

// Admin: one-off mandatory create (for a specific day)
adminRouter.post("/mandatory/one-off", async (req: any, res: any, next: any) => {
    try {
        const body = mustParse(
            z.object({
                user_id: z.string().min(1),
                title: z.string().min(1).max(200),
                date: zISODate
            }),
            req.body
        );

        const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [body.date]);
        if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

        const ins = await query<any>(
            `INSERT INTO tasks
    (user_id, title, is_mandatory, status, assigned_date, visible_date,
        is_carryover, carryover_from_date, template_id, one_off_by_admin,
        created_by, created_by_id)
VALUES
    ($1, $2, true, 'pending', $3, $3, false, NULL, NULL, true, 'admin', NULL)
RETURNING * `,
            [body.user_id, body.title, body.date]
        );

        const task = ins.rows[0];

        // Emit real-time event to the worker
        emitToUser(body.user_id, "task:created", { task });

        res.json({ task });
    } catch (e) {
        next(e);
    }
});

// Admin: delete task (soft delete) - restricted to today and future
adminRouter.delete("/tasks/:id", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const id = req.params.id;
        const today = todayISO();

        // Get task info before deleting
        const taskResult = await query<any>("SELECT * FROM tasks WHERE id=$1 AND deleted_at IS NULL LIMIT 1", [id]);
        const task = taskResult.rows[0];

        if (!task) return res.status(404).json({ error: "TASK_NOT_FOUND" });

        // Normalize task date for comparison
        let taskDate = task.visible_date;
        if (taskDate instanceof Date) {
            taskDate = DateTime.fromJSDate(taskDate).setZone(APP_TZ).toISODate();
        }

        // Restriction: Only delete today or future
        if (taskDate < today) {
            return res.status(403).json({ error: "CANNOT_DELETE_PAST_TASKS" });
        }

        await query(`UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);

        // Emit real-time event to the task owner
        emitToUser(task.user_id, "task:deleted", { taskId: id });

        res.json({ ok: true });
    } catch (e) {
        next(e);
    }
});

// Admin: project task create
adminRouter.post("/project-task", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const body = mustParse(
            z.object({
                user_id: z.string().min(1),
                title: z.string().min(1).max(200),
                date: zISODate
            }),
            req.body
        );

        const closed = await query("SELECT date FROM day_closures WHERE date=$1 LIMIT 1", [body.date]);
        if (closed.rows.length) return res.status(403).json({ error: "DAY_CLOSED" });

        const ins = await query<any>(
            `INSERT INTO tasks
    (user_id, title, is_mandatory, is_project, status, assigned_date, visible_date,
        is_carryover, carryover_from_date, template_id, one_off_by_admin,
        created_by, created_by_id)
VALUES
    ($1, $2, false, true, 'pending', $3, $3, false, NULL, NULL, true, 'admin', NULL)
RETURNING * `,
            [body.user_id, body.title, body.date]
        );

        const task = ins.rows[0];

        // Emit real-time event to the worker
        emitToUser(body.user_id, "task:created", { task });

        res.json({ task });
    } catch (e) {
        next(e);
    }
});

/**
 * ✅ NEW: Analytics endpoint for charts
 * GET /admin/analytics?range=week|month|year&anchor=YYYY-MM-DD
 *
 * Returns:
 * {
 *   range, anchor,
 *   series: [{ label, start, end, completion_rate, mandatory_compliance, missed, carryover_open, done, total, mandatory_done, mandatory_total }],
 *   totals: { ...same aggregated... }
 * }
 */
adminRouter.get("/analytics", async (req: any, res: any, next: any) => {
    console.log("!!! HIT ANALYTICS ROUTE !!!");
    try {
        const me = (req as any).user as { id: string; role: string };

        const qv = mustParse(
            z.object({
                range: z.enum(["week", "month", "year"]),
                anchor: zISODate.optional(),
                workerId: z.string().uuid().optional()
            }),
            { range: req.query.range, anchor: req.query.anchor, workerId: req.query.workerId }
        );

        // ROLE ISOLATION:
        // If worker, force workerId = me.id
        // If admin, keep qv.workerId as is (aggregate if missing)
        let targetWorkerId = qv.workerId;
        if (me.role !== 'admin') {
            targetWorkerId = me.id;
        } else if (targetWorkerId === 'all') {
            targetWorkerId = undefined;
        }

        const anchorISO = qv.anchor || todayISO();
        const anchorDT = DateTime.fromISO(anchorISO, { zone: APP_TZ });
        if (!anchorDT.isValid) return res.status(400).json({ error: "INVALID_DATE" });

        const range = qv.range;

        // Sync carryovers for the target worker before calculating analytics
        if (targetWorkerId) {
            await syncCarryovers(targetWorkerId);
        }

        // Build buckets for series
        const buckets: { label: string; start: string; end: string }[] = [];

        if (range === "week") {
            // 6 workdays: Mon..Sat
            const days = weekDaysMonToSat(anchorISO);
            if (!days) return res.status(400).json({ error: "INVALID_DATE" });
            const shortDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
            for (let i = 0; i < days.length; i++) {
                buckets.push({ label: shortDays[i], start: days[i], end: days[i] });
            }
        }

        if (range === "month") {
            // Month buckets by week-of-month (W1..W5/6) but only Mon..Sat days included in metrics
            const first = anchorDT.startOf("month");
            const last = anchorDT.endOf("month");

            // create W1..W6 based on day-of-month ranges: 1-7,8-14,...
            // This is simple + stable for UI.
            const maxDay = last.day;
            const weeks = Math.ceil(maxDay / 7);
            for (let w = 1; w <= weeks; w++) {
                const startDay = (w - 1) * 7 + 1;
                const endDay = Math.min(w * 7, maxDay);
                const s = first.set({ day: startDay }).toISODate()!;
                const e = first.set({ day: endDay }).toISODate()!;
                buckets.push({ label: `W${ w } `, start: s, end: e });
            }
        }

        if (range === "year") {
            // Month buckets: Jan..Dec
            const yearStart = anchorDT.startOf("year");
            for (let m = 1; m <= 12; m++) {
                const sdt = yearStart.set({ month: m }).startOf("month");
                const edt = yearStart.set({ month: m }).endOf("month");
                buckets.push({
                    label: sdt.toFormat("LLL"),
                    start: sdt.toISODate()!,
                    end: edt.toISODate()!
                });
            }
        }

        // Helper to compute metrics for a date range [start..end], but only Mon..Sat
        // 1. Determine global range from buckets
        if (buckets.length === 0) {
            return res.json({ range: qv.range, anchor: anchorISO, series: [], totals: { done: 0, total: 0, completion_rate: 0, mandatory_compliance: 0, missed: 0, carryover_open: 0 } });
        }

        const globalStart = buckets[0].start;
        const globalEnd = buckets[buckets.length - 1].end;

        // 2. Fetch all raw tasks for this range (+ buffer for safety)
        const sql = `
            SELECT title, status, is_mandatory, visible_date, assigned_date
            FROM tasks
            WHERE deleted_at IS NULL
              AND visible_date >= $1:: date - INTERVAL '2 days' 
              AND visible_date <= $2:: date + INTERVAL '2 days'
            ${ targetWorkerId ? 'AND user_id=$3' : '' }
`;

        const params: any[] = [globalStart, globalEnd];
        if (targetWorkerId) params.push(targetWorkerId);

        const raw = await query<any>(sql, params);

        // 3. Normalize dates in JS (Critical Step: MATCH Card View Logic)
        const tasks = raw.rows.map(t => {
            let vDate = t.visible_date;
            // Normalize visible_date to YYYY-MM-DD in APP_TZ
            if (vDate instanceof Date) {
                vDate = DateTime.fromJSDate(vDate).setZone(APP_TZ).toISODate();
            } else if (typeof vDate === 'string') {
                if (vDate.includes('T')) {
                    vDate = DateTime.fromISO(vDate).setZone(APP_TZ).toISODate();
                }
                // If it's already "YYYY-MM-DD", it stays as is
            }

            let aDate = t.assigned_date;
            if (aDate instanceof Date) {
                aDate = DateTime.fromJSDate(aDate).setZone(APP_TZ).toISODate();
            } else if (typeof aDate === 'string' && aDate.includes('T')) {
                aDate = DateTime.fromISO(aDate).setZone(APP_TZ).toISODate();
            }
            const normalized = { ...t, visible_date: vDate, assigned_date: aDate };
            // console.log(`[TASKS_NORM] Title: ${ t.title }, Date: ${ vDate }, Status: ${ t.status } `);
            return normalized;
        });

        // 4. Aggregate
        const series = buckets.map(bucket => {
            const relevantTasks = tasks.filter(t => t.visible_date >= bucket.start && t.visible_date <= bucket.end);

            const normalTasks = relevantTasks.filter(t => !t.is_mandatory);
            const total = normalTasks.length;
            const done = normalTasks.filter(t => t.status === 'done').length;
            const prodRate = total > 0 ? Math.round((done / total) * 100) : 0;

            const mandTasks = relevantTasks.filter(t => t.is_mandatory);
            const mandTotal = mandTasks.length;
            const mandDone = mandTasks.filter(t => t.status === 'done').length;
            if (relevantTasks.length > 0) {
                console.log(`[DEBUG_BUCKET] ${ bucket.label } (${ bucket.start } - ${ bucket.end }): Found ${ relevantTasks.length } tasks`);
                relevantTasks.forEach(t => console.log(`   - Task: ${ t.title }, Date: ${ t.visible_date }, Status: ${ t.status }, Mand: ${ t.is_mandatory } `));
            }

            const compRate = mandTotal > 0 ? Math.round((mandDone / mandTotal) * 100) : 0;

            console.log(`[analytics - js] ${ bucket.label } (${ bucket.start }): done = ${ done } /${total}, mand=${mandDone}/${ mandTotal } `);

            return {
                label: bucket.label,
                start: bucket.start,
                end: bucket.end,
                done,
                total,
                completion_rate: prodRate,
                mandatory_done: mandDone,
                mandatory_total: mandTotal,
                mandatory_compliance: compRate,
                missed: 0,
                carryover_open: 0
            };
        });

        // 5. Totals (Decoupled)
        const total_normal_done = series.reduce((sum, s) => sum + s.done, 0);
        const total_normal = series.reduce((sum, s) => sum + s.total, 0);
        const avg_completion = total_normal > 0 ? Math.round((total_normal_done / total_normal) * 100) : 0;

        const total_mand_done = series.reduce((sum, s) => sum + s.mandatory_done, 0);
        const total_mand = series.reduce((sum, s) => sum + s.mandatory_total, 0);
        const avg_compliance = total_mand > 0 ? Math.round((total_mand_done / total_mand) * 100) : 0;

        const totals = {
            done: total_normal_done,
            total: total_normal,
            mandatory_done: total_mand_done,
            mandatory_total: total_mand,
            completion_rate: avg_completion,
            mandatory_compliance: avg_compliance,
            missed: 0,
            carryover_open: 0
        };

        res.json({ range, anchor: anchorISO, series, totals });
    } catch (e) {
        next(e);
    }
});

/**
 * ✅ NEW: Full report data for PDF
 * GET /admin/reports/full?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
adminRouter.get("/reports/full", requireRole("admin"), async (req: any, res: any, next: any) => {
    try {
        const qv = mustParse(
            z.object({
                start: zISODate,
                end: zISODate
            }),
            req.query
        );

        // Fetch all non-deleted tasks for all workers in range
        // Join with users to get full_name
        const r = await query<any>(
            `SELECT t.*, u.full_name as worker_name,
    (SELECT COUNT(*)::int FROM task_comments WHERE task_id = t.id) as comment_count
             FROM tasks t
             JOIN users u ON t.user_id = u.id
             WHERE t.deleted_at IS NULL
               AND t.visible_date >= $1:: date
               AND t.visible_date <= $2:: date
             ORDER BY u.full_name ASC, t.visible_date ASC, t.is_mandatory DESC, t.created_at ASC`,
            [qv.start, qv.end]
        );

        // Group by worker for easier frontend processing
        const report: Record<string, { worker_name: string; tasks: any[] }> = {};
        for (const row of r.rows) {
            const uid = row.user_id;
            if (!report[uid]) {
                report[uid] = { worker_name: row.worker_name, tasks: [] };
            }
            // Normalize date for JSON
            if (row.visible_date instanceof Date) {
                row.visible_date = DateTime.fromJSDate(row.visible_date).setZone(APP_TZ).toISODate();
            }
            report[uid].tasks.push(row);
        }

        res.json({
            start: qv.start,
            end: qv.end,
            data: Object.values(report)
        });
    } catch (e) {
        next(e);
    }
});
