import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Trash2, MessageCircle, Check } from "lucide-react";
// ... existing imports
export default function TaskListNormal({ dayISO, items, onRefresh }) {
    // ... existing logic
    return (_jsxs("div", { className: "taskList", children: [items.length === 0 && _jsx("div", { className: "muted small", children: "Hozircha ish yo\u2018q" }), items.map((t) => (_jsxs("div", { className: `taskRow ${t.status === "done" ? "taskDone" : ""}`, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "taskTitle", children: t.title }), t.status === 'in_progress' && t.started_at && (_jsx(TaskTimer, { startedAt: t.started_at }))] }), _jsx("div", { className: "taskActions", children: t.status !== "done" && (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn mini", onClick: () => remove(t.id), title: "O'chirish", children: _jsx(Trash2, { size: 18 }) }), t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: _jsx(MessageCircle, { size: 18 }) })), _jsx("button", { className: "btn mini ok", onClick: () => onDone(t), children: _jsx(Check, { size: 18 }) })] })) })] }, t.id))), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
                    setCommentSavedIds((s) => ({ ...s, [commentFor.id]: true }));
                    if (pendingDoneTask?.id === commentFor.id) {
                        doneTask(commentFor.id).then(onRefresh).catch(e => alert(e.message));
                        setPendingDoneTask(null);
                    }
                    else {
                        onRefresh();
                    }
                    setCommentFor(null);
                } }))] }));
}
