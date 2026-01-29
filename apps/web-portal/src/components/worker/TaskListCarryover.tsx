import React, { useState } from "react";
import type { Task } from "../../api/tasks";
import { doneTask, startTask } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";

export default function TaskListCarryover({ items, onRefresh }: { items: Task[]; onRefresh: () => void }) {
    const [commentFor, setCommentFor] = useState<Task | null>(null);

    return (
        <>
            <div className="taskList carryoverBox">
                {items.length === 0 && <div className="muted small">Qolgan ish yo‘q ✅</div>}

                {items.map((t) => (
                    <div key={t.id} className={`taskRow carryoverRow ${t.status === "done" ? "taskDone" : ""}`}>
                        <div className="taskTitle">{t.title}</div>

                        <div className="taskActions">
                            {t.status !== "done" && (
                                <button className="btn mini" onClick={() => startTask(t.id).then(onRefresh)}>
                                    ▶
                                </button>
                            )}
                            <div style={{ display: "flex", gap: "6px" }}>
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlarni ko'rish">
                                        💬
                                    </button>
                                )}
                                <button className="btn mini ok" onClick={() => doneTask(t.id).then(onRefresh)}>
                                    ✅
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {commentFor && (
                <CommentModalWhite
                    task={commentFor}
                    onClose={() => setCommentFor(null)}
                    onSaved={() => {
                        onRefresh();
                        setCommentFor(null);
                    }}
                />
            )}
        </>
    );
}
