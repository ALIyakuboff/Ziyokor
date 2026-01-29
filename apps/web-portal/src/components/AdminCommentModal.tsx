import React, { useEffect, useState } from "react";
import { getTaskComments } from "../api/admin";
import { onTaskCommentAdded, onTaskCommentsUpdated, offTaskCommentAdded, offTaskCommentsUpdated } from "../socket";

export default function AdminCommentModal({
    task,
    onClose
}: {
    task: any;
    onClose: () => void;
}) {
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const res = await getTaskComments(task.id);
            setItems(res.items);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [task.id]);

    useEffect(() => {
        const handleEvent = (data: any) => {
            if (data.taskId === task.id) {
                console.log("[AdminCommentModal] updating comments real-time...");
                load();
            }
        };

        onTaskCommentAdded(handleEvent);
        onTaskCommentsUpdated(handleEvent);

        return () => {
            offTaskCommentAdded(handleEvent);
            offTaskCommentsUpdated(handleEvent);
        };
    }, [task.id]);

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalCard" style={{ width: "min(400px, 92vw)" }} onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <div className="modalTitle">Izohlar</div>
                    <button className="btn mini" onClick={onClose}>✕</button>
                </div>
                <div className="modalBody" style={{ gap: "10px", maxHeight: "50vh", overflowY: "auto" }}>
                    <div className="muted small" style={{ marginBottom: 10 }}>Task: {task.title}</div>

                    {loading ? (
                        <div className="muted">Yuklanmoqda...</div>
                    ) : items.length === 0 ? (
                        <div className="muted">Izohlar yo‘q</div>
                    ) : (
                        items.map((it, i) => (
                            <div key={i} className="card padSm" style={{ background: "rgba(255,255,255,0.03)", fontSize: "14px" }}>
                                {it}
                            </div>
                        ))
                    )}
                </div>
                <div className="modalFooter">
                    <button className="btn primary" onClick={onClose}>Yopish</button>
                </div>
            </div>
        </div>
    );
}
