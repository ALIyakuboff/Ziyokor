import React, { useState } from "react";
import type { Task } from "../../api/tasks";
import { createMyTask, deleteTask, doneTask } from "../../api/tasks";
import TaskTimer from "./TaskTimer";
import CommentModalWhite from "./CommentModalWhite";
import { todayISO, getUzbHour } from "../../utils/date";

export default function TaskListNormal({ dayISO, items, onRefresh }: { dayISO: string; items: Task[]; onRefresh: () => void }) {
    const isPast = dayISO < todayISO();
    const isTodayPastCutoff = dayISO === todayISO() && getUzbHour() >= 20;
    const canCreate = !isPast && !isTodayPastCutoff;

    const [title, setTitle] = useState("");
    const [adding, setAdding] = useState(false);
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [commentSavedIds, setCommentSavedIds] = useState<Record<string, boolean>>({});

    async function add() {
        if (!title.trim()) return;
        setAdding(true);
        try {
            await createMyTask(title.trim(), dayISO);
            setTitle("");
            onRefresh();
        } catch (e: any) {
            alert("Xato: " + (e?.message || "Saqlab bo'lmadi"));
        } finally {
            setAdding(false);
        }
    }

    async function remove(id: string) {
        if (!confirm("O'chirilsinmi?")) return;
        try {
            await deleteTask(id);
            onRefresh();
        } catch (e: any) {
            alert("Xato: " + (e?.message || "O'chirib bo'lmadi"));
        }
    }

    const [pendingDoneTask, setPendingDoneTask] = useState<Task | null>(null);

    async function onDone(t: Task) {
        const hasComments = (t.comment_count || 0) > 0 || !!commentSavedIds[t.id];

        if (!hasComments) {
            setPendingDoneTask(t);
            setCommentFor(t);
            return;
        }

        try {
            await doneTask(t.id);
            onRefresh();
        } catch (e: any) {
            if (e?.message === "COMMENT_REQUIRED") {
                setPendingDoneTask(t);
                setCommentFor(t);
            } else {
                alert("Xato: " + (e?.message || "Bajarib bo'lmadi"));
            }
        }
    }

    return (
        <div className="taskList">
            {canCreate && (
                <div className="addRow">
                    <input
                        className="input"
                        style={{ border: 'none', background: 'transparent', flex: 1, padding: 0 }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && add()}
                        placeholder="Yangi ish..."
                    />
                </div>
            )}

            {items.length === 0 && <div className="muted small">Hozircha ish yo‘q</div>}

            {items.map((t) => (
                <div key={t.id} className={`taskRow ${t.status === "done" ? "taskDone" : ""}`}>
                    <div style={{ flex: 1 }}>
                        <div className="taskTitle">{t.title}</div>
                        {t.status === 'in_progress' && t.started_at && (
                            <TaskTimer startedAt={t.started_at} />
                        )}
                    </div>

                    <div className="taskActions">
                        {t.status !== "done" && (
                            <>
                                <button className="btn mini" onClick={() => remove(t.id)} title="O'chirish">
                                    🗑️
                                </button>
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlarni ko'rish">
                                        💬
                                    </button>
                                )}
                                <button className="btn mini ok" onClick={() => onDone(t)}>
                                    ✅
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {commentFor && (
                <CommentModalWhite
                    task={commentFor}
                    onClose={() => setCommentFor(null)}
                    onSaved={() => {
                        setCommentSavedIds((s) => ({ ...s, [commentFor.id]: true }));

                        if (pendingDoneTask?.id === commentFor.id) {
                            doneTask(commentFor.id).then(onRefresh).catch(e => alert(e.message));
                            setPendingDoneTask(null);
                        } else {
                            onRefresh();
                        }

                        setCommentFor(null);
                    }}
                />
            )}
        </div>
    );
}
