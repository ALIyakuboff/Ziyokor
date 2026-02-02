import React, { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import ProgressRing from "./ProgressRing";
import TaskListMandatory from "./TaskListMandatory";
import TaskListNormal from "./TaskListNormal";
import TaskListCarryover from "./TaskListCarryover";
import { weekdayUz } from "../../utils/weekday";
import { formatDateShort } from "../../utils/date";

export default function DayCard9x16({
    dayISO,
    group,
    onRefresh
}: {
    dayISO: string;
    group: any;
    onPickDay: (iso: string) => void;
    onRefresh: () => void;
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

            <div className="dayCardBody">
                <div className="section">
                    <div className="sectionTitle">Majburiy ishlar</div>
                    <TaskListMandatory items={group?.mandatory || []} onRefresh={onRefresh} />
                </div>

                <div className="section">
                    <div className="sectionTitle">Mening ishlarim</div>
                    <TaskListNormal dayISO={dayISO} items={group?.normal || []} onRefresh={onRefresh} />
                </div>

                <div className="divider" />

                <div className="section">
                    <div className="sectionTitle red" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Kecha qolganlar <AlertCircle size={16} color="red" />
                    </div>
                    <TaskListCarryover items={group?.carryover || []} onRefresh={onRefresh} />
                </div>
            </div>
        </div>
    );
}
