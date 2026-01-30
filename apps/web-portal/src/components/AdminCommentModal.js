import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getTaskComments } from "../api/admin";
import { onTaskCommentAdded, onTaskCommentsUpdated, offTaskCommentAdded, offTaskCommentsUpdated } from "../socket";
export default function AdminCommentModal({ task, onClose }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        try {
            const res = await getTaskComments(task.id);
            setItems(res.items);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, [task.id]);
    useEffect(() => {
        const handleEvent = (data) => {
            if (data.taskId === task.id) {
                console.log("[AdminCommentModal] updating comments real-time...");
                load();
            }
        };
        onTaskCommentAdded(handleEvent);
        onTaskCommentsUpdated(handleEvent);
        return () => {
            offTaskCommentAdded(handleEvent);
            offTaskCommentsUpdated(handleEvent);
        };
    }, [task.id]);
    return (_jsx("div", { className: "modalOverlay", onClick: onClose, children: _jsxs("div", { className: "modalCard", style: { width: "min(400px, 92vw)" }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modalHeader", children: [_jsx("div", { className: "modalTitle", children: "Izohlar" }), _jsx("button", { className: "btn mini", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "modalBody", style: { gap: "10px", maxHeight: "50vh", overflowY: "auto" }, children: [_jsxs("div", { className: "muted small", style: { marginBottom: 10 }, children: ["Task: ", task.title] }), loading ? (_jsx("div", { className: "muted", children: "Yuklanmoqda..." })) : items.length === 0 ? (_jsx("div", { className: "muted", children: "Izohlar yo\u2018q" })) : (items.map((it, i) => (_jsx("div", { className: "card padSm", style: { background: "rgba(255,255,255,0.03)", fontSize: "14px" }, children: it }, i))))] }), _jsx("div", { className: "modalFooter", children: _jsx("button", { className: "btn primary", onClick: onClose, children: "Yopish" }) })] }) }));
}
