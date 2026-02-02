"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDayJob = closeDayJob;
const luxon_1 = require("luxon");
const db_1 = require("../db");
const date_1 = require("../utils/date");
// Close day:
// - insert into day_closures if not exists
// - mandatory tasks (assigned_date=date) not done => missed (do not carryover)
// - worker tasks (is_mandatory=false) not done => carryover to tomorrow as red section by visible_date shift
async function closeDayJob(date) {
    // ensure closure record exists
    await (0, db_1.query)(`INSERT INTO day_closures (date, closed_at, closed_by)
     VALUES ($1::date, NOW(), 'system')
     ON CONFLICT (date) DO NOTHING`, [date]);
    // mandatory missed (assigned_date=date)
    await (0, db_1.query)(`UPDATE tasks
     SET status='missed'
     WHERE deleted_at IS NULL
       AND is_mandatory=true
       AND assigned_date=$1::date
       AND status!='done'`, [date]);
    // carryover worker tasks (visible_date=date)
    const tomorrow = luxon_1.DateTime.fromISO(date, { zone: date_1.APP_TZ }).plus({ days: 1 }).toISODate();
    await (0, db_1.query)(`UPDATE tasks
     SET is_carryover=true,
         carryover_from_date=$1::date,
         visible_date=$2::date
     WHERE deleted_at IS NULL
       AND is_mandatory=false
       AND visible_date=$1::date
       AND status!='done'`, [date, tomorrow]);
    console.log(`[job] closeDay date=${date} -> tomorrow=${tomorrow}`);
    return { ok: true, date, tomorrow };
}
