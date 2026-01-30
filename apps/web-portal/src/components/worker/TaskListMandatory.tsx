import { MessageCircle, Check } from "lucide-react";

// ... existing imports

export default function TaskListMandatory({ items, onRefresh }: { items: Task[]; onRefresh: () => void }) {
    // ... existing state

    // ... existing onDone

    return (
        <>
            <div className="taskList">
                {items.length === 0 && <div className="muted small">Majburiy ish yo‘q</div>}

                {items.map((t) => {
                    // ... existing variables
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
                                        <MessageCircle size={18} />
                                    </button>
                                )}
                                {t.status !== "done" && (
                                    <button
                                        className={`btn mini ok`}
                                        onClick={() => onDone(t)}
                                        title={disabledDone ? "Izoh yozish kerak" : "Tugatish"}
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* ... rest of component */}

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
