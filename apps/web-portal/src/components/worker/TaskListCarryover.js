import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Play, MessageCircle, Check } from "lucide-react";
// ... existing imports
export default function TaskListCarryover({ items, onRefresh }) {
    // ... existing logic
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "taskList carryoverBox", children: [items.length === 0 && _jsxs("div", { className: "muted small", children: ["Qolgan ish yo\u2018q ", _jsx(Check, { size: 14, style: { display: 'inline', verticalAlign: 'middle' } })] }), items.map((t) => (_jsxs("div", { className: `taskRow carryoverRow ${t.status === "done" ? "taskDone" : ""}`, children: [_jsx("div", { className: "taskTitle", children: t.title }), _jsxs("div", { className: "taskActions", children: [t.status !== "done" && (_jsx("button", { className: "btn mini", onClick: () => startTask(t.id).then(onRefresh), children: _jsx(Play, { size: 18 }) })), _jsxs("div", { style: { display: "flex", gap: "6px" }, children: [t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: _jsx(MessageCircle, { size: 18 }) })), _jsx("button", { className: "btn mini ok", onClick: () => onDone(t), children: _jsx(Check, { size: 18 }) })] })] })] }, t.id)))] }), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
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
