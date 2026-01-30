import React, { useMemo } from "react";
import { weekdayUz } from "../utils/weekday";
import { formatDateShort } from "../utils/date";
import ProgressRing from "./ProgressRing";
import TaskBlock from "./TaskBlock";

export default function DayCard9x16({
    dayISO,
    group,
    onDelete
}: {
    dayISO: string;
    group: any;
    onDelete?: (taskId: string) => void;
}) {
    const weekday = useMemo(() => weekdayUz(dayISO), [dayISO]);
    return (
        <div className="dayCard">
            <div className="dayHeader">
                <div>
                    <div className="dayTitle">{weekday}</div>
                    <div className="muted">{formatDateShort(dayISO)}</div>
                </div>
                <ProgressRing percent={group?.progress?.percent || 0} />
            </div>

            <div className="section">
                <div className="sectionTitle">Majburiy ishlar</div>
                <TaskBlock items={group?.mandatory || []} tone="normal" onDelete={onDelete} />
            </div>

            <div className="section">
                <div className="sectionTitle">Oddiy ishlar</div>
                <TaskBlock items={group?.normal || []} tone="normal" onDelete={onDelete} />
            </div>

            <div className="divider" />

            <div className="section">
                <div className="sectionTitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Carryover <AlertCircle size={16} color="red" />
                </div>
                <TaskBlock items={group?.carryover || []} tone="danger" onDelete={onDelete} />
            </div>
        </div>
    );
}
