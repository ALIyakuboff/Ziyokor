import { DateTime } from "luxon";
import { query } from "../db";
import { APP_TZ } from "../utils/date";

// Close day:
// - insert into day_closures if not exists
// - mandatory tasks (assigned_date=date) not done => missed (do not carryover)
// - worker tasks (is_mandatory=false) not done => carryover to tomorrow as red section by visible_date shift
export async function closeDayJob(date: string) {
    // ensure closure record exists
    await query(
        `INSERT INTO day_closures (date, closed_at, closed_by)
     VALUES ($1::date, NOW(), 'system')
     ON CONFLICT (date) DO NOTHING`,
        [date]
    );

    // mandatory missed (assigned_date=date)
    await query(
        `UPDATE tasks
     SET status='missed'
     WHERE deleted_at IS NULL
       AND is_mandatory=true
       AND assigned_date=$1::date
       AND status!='done'`,
        [date]
    );

    // carryover worker tasks (visible_date=date)
    const tomorrow = DateTime.fromISO(date, { zone: APP_TZ }).plus({ days: 1 }).toISODate()!;

    await query(
        `UPDATE tasks
     SET is_carryover=true,
         carryover_from_date=$1::date,
         visible_date=$2::date
     WHERE deleted_at IS NULL
       AND is_mandatory=false
       AND visible_date=$1::date
       AND status!='done'`,
        [date, tomorrow]
    );

    console.log(`[job] closeDay date=${date} -> tomorrow=${tomorrow}`);
    return { ok: true, date, tomorrow };
}
