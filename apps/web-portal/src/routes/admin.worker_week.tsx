import React, { useEffect, useMemo, useState } from "react";
import Header3Panel from "../components/Header3Panel";
import WeekGrid6Cards from "../components/WeekGrid6Cards";
import { getWorkerWeek, listWorkers, deleteTaskAdmin } from "../api/admin";
import { todayISO } from "../utils/date";
import { onTaskCreated, onTaskStarted, onTaskCompleted, onTaskDeleted, onTaskCommentAdded, onTaskCommentsUpdated, offTaskCreated, offTaskStarted, offTaskCompleted, offTaskDeleted, offTaskCommentAdded, offTaskCommentsUpdated } from "../socket";

function getParams() {
    const hash = window.location.hash || "";
    const q = hash.split("?")[1] || "";
    return new URLSearchParams(q);
}

export default function AdminWorkerWeekRoute() {
    const params = useMemo(() => getParams(), [window.location.hash]);
    const workerId = params.get("workerId") || "";
    const anchor = params.get("anchor") || todayISO();

    const [workers, setWorkers] = useState<{ id: string; full_name: string }[]>([]);
    const [data, setData] = useState<any>(null);
    const [days, setDays] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    async function reload(wid = workerId, a = anchor) {
        if (!wid) return;
        setLoading(true);
        setErr(null);
        try {
            const r = await getWorkerWeek(wid, a);
            setData(r.data);
            setDays(r.days);
        } catch (e: any) {
            setErr(e?.message || "Xato");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            const r = await listWorkers();
            setWorkers(r.workers);
        })();
    }, []);

    useEffect(() => {
        if (workerId) reload(workerId, anchor);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workerId, anchor]);

    // Real-time event listeners
    useEffect(() => {
        const handleTaskEvent = () => {
            console.log("[admin] task event received, reloading...");
            if (workerId) reload(workerId, anchor);
        };

        onTaskCreated(handleTaskEvent);
        onTaskStarted(handleTaskEvent);
        onTaskCompleted(handleTaskEvent);
        onTaskDeleted(handleTaskEvent);
        onTaskCommentAdded(handleTaskEvent);
        onTaskCommentsUpdated(handleTaskEvent);

        return () => {
            offTaskCreated(handleTaskEvent);
            offTaskStarted(handleTaskEvent);
            offTaskCompleted(handleTaskEvent);
            offTaskDeleted(handleTaskEvent);
            offTaskCommentAdded(handleTaskEvent);
            offTaskCommentsUpdated(handleTaskEvent);
        };
    }, [workerId, anchor]);

    async function handleDeleteTask(taskId: string) {
        try {
            await deleteTaskAdmin(taskId);
            // reload() will be called by socket event listener onTaskDeleted
        } catch (e: any) {
            alert(e?.message || "O'chirishda xatolik");
        }
    }

    return (
        <div className="screen">
            <Header3Panel workers={workers} workerId={workerId} anchor={anchor} />

            <div className="content">
                {!workerId && (
                    <div className="card pad">
                        <div className="h2">Ishchi tanlanmagan</div>
                        <p className="muted">Headerdagi Admin &gt; dan ishchini tanlang.</p>
                    </div>
                )}

                {workerId && loading && <div className="muted">Yuklanmoqda...</div>}
                {err && <div className="error">{err}</div>}

                {workerId && !loading && data && (
                    <WeekGrid6Cards
                        days={days}
                        data={data}
                        onDelete={handleDeleteTask}
                    />
                )}
            </div>
        </div>
    );
}
