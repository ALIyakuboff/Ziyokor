import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MessageCircle, Check } from "lucide-react";
// ... existing imports
export default function TaskListMandatory({ items, onRefresh }) {
    // ... existing state
    // ... existing onDone
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "taskList", children: [items.length === 0 && _jsx("div", { className: "muted small", children: "Majburiy ish yo\u2018q" }), items.map((t) => {
                        // ... existing variables
                        const commented = (t.comment_count !== undefined && t.comment_count > 0) || !!commentSavedIds[t.id];
                        const done = t.status === "done";
                        const disabledDone = !done && !commented;
                        return (_jsxs("div", { className: `taskRow ${done ? "taskDone" : ""}`, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "taskTitle", children: t.title }), t.status === 'in_progress' && t.started_at && (_jsx(TaskTimer, { startedAt: t.started_at }))] }), _jsxs("div", { className: "taskActions", children: [t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: _jsx(MessageCircle, { size: 18 }) })), t.status !== "done" && (_jsx("button", { className: `btn mini ok`, onClick: () => onDone(t), title: disabledDone ? "Izoh yozish kerak" : "Tugatish", children: _jsx(Check, { size: 18 }) }))] })] }, t.id));
                    })] }), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
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
