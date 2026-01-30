const UZB_TZ = "Asia/Tashkent";
export function todayISO() {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: UZB_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    return formatter.format(new Date());
}
export function formatDateShort(iso) {
    // iso is YYYY-MM-DD. We just want DD.MM
    const [yyyy, mm, dd] = iso.split("-");
    return `${dd}.${mm}`;
}
export function getUzbHour() {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: UZB_TZ,
        hour: "numeric",
        hour12: false
    });
    return parseInt(formatter.format(new Date()), 10);
}
