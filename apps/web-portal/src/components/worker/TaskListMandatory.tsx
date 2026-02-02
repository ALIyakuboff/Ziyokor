import React, { useState } from "react";
import { MessageCircle, Check, AlertCircle } from "lucide-react";
import { doneTask, Task } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";
import TaskTimer from "./TaskTimer";

export default function TaskListMandatory({
    items,
    onRefresh
}: {
    items: Task[];
    onRefresh: () => void
}) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [commentSavedIds, setCommentSavedIds] = useState<Record<string, boolean>>({});

    const handleDone = async (task: Task) => {
        // Requirement: Must have comments to finish mandatory task
        const commented = (task.comment_count !== undefined && task.comment_count > 0) || !!commentSavedIds[task.id];

        if (!commented) {
            alert("Majburiy vazifani tugatish uchun avval hisobot (izoh) yozishingiz kerak.");
            setCommentFor(task); // Open comments
            return;
        }

        setLoadingId(task.id);
        try {
            await doneTask(task.id);
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="taskList">
            {items.length === 0 && <div className="muted small" style={{ textAlign: 'center', padding: '10px 0' }}>Majburiy ish yo‘q</div>}

            {items.map((t) => {
                const done = t.status === "done";
                const highValue = (t.comment_count !== undefined && t.comment_count > 0) || !!commentSavedIds[t.id];

                return (
                    <div key={t.id} className={`taskRow ${done ? "taskDone" : ""}`}>
                        <div style={{ flex: 1 }}>
                            <div className="taskTitle">{t.title}</div>
                            {t.status === 'in_progress' && t.started_at && (
                                <TaskTimer startedAt={t.started_at} />
                            )}
                            {!highValue && !done && (
                                <div className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#faad14' }}>
                                    <AlertCircle size={10} /> Hisobot yozilmagan
                                </div>
                            )}
                        </div>

                        <div className="taskActions" style={{ display: 'flex', gap: 4 }}>
                            {t.status !== "done" && (
                                <button
                                    className="btn mini ok"
                                    onClick={() => handleDone(t)}
                                    disabled={!!loadingId}
                                    title={!highValue ? "Avval hisobot yozing" : "Tugatish"}
                                >
                                    <Check size={16} />
                                </button>
                            )}

                            <button className="btn mini" onClick={() => setCommentFor(t)} title="Hisobot yozish">
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
                    onClose={() => setCommentFor(null)}
                    onSaved={() => {
                        setCommentSavedIds(prev => ({ ...prev, [commentFor.id]: true }));
                        onRefresh();
                        setCommentFor(null);
                    }}
                />
            )}
        </div>
    );
}
