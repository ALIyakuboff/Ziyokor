import React, { useMemo, useState } from "react";

function toISO(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function MediumCalendar({
    initialISO,
    onPick,
    onClose
}: {
    initialISO: string;
    onPick: (iso: string) => void;
    onClose: () => void;
}) {
    const initial = new Date(initialISO + "T00:00:00");
    const [year, setYear] = useState(initial.getFullYear());
    const [month, setMonth] = useState(initial.getMonth()); // 0-11

    const grid = useMemo(() => {
        const first = new Date(year, month, 1);
        const startDay = (first.getDay() + 6) % 7; // Monday=0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells: (Date | null)[] = [];
        for (let i = 0; i < startDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [year, month]);

    const monthName = useMemo(() => {
        const names = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
        return names[month];
    }, [month]);

    return (
        <div className="modalOverlay" onMouseDown={onClose} role="dialog" aria-modal="true">
            <div className="calendarBox" onMouseDown={(e) => e.stopPropagation()}>
                <div className="calHeader">
                    <button className="btn mini" onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}>
                        ←
                    </button>
                    <div className="calTitle">
                        {monthName} {year}
                    </div>
                    <button className="btn mini" onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}>
                        →
                    </button>
                </div>

                <div className="calWeek">
                    {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((x) => (
                        <div key={x} className="calW">
                            {x}
                        </div>
                    ))}
                </div>

                <div className="calGrid">
                    {grid.map((d, i) => {
                        if (!d) return <div key={i} className="calCell empty" />;
                        return (
                            <button
                                key={i}
                                className="calCell"
                                onClick={() => onPick(toISO(d))}
                                title={toISO(d)}
                            >
                                {d.getDate()}
                            </button>
                        );
                    })}
                </div>

                <div className="calFooter">
                    <button className="btn" onClick={onClose}>
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    );
}
