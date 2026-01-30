import React, { useState } from "react";
import type { Task } from "../../api/tasks";
import { doneTask, startTask } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";
import TaskTimer from "./TaskTimer";

export default function TaskListMandatory({ items, onRefresh }: { items: Task[]; onRefresh: () => void }) {
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [commentSavedIds, setCommentSavedIds] = useState<Record<string, boolean>>({});

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
            }
            else throw e;
        }
    }

    return (
        <>
            <div className="taskList">
                {items.length === 0 && <div className="muted small">Majburiy ish yo‘q</div>}

                {items.map((t) => {
                    const commented = (t.comment_count !== undefined && t.comment_count > 0) || !!commentSavedIds[t.id];
                    const done = t.status === "done";
                    const disabledDone = !done && !commented;

                    return (
                        <div key={t.id} className={`taskRow ${done ? "taskDone" : ""}`}>
                            <div style={{ flex: 1 }}>
                                <div className="taskTitle">{t.title}</div>
                                {t.status === 'in_progress' && t.started_at && (
                                    <TaskTimer startedAt={t.started_at} />
                                )}
                            </div>

                            <div className="taskActions">
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlarni ko'rish">
                                        💬
                                    </button>
                                )}
                                {t.status !== "done" && (
                                    <button
                                        className={`btn mini ok`}
                                        onClick={() => onDone(t)}
                                        title={disabledDone ? "Izoh yozish kerak" : "Tugatish"}
                                    >
                                        ✅
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

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
        </>
    );
}
