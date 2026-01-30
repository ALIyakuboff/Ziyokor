const UZ = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export function weekdayUz(iso) {
    const d = new Date(iso + "T00:00:00");
    return UZ[d.getDay()];
}
