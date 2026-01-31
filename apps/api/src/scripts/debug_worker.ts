import { config } from "dotenv";
config({ path: "../../.env" });
import { query } from "../db";
import { weekDaysMonToSat, todayISO, APP_TZ } from "../utils/date";
import { syncCarryovers } from "../routes/tasks.routes";
import { DateTime } from "luxon";

async function run() {
    try {
        console.log("Searching for worker 42703...");
        const users = await query("SELECT id, full_name FROM users WHERE phone_login = '42703' OR full_name LIKE '%42703%'");
        if (users.rows.length === 0) {
            console.log("Worker 42703 NOT FOUND in DB.");
            return;
        }

        const worker = users.rows[0];
        console.log(`Found worker: ${worker.full_name} (${worker.id})`);

        console.log("Running syncCarryovers...");
        await syncCarryovers(worker.id);
        console.log("Sync done.");

        const anchor = todayISO();
        const days = weekDaysMonToSat(anchor);
        if (!days) throw new Error("Invalid days generated");
        console.log(`Days: ${days.join(", ")}`);

        console.log("Fetching tasks...");
        const r = await query(
            `SELECT t.*, (SELECT COUNT(*)::int FROM task_comments WHERE task_id = t.id) as comment_count
       FROM tasks t
       WHERE t.user_id=$1 AND t.visible_date = ANY($2::date[])
         AND t.deleted_at IS NULL
       ORDER BY t.created_at ASC`,
            [worker.id, days]
        );

        console.log(`Found ${r.rows.length} tasks.`);

        const grouped: any = {};
        for (const d of days) {
            grouped[d] = { mandatory: [], normal: [], project: [], carryover: [] };
        }

        for (const t of r.rows) {
            const d = DateTime.fromJSDate(t.visible_date).setZone(APP_TZ).toISODate();
            if (!grouped[d]) {
                console.log(`Warning: Task date ${d} not in week days`);
                continue;
            }
            if (t.is_project) {
                console.log(`[Project Task] ${t.title} on ${d}`);
                grouped[d].project.push(t);
            } else {
                console.log(`[Normal Task] ${t.title} on ${d}`);
                grouped[d].normal.push(t);
            }
        }

        console.log("Grouping successful.");
        console.log(JSON.stringify(grouped, null, 2));

    } catch (e: any) {
        console.error("ERROR DETECTED:", e);
    }
}

run().then(() => process.exit(0));
