import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { createMyTask, deleteTask, doneTask } from "../../api/tasks";
import TaskTimer from "./TaskTimer";
import CommentModalWhite from "./CommentModalWhite";
import { todayISO, getUzbHour } from "../../utils/date";
export default function TaskListNormal({ dayISO, items, onRefresh }) {
    const isPast = dayISO < todayISO();
    const isTodayPastCutoff = dayISO === todayISO() && getUzbHour() >= 20;
    const canCreate = !isPast && !isTodayPastCutoff;
    const [title, setTitle] = useState("");
    const [adding, setAdding] = useState(false);
    const [commentFor, setCommentFor] = useState(null);
    async function add() {
        if (!title.trim())
            return;
        setAdding(true);
        try {
            await createMyTask(title.trim(), dayISO);
            setTitle("");
            onRefresh();
        }
        catch (e) {
            alert("Xato: " + (e?.message || "Saqlab bo'lmadi"));
        }
        finally {
            setAdding(false);
        }
    }
    async function remove(id) {
        if (!confirm("O'chirilsinmi?"))
            return;
        try {
            await deleteTask(id);
            onRefresh();
        }
        catch (e) {
            alert("Xato: " + (e?.message || "O'chirib bo'lmadi"));
        }
    }
    async function onDone(t) {
        try {
            await doneTask(t.id);
            onRefresh();
        }
        catch (e) {
            if (e?.message === "COMMENT_REQUIRED") {
                setCommentFor(t);
            }
            else {
                alert("Xato: " + (e?.message || "Bajarib bo'lmadi"));
            }
        }
    }
    return (_jsxs("div", { className: "taskList", children: [canCreate && (_jsx("div", { className: "addRow", children: _jsx("input", { className: "input", style: { border: 'none', background: 'transparent', flex: 1, padding: 0 }, value: title, onChange: (e) => setTitle(e.target.value), onKeyDown: (e) => e.key === 'Enter' && add(), placeholder: "Yangi ish..." }) })), items.length === 0 && _jsx("div", { className: "muted small", children: "Hozircha ish yo\u2018q" }), items.map((t) => (_jsxs("div", { className: `taskRow ${t.status === "done" ? "taskDone" : ""}`, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "taskTitle", children: t.title }), t.status === 'in_progress' && t.started_at && (_jsx(TaskTimer, { startedAt: t.started_at }))] }), _jsx("div", { className: "taskActions", children: t.status !== "done" && (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn mini", onClick: () => remove(t.id), title: "O'chirish", children: "\uD83D\uDDD1\uFE0F" }), t.comment_count !== undefined && t.comment_count > 0 && (_jsx("button", { className: "btn mini", onClick: () => setCommentFor(t), title: "Izohlarni ko'rish", children: "\uD83D\uDCAC" })), _jsx("button", { className: "btn mini ok", onClick: () => onDone(t), children: "\u2705" })] })) })] }, t.id))), commentFor && (_jsx(CommentModalWhite, { task: commentFor, onClose: () => setCommentFor(null), onSaved: () => {
                    onRefresh();
                    setCommentFor(null);
                    // If it was triggered by onDone flow, we might want to try doneTask again.
                    // But usually worker manually saves and then marks done.
                } }))] }));
}
