import React, { useMemo } from "react";
import MediumCalendar from "./MediumCalendar";

export default function MiniDayPicker({
    currentISO,
    onOpen
}: {
    currentISO: string;
    onOpen: () => void;
}) {
    const dayNumber = useMemo(() => Number(currentISO.slice(8, 10)), [currentISO]);

    return (
        <button className="miniDay" onClick={onOpen} title="Sana tanlash">
            {dayNumber}
        </button>
    );
}

// Re-export calendar for Header flow usage
MiniDayPicker.Calendar = MediumCalendar;
