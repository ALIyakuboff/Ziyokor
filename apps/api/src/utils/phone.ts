export function normalizePhoneDigits(input: string) {
    const digits = (input || "").replace(/\D/g, "");
    if (!digits) return "";
    // If user enters 901234567 (9 digits), assume Uzbekistan +998
    if (digits.length === 9) return `998${digits}`;
    // If user enters 12 digits like 998901234567, keep
    return digits;
}

export function last4Digits(phoneDigits: string) {
    const d = normalizePhoneDigits(phoneDigits);
    return d.slice(-4);
}
