import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { deactivateWorker } from "../api/admin";
export default function AdminDropdown({ workers, onClose, onPick }) {
    const ref = useRef(null);
    const [editMode, setEditMode] = useState(false);
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
    async function handleDeactivate(id, name) {
        if (!confirm(`${name} o'chirilsinmi? (Ma'lumotlari saqlanib qoladi, lekin ro'yxatda ko'rinmaydi)`))
            return;
        try {
            await deactivateWorker(id);
            window.location.reload();
        }
        catch (e) {
            alert("Xato: " + (e?.message || "O'chirib bo'lmadi"));
        }
    }
    return (_jsx("div", { className: "dropdown", ref: ref, children: _jsxs("div", { className: "dropdownList", children: [_jsxs("div", { className: "rowBetween padSm", style: { borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }, children: [_jsx("button", { className: "linkBtn", style: { color: "#41d17a", fontWeight: "bold", fontSize: "14px" }, onClick: () => onPick("CREATE_NEW"), children: "+ Ishchi qo\u2018shish" }), _jsx("button", { className: `btn mini ${editMode ? "danger" : ""}`, style: { padding: "2px 6px" }, onClick: () => setEditMode(!editMode), title: "Tahrirlash", children: editMode ? "✓" : "⚙️" })] }), workers.length === 0 && _jsx("div", { className: "muted small padSm", children: "Ishchi yo\u2018q" }), workers.map((w) => (_jsxs("div", { className: "dropdownItemRow", style: { display: "flex", alignItems: "center" }, children: [_jsx("button", { className: "dropdownItem", style: { flex: 1, textAlign: "left" }, onClick: () => onPick(w.id), children: w.full_name }), editMode && (_jsx("button", { className: "linkBtn", style: { padding: "0 10px", color: "#ff4d4d" }, onClick: () => handleDeactivate(w.id, w.full_name), children: "\uD83D\uDDD1\uFE0F" }))] }, w.id)))] }) }));
}
