import { query } from "../db";

// Create daily mandatory tasks from active templates for given date.
// For MVP we implement "daily" only (recurrence_type='daily').
// You can extend weekly/custom later.
export async function generateMandatoryJob(date: string) {
    // fetch active templates
    const templates = await query<any>(
        `SELECT *
     FROM mandatory_task_templates
     WHERE is_active=true
       AND deleted_at IS NULL
       AND (start_date IS NULL OR start_date <= $1::date)
       AND (end_date IS NULL OR end_date >= $1::date)
       AND recurrence_type='daily'`,
        [date]
    );

    let created = 0;

    for (const tpl of templates.rows) {
        // if already exists for that template/date, skip
        const exists = await query(
            `SELECT id FROM tasks
       WHERE template_id=$1 AND assigned_date=$2::date
       LIMIT 1`,
            [tpl.id, date]
        );
        if (exists.rows.length) continue;

        await query(
            `INSERT INTO tasks
        (user_id, title, is_mandatory, status, assigned_date, visible_date,
         is_carryover, carryover_from_date, template_id, one_off_by_admin,
         created_by, created_by_id)
       VALUES
        ($1,$2,$3,'pending',$4,$4,false,NULL,$5,false,'admin',$6)
       ON CONFLICT (template_id, assigned_date) DO NOTHING`,
            [tpl.user_id, tpl.title, tpl.is_mandatory, date, tpl.id, tpl.created_by_admin_id]
        );
        created++;
    }

    console.log(`[job] generateMandatory date=${date} created=${created}`);
    return { created };
}
