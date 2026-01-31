import React, { useEffect, useMemo, useState } from "react";
import WorkerHeader3Panel from "../../components/worker/WorkerHeader3Panel";
import { useSession } from "../../state/session";
import { todayISO } from "../../utils/date";
import WeekSwiper6Cards from "../../components/worker/WeekSwiper6Cards";
import { onTaskCreated, onTaskStarted, onTaskCompleted, onTaskDeleted, offTaskCreated, offTaskStarted, offTaskCompleted, offTaskDeleted } from "../../socket";
import { getMyWeek, createMyTask } from "../../api/tasks";

export default function WorkerWeekRoute({ mode }: { mode: "week" | "day" }) {
    const { logout, user } = useSession();
    const anchorFromHash = useMemo(() => {
        const h = window.location.hash || "";
        const q = h.split("?")[1] || "";
        const params = new URLSearchParams(q);
        return params.get("anchor") || params.get("date") || todayISO();
    }, []);

    const [anchor, setAnchor] = useState(anchorFromHash);
    const [days, setDays] = useState<string[]>([]);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function reload(a = anchor, silent = false) {
        if (!silent) setLoading(true);
        setErr(null);
        try {
            const res = await getMyWeek(a);
            setAnchor(res.anchor || a);
            setDays(res.days);
            setData(res.data);
        } catch (e: any) {
            setErr(e?.message || "Xato");
        } finally {
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

    return (
        <div className="screen">
            <WorkerHeader3Panel
                anchor={anchor}
                onPickDate={(iso) => {
                    setAnchor(iso);
                    window.location.hash = `#/week?anchor=${encodeURIComponent(iso)}`;
                    reload(iso);
                }}
            />

            {loading && <div className="center muted">Yuklanmoqda...</div>}
            {err && <div className="center error">{err}</div>}

            {!loading && data && (
                <WeekSwiper6Cards
                    mode={mode}
                    days={days}
                    data={data}
                    anchor={anchor}
                    onChangeAnchor={(iso: any) => {
                        setAnchor(iso);
                        window.location.hash = `#/week?anchor=${encodeURIComponent(iso)}`;
                    }}
                    onRefresh={() => reload(anchor, true)}
                />
            )}
        </div>
    );
}
