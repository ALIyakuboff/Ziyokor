import React, { useMemo, useState } from "react";
import MediumCalendar from "./MediumCalendar";

export default function WorkerMiniDayPicker({ currentISO, onPick }: { currentISO: string; onPick: (iso: string) => void }) {
    const dayNumber = useMemo(() => Number(currentISO.slice(8, 10)), [currentISO]);
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="miniDay" onClick={() => setOpen(true)} title="Sana tanlash">
                {dayNumber}
            </button>

            {open && (
                <MediumCalendar
                    initialISO={currentISO}
                    onClose={() => setOpen(false)}
                    onPick={(iso) => {
                        setOpen(false);
                        onPick(iso);
                    }}
                />
            )}
        </>
    );
}
