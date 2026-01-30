import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import MediumCalendar from "./MediumCalendar";
export default function MiniDayPicker({ currentISO, onOpen }) {
    const dayNumber = useMemo(() => Number(currentISO.slice(8, 10)), [currentISO]);
    return (_jsx("button", { className: "miniDay", onClick: onOpen, title: "Sana tanlash", children: dayNumber }));
}
// Re-export calendar for Header flow usage
MiniDayPicker.Calendar = MediumCalendar;
