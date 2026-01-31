import { Play, MessageCircle, Check } from "lucide-react";

// ... existing imports

export default function TaskListCarryover({ items, onRefresh }: { items: Task[]; onRefresh: () => void }) {
    // ... existing logic

    return (
        <>
            <div className="taskList carryoverBox">
                {items.length === 0 && <div className="muted small">Qolgan ish yo‘q <Check size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></div>}

                {items.map((t) => (
                    <div key={t.id} className={`taskRow carryoverRow ${t.status === "done" ? "taskDone" : ""}`}>
                        <div className="taskTitle">{t.title}</div>

                        <div className="taskActions">
                            {t.status !== "done" && (
                                <button className="btn mini" onClick={() => startTask(t.id).then(onRefresh)}>
                                    <Play size={18} />
                                </button>
                            )}
                            <div style={{ display: "flex", gap: "6px" }}>
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button className="btn mini" onClick={() => setCommentFor(t)} title="Izohlarni ko'rish">
                                        <MessageCircle size={18} />
                                    </button>
                                )}
                                <button className="btn mini ok" onClick={() => onDone(t)}>
                                    <Check size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
