import { query } from "../db";

// Create daily mandatory tasks from active templates for given date.
// For MVP we implement "daily" only (recurrence_type='daily').
// You can extend weekly/custom later.
export async function generateMandatoryJob(date: string) {
    try {
        // Bulk insert tasks from active templates for the given date
        // Uses ON CONFLICT (template_id, assigned_date) DO NOTHING to skip existing ones
        const result = await query(
            `INSERT INTO tasks
                (user_id, title, is_mandatory, status, assigned_date, visible_date, 
                 template_id, created_by, one_off_by_admin)
             SELECT 
                user_id, title, is_mandatory, 'pending', $1::date, $1::date, 
                id, 'admin', false
             FROM mandatory_task_templates
             WHERE is_active = true 
               AND deleted_at IS NULL
               AND (start_date IS NULL OR start_date <= $1::date)
               AND (end_date IS NULL OR end_date >= $1::date)
               AND recurrence_type = 'daily'
             ON CONFLICT (template_id, assigned_date) DO NOTHING`,
            [date]
        );

        const created = result.rowCount || 0;
        console.log(`[job] generateMandatory date=${date} status=success created=${created}`);
        return { created };
    } catch (err: any) {
        console.error(`[job] Error in generateMandatoryJob for date=${date}:`, err.message);
        return { created: 0 };
    }
}

