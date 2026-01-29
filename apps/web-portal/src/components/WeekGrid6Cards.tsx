import React from "react";
import DayCard9x16 from "./DayCard9x16";

export default function WeekGrid6Cards({
    days,
    data,
    onDelete
}: {
    days: string[];
    data: Record<string, any>;
    onDelete?: (taskId: string) => void;
}) {
    return (
        <div className="weekGrid">
            {days.map((d) => (
                <DayCard9x16
                    key={d}
                    dayISO={d}
                    group={data[d] || { mandatory: [], normal: [], carryover: [], progress: { done: 0, total: 0, percent: 0 } }}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
