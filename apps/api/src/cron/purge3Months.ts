import { query } from "../db";

// Delete data older than 3 months.
// We keep users + templates.
// We hard-delete tasks; comments are ON DELETE CASCADE.
export async function purge3MonthsJob() {
    const r = await query<{ cnt: number }>(
        `WITH deleted AS (
       DELETE FROM tasks
       WHERE created_at < (NOW() - INTERVAL '3 months')
       RETURNING 1
     )
     SELECT COUNT(*)::int AS cnt FROM deleted`
    );

    // optionally purge old day_closures too
    const r2 = await query<{ cnt: number }>(
        `WITH deleted AS (
       DELETE FROM day_closures
       WHERE date < (CURRENT_DATE - INTERVAL '3 months')
       RETURNING 1
     )
     SELECT COUNT(*)::int AS cnt FROM deleted`
    );

    console.log(`[job] purge3Months tasks_deleted=${r.rows[0]?.cnt || 0} day_closures_deleted=${r2.rows[0]?.cnt || 0}`);
    return { tasks_deleted: r.rows[0]?.cnt || 0, day_closures_deleted: r2.rows[0]?.cnt || 0 };
}
