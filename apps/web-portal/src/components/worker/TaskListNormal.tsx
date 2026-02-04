import React, { useState } from "react";
import { Trash2, MessageCircle, Check, Play } from "lucide-react";
import { createMyTask, deleteTask, doneTask, startTask, Task } from "../../api/tasks";
import { todayISO } from "../../utils/date";
import CommentModalWhite from "./CommentModalWhite";
import TaskTimer from "./TaskTimer";

export default function TaskListNormal({
    dayISO,
    items,
    onRefresh,
    onDelete
}: {
    dayISO: string;
    items: Task[];
    onRefresh: () => void;
    onDelete?: (id: string) => void;
}) {
    const [newTitle, setNewTitle] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

    const isPast = dayISO < todayISO();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setLoadingId("add");
        try {
            await createMyTask(newTitle, dayISO);
            setNewTitle("");
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDone = (task: Task) => {
        setCommentFor(task);
        setIsCompleting(true);
    };

    const handleRemove = async (id: string) => {
        if (!confirm("O'chirilsinmi?")) return;
        if (onDelete) onDelete(id); // Optimistic UI
        setLoadingId(id);
        try {
            await deleteTask(id);
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
            onRefresh(); // Revert optimistic UI
        } finally {
            setLoadingId(null);
        }
    };

    const handleStart = async (id: string) => {
        setLoadingId(id);
        try {
            await startTask(id);
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="taskList">
            {!isPast && (
                <form onSubmit={handleAdd} className="addRow">
                    <input
                        className="input"
                        style={{ flex: 1, border: 'none', background: 'transparent', height: 32, fontSize: 13 }}
                        placeholder="+ Yangi vazifa..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        disabled={loadingId === "add"}
                    />
                </form>
            )}

            {items.length === 0 && <div className="muted small" style={{ textAlign: 'center', padding: '10px 0' }}>Hozircha ish yo‘q</div>}

            {items.map((t) => (
                <div key={t.id} className={`taskRow ${t.status === "done" ? "taskDone" : ""}`}>
                    <div style={{ flex: 1 }}>
                        <div className="taskTitle">{t.title}</div>
                        {t.status === 'in_progress' && t.started_at && (
                            <TaskTimer startedAt={t.started_at} />
                        )}
                        {t.status === 'pending' && (
                            <div className="muted small">Kutilmoqda</div>
                        )}
                    </div>

                    <div className="taskActions" style={{ display: 'flex', gap: 4 }}>
                        {t.status === 'pending' && (
                            <button className="btn mini" onClick={() => handleStart(t.id)} disabled={!!loadingId} title="Boshlash">
                                <Play size={14} />
                            </button>
                        )}

                        {t.status !== "done" && (
                            <>
                                <button className="btn mini ok" onClick={() => handleDone(t)} disabled={!!loadingId} title="Tugatish">
                                    <Check size={16} />
                                </button>
                                <button className="btn mini" onClick={() => handleRemove(t.id)} disabled={!!loadingId} title="O'chirish">
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}

                        <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlar">
                            <MessageCircle size={14} />
                            {t.comment_count !== undefined && t.comment_count > 0 && (
                                <span className="badge" style={{ marginLeft: 4 }}>{t.comment_count}</span>
                            )}
                        </button>
                    </div>
                </div>
            ))}

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
