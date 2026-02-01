import { useState } from "react";
import { Trash2, MessageCircle, Check, Plus } from "lucide-react";
import CommentModalWhite from "./CommentModalWhite";
import TaskTimer from "./TaskTimer";
import { createMyTask, doneTask, deleteTask } from "../../api/tasks";

export default function TaskListNormal({ dayISO, items, onRefresh, hideAdd = false }) {
    const [newItem, setNewItem] = useState("");
    const [loading, setLoading] = useState(false);
    const [commentFor, setCommentFor] = useState(null);
    const [commentSavedIds, setCommentSavedIds] = useState({});
    const [pendingDoneTask, setPendingDoneTask] = useState(null);

    const onAdd = async () => {
        if (!newItem.trim()) return;
        setLoading(true);
        try {
            await createMyTask(newItem, dayISO);
            setNewItem("");
            onRefresh();
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") onAdd();
    };

    const remove = (id) => {
        // Instant delete without confirmation
        deleteTask(id).then(onRefresh).catch((e) => alert(e.message));
    };

    const onDone = (t) => {
        if ((t.comment_count !== undefined && t.comment_count > 0) || commentSavedIds[t.id]) {
            doneTask(t.id).then(onRefresh).catch((e) => alert(e.message));
        } else {
            setPendingDoneTask(t);
            setCommentFor(t);
        }
    };

    return (
        <div className="taskList">
            {!hideAdd && (
                <div className="addTaskRow">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Yangi vazifa..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button className="btn primary" onClick={onAdd} disabled={loading}>
                        <Plus size={18} />
                    </button>
                </div>
            )}

            {items.length === 0 && <div className="muted small">Hozircha ish yo‘q</div>}

            {items.map((t) => (
                <div key={t.id} className={`taskRow ${t.status === "done" ? "taskDone" : ""}`}>
                    <div style={{ flex: 1 }}>
                        <div className="taskTitle">{t.title}</div>
                        {t.status === "in_progress" && t.started_at && <TaskTimer startedAt={t.started_at} />}
                    </div>

                    <div className="taskActions">
                        {t.status !== "done" && (
                            <>
                                <button className="btn mini" onClick={() => remove(t.id)} title="O'chirish">
                                    <Trash2 size={18} />
                                </button>
                                {t.comment_count !== undefined && t.comment_count > 0 && (
                                    <button
                                        className="btn mini"
                                        onClick={() => setCommentFor(t)}
                                        title="Izohlarni ko'rish"
                                    >
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

            {commentFor && (
                <CommentModalWhite
                    task={commentFor}
                    onClose={() => setCommentFor(null)}
                    onSaved={() => {
                        setCommentSavedIds((s) => ({ ...s, [commentFor.id]: true }));
                        if (pendingDoneTask?.id === commentFor.id) {
                            doneTask(commentFor.id)
                                .then(onRefresh)
                                .catch((e) => alert(e.message));
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
