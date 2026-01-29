import React, { useEffect, useState, useCallback } from "react";
import SimpleBarChart, { ChartPoint } from "./SimpleBarChart";
import { getAnalytics } from "../../api/admin";
import { onTaskCompleted, offTaskCompleted, onTaskCreated, offTaskCreated, onTaskDeleted, offTaskDeleted, onTaskStarted, offTaskStarted, onTaskCommentAdded, offTaskCommentAdded } from "../../socket";

export default function ComplianceChart({ range, anchor, workerId }: { range: "week" | "month" | "year"; anchor: string; workerId?: string }) {
    const [points, setPoints] = useState<ChartPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState(0);

    const load = useCallback(() => {
        setLoading(true);
        getAnalytics(range, anchor, workerId)
            .then(res => {
                if (res.series) {
                    const pts = res.series.map((s: any) => ({
                        label: s.label,
                        value: s.mandatory_compliance
                    }));
                    setPoints(pts);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [range, anchor, workerId]);

    useEffect(() => {
        load();
    }, [load, version]);

    useEffect(() => {
        const refresh = () => setVersion(v => v + 1);
        onTaskCreated(refresh);
        onTaskStarted(refresh);
        onTaskCompleted(refresh);
        onTaskDeleted(refresh);
        onTaskCommentAdded(refresh);

        return () => {
            offTaskCreated(refresh);
            offTaskStarted(refresh);
            offTaskCompleted(refresh);
            offTaskDeleted(refresh);
            offTaskCommentAdded(refresh);
        };
    }, []);

    if (loading && points.length === 0) return <div className="muted small">Yuklanmoqda...</div>;

    return (
        <div style={{ position: 'relative' }}>
            <SimpleBarChart points={points} />
        </div>
    );
}
