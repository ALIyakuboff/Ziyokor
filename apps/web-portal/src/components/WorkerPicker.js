import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
export default function WorkerPicker({ dateISO, workers, onClose, onPick }) {
    const ref = useRef(null);
    const [selected, setSelected] = useState("");
    useEffect(() => {
        const onDoc = (e) => {
            if (!ref.current)
                return;
            if (!ref.current.contains(e.target))
                onClose();
        };
        const onEsc = (e) => {
            if (e.key === "Escape")
                onClose();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, [onClose]);
    if (embedded) {
        return (_jsx("div", { className: "pickerBody", children: _jsxs("select", { className: "select", value: selected, onChange: (e) => {
                    setSelected(e.target.value);
                    // Auto-pick if embedded? No, let user confirm or just pick.
                    // Actually, for ProjectTaskModal step 1, we want "Pick and Next".
                    // But current WorkerPicker has "Ochish" / "Majburiy".
                    // Let's just return the body content and let the parent handle buttons?
                    // Actually, ProjectTaskModal calls onPick(wid). 
                    // But WorkerPicker's onPick takes (wid, action).
                    // Let's keep the select logic.
                    // If embedded, maybe we don't show the footer buttons? 
                    // Or we just rely on parent to pass a custom onPick that handles the click.
                    // Let's simple reuse structure but remove overlay.
                    onPick(e.target.value, "VIEW"); // Trigger immediately on change for embedded?
                }, children: [_jsx("option", { value: "", children: "\u2014 Ishchini tanlang \u2014" }), workers.map((w) => (_jsx("option", { value: w.id, children: w.full_name }, w.id)))] }) }));
    }
    return (_jsx("div", { className: "modalOverlay", onMouseDown: onClose, role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "pickerBox", ref: ref, onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "pickerHeader", children: [_jsxs("div", { className: "pickerTitle", children: ["Sana: ", dateISO] }), _jsx("button", { className: "btn mini", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "pickerBody", children: [_jsx("div", { className: "muted small", children: "Ishchini tanlang" }), _jsxs("select", { className: "select", value: selected, onChange: (e) => {
                                setSelected(e.target.value);
                            }, children: [_jsx("option", { value: "", children: "\u2014 tanlang \u2014" }), workers.map((w) => (_jsx("option", { value: w.id, children: w.full_name }, w.id)))] })] }), _jsxs("div", { className: "pickerFooter", children: [_jsx("button", { className: "btn", onClick: onClose, children: "Bekor" }), _jsx("button", { className: "btn", disabled: !selected, onClick: () => onPick(selected, "VIEW"), children: "Ochish" }), _jsx("button", { className: "btn primary", disabled: !selected, onClick: () => onPick(selected, "TASK"), style: { background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }, children: "+ Majburiy ish qo\u2018shish" })] })] }) }));
}
