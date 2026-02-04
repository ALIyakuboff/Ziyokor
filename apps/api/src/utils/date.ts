import { DateTime } from "luxon";

export const APP_TZ = "Asia/Tashkent";

// YYYY-MM-DD
export function todayISO() {
    return DateTime.now().setZone(APP_TZ).toISODate()!;
}

export function getUzbHour() {
    return DateTime.now().setZone(APP_TZ).hour;
}

export function toISODate(d: DateTime) {
    return d.setZone(APP_TZ).toISODate()!;
}

export function parseISODate(dateStr: string) {
    const d = DateTime.fromISO(dateStr, { zone: APP_TZ });
    if (!d.isValid) return null;
    return d;
}

// Week = Dushanba–Shanba (6 days)
export function weekStartMon(dateStr: string) {
    let d = parseISODate(dateStr);
    if (!d) return null;

    // If Sunday (7), move to next Monday (1)
    if (d.weekday === 7) {
        d = d.plus({ days: 1 });
    }

    // Luxon weekday: Monday=1 ... Sunday=7
    const delta = d.weekday - 1;
    return d.minus({ days: delta }).startOf("day");
}

// Returns the Mon-Sat block for the week containing anchorDate
export function weekDaysMonToSat(anchorDate: string) {
    const start = weekStartMon(anchorDate);
    if (!start) return null;

    const days: string[] = [];
    for (let i = 0; i < 6; i++) {
        days.push(toISODate(start.plus({ days: i })));
    }
    return days;
}

// Month range: First day of month to last day of month
export function getMonthRange(anchorDate: string) {
    const d = parseISODate(anchorDate);
    if (!d) return null;
    const start = d.startOf("month");
    const end = d.endOf("month");
    return { start, end };
}

// Year range: First day of year to last day of year
export function getYearRange(anchorDate: string) {
    const d = parseISODate(anchorDate);
    if (!d) return null;
    const start = d.startOf("year");
    const end = d.endOf("year");
    return { start, end };
}
