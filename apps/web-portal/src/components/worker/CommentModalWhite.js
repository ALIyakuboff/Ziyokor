import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { replaceComments, getTaskComments } from "../../api/tasks";
export default function CommentModalWhite({ task, onClose, onSaved }) {
    const [items, setItems] = useState([""]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const firstRef = useRef(null);
    useEffect(() => {
        // Fetch existing comments
        getTaskComments(task.id)
            .then((res) => {
                if (res.items && res.items.length > 0) {
                    setItems(res.items);
                } else if (task.is_project) {
                    // Pre-fill with creation date for Project tasks
                    const dateStr = task.created_at ? new Date(task.created_at).toLocaleDateString("ru-RU") : (task.assigned_date || "");
                    setItems([dateStr + " "]);
                }
            })
            .catch(() => {
                // ignore error
                if (task.is_project) {
                    const dateStr = task.created_at ? new Date(task.created_at).toLocaleDateString("ru-RU") : (task.assigned_date || "");
                    setItems([dateStr + " "]);
                }
            })
            .finally(() => {
                setLoading(false);
                setTimeout(() => firstRef.current?.focus(), 100);
            });
    }, [task.id, task.is_project, task.created_at, task.assigned_date]);
    function setItem(i, v) {
        setItems((prev) => {
            const next = [...prev];
            next[i] = v;
            return next;
        });
    }
    function onKeyDown(i, e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const cur = (items[i] || "").trim();
            if (!cur)
                return;
            setItems((prev) => [...prev, ""]);
            // focus next input after render
            setTimeout(() => {
                const el = document.getElementById(`cm_${task.id}_${i + 1}`);
                el?.focus();
            }, 0);
        }
        else if (e.key === "Escape") {
            onClose();
        }
    }
    async function save() {
        const clean = items.map((x) => x.trim()).filter((x) => x.length > 0);
        if (clean.length < 1)
            return;
        setSaving(true);
        try {
            await replaceComments(task.id, clean);
            onSaved();
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx("div", {
        className: "modalOverlay", onMouseDown: onClose, role: "dialog", "aria-modal": "true", children: _jsxs("div", {
            className: "modalWhite", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modalHeader", children: [_jsxs("div", { className: "modalTitle", children: ["Hisobot \u2014 ", task.title] }), _jsx("button", { className: "btn mini", onClick: onClose, "aria-label": "Close", children: "\u2715" })] }), _jsx("div", {
                className: "modalBody", style: { maxHeight: '60vh', overflowY: 'auto', padding: '20px' }, children: loading ? (_jsx("div", { className: "muted small center", style: { padding: '20px' }, children: "Yuklanmoqda..." })) : (_jsxs(_Fragment, {
                    children: [items.map((v, i) => (_jsxs("div", {
                        className: "numRow", children: [_jsx("div", { className: "num", children: i + 1 }), _jsx("input", { id: `cm_${task.id}_${i}`, ref: i === 0 ? firstRef : undefined, className: "input", style: { background: 'transparent', border: 'none', height: '32px', flex: 1 }, value: v, onChange: (e) => setItem(i, e.target.value), onKeyDown: (e) => onKeyDown(i, e), placeholder: "Qilingan ish...", autoComplete: "off" }), items.length > 1 && v.trim() === "" && i !== items.length - 1 && (_jsx("button", {
                            className: "linkBtn", onClick: () => {
                                const next = [...items];
                                next.splice(i, 1);
                                setItems(next);
                            }, style: { fontSize: '10px' }, children: "\u2715"
                        }))]
                    }, i))), _jsxs("div", { className: "muted small", style: { textAlign: 'center', marginTop: '10px', opacity: 0.8 }, children: [_jsx("i", { className: "fa-solid fa-keyboard", style: { marginRight: '6 row' } }), "Enter - yangi qator qo'shish"] })]
                }))
            }), _jsxs("div", { className: "modalFooter", children: [_jsx("button", { className: "btn", onClick: onClose, children: "Bekor" }), _jsx("button", { className: "btn primary", onClick: save, disabled: saving || loading, children: saving ? "Saqlanyapti..." : "Saqlash" })] })]
        })
    }));
}
