"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhoneDigits = normalizePhoneDigits;
exports.last4Digits = last4Digits;
function normalizePhoneDigits(input) {
    const digits = (input || "").replace(/\D/g, "");
    if (!digits)
        return "";
    // If user enters 901234567 (9 digits), assume Uzbekistan +998
    if (digits.length === 9)
        return `998${digits}`;
    // If user enters 12 digits like 998901234567, keep
    return digits;
}
function last4Digits(phoneDigits) {
    const d = normalizePhoneDigits(phoneDigits);
    return d.slice(-4);
}
