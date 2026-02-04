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
            if (!silent) setLoading(false);
        }
    }

    useEffect(() => {
        reload(anchorFromHash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleTaskEvent = () => {
            console.log("[worker] task event received, reloading silently...");
            reload(anchor, true);
        };

        onTaskCreated(handleTaskEvent);
        onTaskStarted(handleTaskEvent);
        onTaskCompleted(handleTaskEvent);
        onTaskDeleted(handleTaskEvent);

        return () => {
            offTaskCreated(handleTaskEvent);
            offTaskStarted(handleTaskEvent);
            offTaskCompleted(handleTaskEvent);
            offTaskDeleted(handleTaskEvent);
        };
    }, [anchor]);

    const handleOptimisticDelete = (taskId: string) => {
        if (!data) return;
        const newData = { ...data };
        let found = false;
        for (const day in newData) {
            const dayData = newData[day];
            for (const type of ['mandatory', 'normal', 'project', 'carryover'] as const) {
                const list = dayData[type];
                const idx = list.findIndex((t: any) => t.id === taskId);
                if (idx !== -1) {
                    dayData[type] = list.filter((t: any) => t.id !== taskId);
                    // Update progress
                    const deletedTask = list[idx];
                    dayData.progress.total--;
                    if (deletedTask.status === 'done') dayData.progress.done--;
                    if (dayData.progress.total > 0) {
                        dayData.progress.percent = Math.round((dayData.progress.done / dayData.progress.total) * 100);
                    } else {
                        dayData.progress.percent = 0;
                    }
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (found) setData(newData);
    };

    // We need to pass handleOptimisticDelete down or listen to a custom event
    // Since we can't easily change all components now, let's use a simpler trick:
    // Listen for onTaskDeleted and if it's our own deletion, we might have already removed it.
    // Actually, let's just make the reload silent and fast.


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
                    onDelete={handleOptimisticDelete}
                />
            )}
        </div>
    );
}
