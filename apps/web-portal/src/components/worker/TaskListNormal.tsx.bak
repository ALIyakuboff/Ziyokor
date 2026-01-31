import { Trash2, MessageCircle, Check } from "lucide-react";

// ... existing imports

export default function TaskListNormal({ dayISO, items, onRefresh }: { dayISO: string; items: Task[]; onRefresh: () => void }) {
    // ... existing logic

    return (
        <div className="taskList">
            {/* ... create input */}

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
                                    <Trash2 size={18} />
                                </button>
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlarni ko'rish">
                                        <MessageCircle size={18} />
                                    </button>
                                )}
                                <button className="btn mini ok" onClick={() => onDone(t)}>
                                    <Check size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

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
        </div>
    );
}
