import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createWorker } from "../api/admin";
export default function AddWorkerModal({ onClose, onCreated }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await createWorker(name, phone);
            setResult({ name: res.worker.full_name, pass: res.initial_password_last4 });
        }
        catch (err) {
            setError(err.message || "Xatolik yuz berdi");
        }
        finally {
            setLoading(false);
        }
    };
    if (result) {
        return (_jsx("div", { className: "modalOverlay", children: _jsxs("div", { className: "card pad loginCard", style: { background: "white", color: "#111" }, children: [_jsx("div", { className: "h2", style: { color: "#222" }, children: "Ishchi qo'shildi!" }), _jsxs("div", { style: { marginTop: 20, fontSize: 15 }, children: [_jsxs("p", { children: ["Ism: ", _jsx("b", { children: result.name })] }), _jsxs("p", { children: ["Login: ", _jsx("b", { children: phone })] }), _jsxs("p", { children: ["Parol: ", _jsx("b", { style: { fontSize: 20, color: "#e63946" }, children: result.pass })] })] }), _jsx("div", { className: "form", children: _jsx("button", { className: "btn primary", style: { background: "#eee", color: "#222" }, onClick: () => {
                                onCreated();
                                onClose();
                            }, children: "Yopish" }) })] }) }));
    }
    return (_jsx("div", { className: "modalOverlay", children: _jsxs("div", { className: "card pad loginCard", style: { background: "white", color: "#111" }, children: [_jsxs("div", { className: "rowBetween", children: [_jsx("div", { className: "h2", style: { color: "#222" }, children: "Yangi ishchi" }), _jsx("button", { className: "linkBtn", onClick: onClose, style: { color: "#888" }, children: "X" })] }), _jsxs("form", { className: "form", onSubmit: handleSubmit, children: [_jsxs("label", { className: "label", children: ["To'liq ism", _jsx("input", { className: "input", style: { background: "#f9f9f9", color: "#111" }, required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Masalan: Ali Valiyev" })] }), _jsxs("label", { className: "label", children: ["Telefon (Login)", _jsx("input", { className: "input", style: { background: "#f9f9f9", color: "#111" }, required: true, value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "Masalan: 998901234567" })] }), error && _jsx("div", { className: "error", style: { color: "#d00" }, children: error }), _jsx("button", { className: "btn primary", disabled: loading, style: { background: "#222", color: "#fff" }, children: loading ? "Saqlanmoqda..." : "Yaratish" })] })] }) }));
}
