import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import AdminCommentModal from "./AdminCommentModal";
import { todayISO } from "../utils/date";
export default function TaskBlock({ items, tone, onDelete }) {
    const [viewingComments, setViewingComments] = useState(null);
    const today = todayISO();
    if (!items.length)
        return _jsx("div", { className: "muted small", children: "\u2014" });
    return (_jsxs("div", { className: `taskList ${tone === "danger" ? "carryoverBox" : ""}`, children: [items.map((t) => {
                const canDelete = onDelete && t.visible_date >= today;
                return (_jsxs("div", { className: `taskRow ${tone === "danger" ? "carryoverRow" : ""} ${t.status === "done" ? "taskDone" : ""}`, children: [_jsx("div", { className: "taskTitle", children: t.title }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [(t.status === "done" || t.comment_count > 0) && (_jsx("button", { className: "linkBtn", onClick: () => setViewingComments(t), style: { padding: "4px" }, children: "\uD83D\uDCAC" })), canDelete && (_jsx("button", { className: "linkBtn textDanger", onClick: () => {
                                        if (window.confirm("Vazifani o'chirishni tasdiqlaysizmi?")) {
                                            onDelete(t.id);
                                        }
                                    }, style: { padding: "4px" }, children: "\uD83D\uDDD1\uFE0F" })), _jsx("div", { className: "badge", children: t.status })] })] }, t.id));
            }), viewingComments && (_jsx(AdminCommentModal, { task: viewingComments, onClose: () => setViewingComments(null) }))] }));
}
