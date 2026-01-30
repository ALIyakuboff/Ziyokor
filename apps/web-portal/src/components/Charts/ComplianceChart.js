import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import SimpleBarChart from "./SimpleBarChart";
import { getAnalytics } from "../../api/admin";
import { onTaskCompleted, offTaskCompleted, onTaskCreated, offTaskCreated, onTaskDeleted, offTaskDeleted, onTaskStarted, offTaskStarted, onTaskCommentAdded, offTaskCommentAdded } from "../../socket";
export default function ComplianceChart({ range, anchor, workerId }) {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState(0);
    const load = useCallback(() => {
        setLoading(true);
        getAnalytics(range, anchor, workerId)
            .then(res => {
            if (res.series) {
                const pts = res.series.map((s) => ({
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
    if (loading && points.length === 0)
        return _jsx("div", { className: "muted small", children: "Yuklanmoqda..." });
    return (_jsx("div", { style: { position: 'relative' }, children: _jsx(SimpleBarChart, { points: points }) }));
}
