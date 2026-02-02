"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_TZ = void 0;
exports.todayISO = todayISO;
exports.toISODate = toISODate;
exports.parseISODate = parseISODate;
exports.weekStartMon = weekStartMon;
exports.weekDaysMonToSat = weekDaysMonToSat;
exports.getMonthRange = getMonthRange;
exports.getYearRange = getYearRange;
const luxon_1 = require("luxon");
exports.APP_TZ = "Asia/Tashkent";
// YYYY-MM-DD
function todayISO() {
    return luxon_1.DateTime.now().setZone(exports.APP_TZ).toISODate();
}
function toISODate(d) {
    return d.setZone(exports.APP_TZ).toISODate();
}
function parseISODate(dateStr) {
    const d = luxon_1.DateTime.fromISO(dateStr, { zone: exports.APP_TZ });
    if (!d.isValid)
        return null;
    return d;
}
// Week = Dushanba–Shanba (6 days)
function weekStartMon(dateStr) {
    let d = parseISODate(dateStr);
    if (!d)
        return null;
    // If Sunday (7), move to next Monday (1)
    if (d.weekday === 7) {
        d = d.plus({ days: 1 });
    }
    // Luxon weekday: Monday=1 ... Sunday=7
    const delta = d.weekday - 1;
    return d.minus({ days: delta }).startOf("day");
}
// Returns the Mon-Sat block for the week containing anchorDate
function weekDaysMonToSat(anchorDate) {
    const start = weekStartMon(anchorDate);
    if (!start)
        return null;
    const days = [];
    for (let i = 0; i < 6; i++) {
        days.push(toISODate(start.plus({ days: i })));
    }
    return days;
}
// Month range: First day of month to last day of month
function getMonthRange(anchorDate) {
    const d = parseISODate(anchorDate);
    if (!d)
        return null;
    const start = d.startOf("month");
    const end = d.endOf("month");
    return { start, end };
}
// Year range: First day of year to last day of year
function getYearRange(anchorDate) {
    const d = parseISODate(anchorDate);
    if (!d)
        return null;
    const start = d.startOf("year");
    const end = d.endOf("year");
    return { start, end };
}
