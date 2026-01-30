import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { doneTask, startTask } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";
export default function TaskListCarryover({ items, onRefresh }) {
    const [commentFor, setCommentFor] = useState(null);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "taskList carryoverBox", children: [items.length === 0 && _jsx("div", { className: "muted small", children: "Qolgan ish yo\u2018q \u2705" }), items.map((t) => (_jsxs("div", { className: `taskRow carryoverRow ${t.status === "done" ? "taskDone" : ""}`, children: [_jsx("div", { className: "taskTitle", children: t.title }), _jsxs("div", { className: "taskActions", children: [t.status !== "done" && (_jsx("button", { className: "btn mini", onClick: () => startTask(t.id).then(onRefresh), children: "\u25B6" })), _jsxs("div", { style: { display: "flex", gap: "6px" }, children: [t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: "\uD83D\uDCAC" })), _jsx("button", { className: "btn mini ok", onClick: () => doneTask(t.id).then(onRefresh), children: "\u2705" })] })] })] }, t.id)))] }), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
                    onRefresh();
                    setCommentFor(null);
                } }))] }));
}
