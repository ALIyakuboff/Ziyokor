import React, { useState } from "react";
import { MessageCircle, Check, AlertCircle } from "lucide-react";
import { doneTask, Task } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";

export default function TaskListCarryover({
    items,
    onRefresh
}: {
    items: Task[];
    onRefresh: () => void
}) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

    const handleDone = (task: Task) => {
        setCommentFor(task);
        setIsCompleting(true);
    };

    return (
        <div className="taskList">
            {items.length === 0 && <div className="muted small" style={{ textAlign: 'center', padding: '10px 0' }}>Kecha qolgan ishlar yo‘q</div>}

            {items.map((t) => {
                const done = t.status === "done";

                return (
                    <div key={t.id} className={`taskRow carryoverRow ${done ? "taskDone" : ""}`} style={{ borderLeft: '3px solid #ff4d4f' }}>
                        <div style={{ flex: 1 }}>
                            <div className="taskTitle">{t.title}</div>
                            <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertCircle size={10} color="#ff4d4f" /> {t.visible_date} dan qolgan
                            </div>
                        </div>

                        <div className="taskActions" style={{ display: 'flex', gap: 4 }}>
                            {t.status !== "done" && (
                                <button
                                    className="btn mini ok"
                                    onClick={() => handleDone(t)}
                                    disabled={!!loadingId}
                                    title="Tugatish"
                                >
                                    <Check size={16} />
                                </button>
                            )}

                            <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlar">
                                <MessageCircle size={14} />
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <span className="badge" style={{ marginLeft: 4 }}>{t.comment_count}</span>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}

            {commentFor && (
                <CommentModalWhite
                    task={commentFor}
                    onClose={() => {
                        setCommentFor(null);
                        setIsCompleting(false);
                    }}
                    onSaved={() => {
                        onRefresh();
                        setCommentFor(null);
                        setIsCompleting(false);
                    }}
                    autoDone={isCompleting}
                />
            )}
        </div>
    );
}
