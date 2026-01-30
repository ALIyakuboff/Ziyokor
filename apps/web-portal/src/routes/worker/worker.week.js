import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import WorkerHeader3Panel from "../../components/worker/WorkerHeader3Panel";
import { useSession } from "../../state/session";
import { todayISO } from "../../utils/date";
import WeekSwiper6Cards from "../../components/worker/WeekSwiper6Cards";
import { onTaskCreated, onTaskStarted, onTaskCompleted, onTaskDeleted, offTaskCreated, offTaskStarted, offTaskCompleted, offTaskDeleted } from "../../socket";
import { getMyWeek } from "../../api/tasks";
export default function WorkerWeekRoute({ mode }) {
    const { logout, user } = useSession();
    const anchorFromHash = useMemo(() => {
        const h = window.location.hash || "";
        const q = h.split("?")[1] || "";
        const params = new URLSearchParams(q);
        return params.get("anchor") || params.get("date") || todayISO();
    }, []);
    const [anchor, setAnchor] = useState(anchorFromHash);
    const [days, setDays] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    async function reload(a = anchor, silent = false) {
        if (!silent)
            setLoading(true);
        setErr(null);
        try {
            const res = await getMyWeek(a);
            setAnchor(res.anchor || a);
            setDays(res.days);
            setData(res.data);
        }
        catch (e) {
            setErr(e?.message || "Xato");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        reload(anchorFromHash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const handleTaskCreated = () => reload(anchor, true);
        const handleTaskStarted = () => reload(anchor, true);
        const handleTaskCompleted = () => reload(anchor, true);
        const handleTaskDeleted = () => reload(anchor, true);
        onTaskCreated(handleTaskCreated);
        onTaskStarted(handleTaskStarted);
        onTaskCompleted(handleTaskCompleted);
        onTaskDeleted(handleTaskDeleted);
        return () => {
            offTaskCreated(handleTaskCreated);
            offTaskStarted(handleTaskStarted);
            offTaskCompleted(handleTaskCompleted);
            offTaskDeleted(handleTaskDeleted);
        };
    }, [anchor]);
    return (_jsxs("div", { className: "screen", children: [_jsx(WorkerHeader3Panel, { anchor: anchor, onPickDate: (iso) => {
                    setAnchor(iso);
                    window.location.hash = `#/week?anchor=${encodeURIComponent(iso)}`;
                    reload(iso);
                } }), loading && _jsx("div", { className: "center muted", children: "Yuklanmoqda..." }), err && _jsx("div", { className: "center error", children: err }), !loading && data && (_jsx(WeekSwiper6Cards, { mode: mode, days: days, data: data, anchor: anchor, onChangeAnchor: (iso) => {
                    setAnchor(iso);
                    window.location.hash = `#/week?anchor=${encodeURIComponent(iso)}`;
                }, onRefresh: () => reload(anchor, true) }))] }));
}
