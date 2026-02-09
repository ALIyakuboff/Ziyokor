import { query } from "../src/db";
import { syncCarryovers } from "../src/routes/tasks.routes";
import { DateTime } from "luxon";
import { APP_TZ, todayISO } from "../src/utils/date";

async function run() {
    try {
        console.log("--- Starting Verification ---");

        // 1. Create a dummy user
        const phone = "999999999";
        await query("DELETE FROM users WHERE phone_login=$1", [phone]);
        const u = await query<{ id: string }>(
            "INSERT INTO users (full_name, phone_login, password_hash, role, is_active) VALUES ('Test User', $1, 'hash', 'worker', true) RETURNING id",
            [phone]
        );
        const userId = u.rows[0].id;
        console.log("User created:", userId);

        // 2. Create a MANDATORY task for YESTERDAY
        const yesterday = DateTime.now().setZone(APP_TZ).minus({ days: 1 }).toISODate()!;
        const t1 = await query<{ id: string }>(
            "INSERT INTO tasks (user_id, title, is_mandatory, status, visible_date, assigned_date, created_by) VALUES ($1, 'Mandatory Yesterday', true, 'pending', $2, $2, 'admin') RETURNING id",
            [userId, yesterday]
        );
        console.log("Mandatory task created:", t1.rows[0].id, "for", yesterday);

        // 3. Run syncCarryovers
        console.log("Running syncCarryovers...");
        await syncCarryovers(userId);

        // 4. Verify task is 'missed' and visible_date is STILL yesterday
        const t1_check = await query<{ status: string, visible_date: string }>(
            "SELECT status, visible_date FROM tasks WHERE id=$1",
            [t1.rows[0].id]
        );
        const row = t1_check.rows[0];
        let vDate = row.visible_date;
        if (vDate instanceof Date) vDate = DateTime.fromJSDate(vDate).setZone(APP_TZ).toISODate()!;
        else if (typeof vDate === 'string' && vDate.includes('T')) vDate = DateTime.fromISO(vDate).setZone(APP_TZ).toISODate()!;

        console.log("Task 1 Check:", { status: row.status, visible_date: vDate });

        if (row.status === 'missed' && vDate === yesterday) {
            console.log("✅ SUCCESS: Mandatory task is missed and stayed on yesterday.");
        } else {
            console.error("❌ FAILURE: Mandatory task status or date is wrong.");
        }

        // 5. Test Comment in Reports
        // Create a task for today
        const today = todayISO();
        const t2 = await query<{ id: string }>(
            "INSERT INTO tasks (user_id, title, is_mandatory, status, visible_date, assigned_date, created_by) VALUES ($1, 'Report Task', false, 'done', $2, $2, 'worker') RETURNING id",
            [userId, today]
        );
        // Add comment
        const comments = ["First comment", "Latest comment for report"];
        await query(
            "INSERT INTO task_comments (task_id, user_id, items) VALUES ($1, $2, $3::jsonb)",
            [t2.rows[0].id, userId, JSON.stringify(comments)]
        );

        // Query using the REPORT query logic (simulated)
        const reportQuery = `
            SELECT t.title, 
            (SELECT items FROM task_comments WHERE task_id = t.id ORDER BY created_at DESC LIMIT 1) as comment_items
            FROM tasks t WHERE id = $1
        `;
        const r2 = await query<any>(reportQuery, [t2.rows[0].id]);
        const r2_row = r2.rows[0];

        let latest = "";
        try {
            let items = r2_row.comment_items;
            if (typeof items === 'string') items = JSON.parse(items);
            if (Array.isArray(items)) latest = items[items.length - 1];
        } catch (e) { }

        console.log("Report Comment Check:", { latest });

        if (latest === "Latest comment for report") {
            console.log("✅ SUCCESS: Report query fetched latest comment.");
        } else {
            console.error("❌ FAILURE: Report query did not fetch correct comment.");
        }

        // Cleanup
        await query("DELETE FROM users WHERE id=$1", [userId]);
        console.log("Cleanup done.");

    } catch (e: any) {
        console.error("Verification failed:", e);
    }
}

run();
