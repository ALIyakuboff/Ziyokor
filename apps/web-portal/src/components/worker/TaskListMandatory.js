import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { doneTask } from "../../api/tasks";
import CommentModalWhite from "./CommentModalWhite";
import TaskTimer from "./TaskTimer";
export default function TaskListMandatory({ items, onRefresh }) {
    const [commentFor, setCommentFor] = useState(null);
    const [commentSavedIds, setCommentSavedIds] = useState({});
    async function onDone(t) {
        if (!commentSavedIds[t.id]) {
            setCommentFor(t);
            return;
        }
        try {
            await doneTask(t.id);
            onRefresh();
        }
        catch (e) {
            if (e?.message === "COMMENT_REQUIRED")
                setCommentFor(t);
            else
                throw e;
        }
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "taskList", children: [items.length === 0 && _jsx("div", { className: "muted small", children: "Majburiy ish yo\u2018q" }), items.map((t) => {
                        const commented = !!commentSavedIds[t.id];
                        const done = t.status === "done";
                        const disabledDone = !done && !commented;
                        return (_jsxs("div", { className: `taskRow ${done ? "taskDone" : ""}`, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "taskTitle", children: t.title }), t.status === 'in_progress' && t.started_at && (_jsx(TaskTimer, { startedAt: t.started_at }))] }), _jsxs("div", { className: "taskActions", children: [t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: "\uD83D\uDCAC" })), t.status !== "done" && (_jsx("button", { className: `btn mini ${disabledDone ? "disabled" : "ok"}`, onClick: () => onDone(t), disabled: disabledDone, title: disabledDone ? "Izoh yozish kerak" : "Tugatish", children: !disabledDone ? "OK ✅" : "✅" }))] })] }, t.id));
                    })] }), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
                    setCommentSavedIds((s) => ({ ...s, [commentFor.id]: true }));
                    setCommentFor(null);
                    onRefresh();
                } }))] }));
}
