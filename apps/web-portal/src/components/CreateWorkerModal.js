import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createWorker } from "../api/admin";
export default function CreateWorkerModal({ onClose, onSuccess }) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        try {
            const res = await createWorker(fullName, phone);
            alert(`Ishchi yaratildi!\nLogin: ${res.worker.phone_login}\nParol: ${res.initial_password_last4}`);
            onSuccess(res.worker);
        }
        catch (e) {
            setErr(e?.message || "Xato");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "modalOverlay", onClick: onClose, children: _jsxs("div", { className: "modalCard", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modalHeader", children: [_jsx("div", { className: "modalTitle", children: "Yangi Ishchi Qo\u2018shish" }), _jsx("button", { className: "btn mini", onClick: onClose, children: _jsx("i", { className: "fa-solid fa-xmark" }) })] }), _jsxs("form", { className: "modalBody", onSubmit: submit, children: [err && _jsx("div", { className: "error small", children: err }), _jsxs("div", { className: "label", children: ["Ism Familiya", _jsx("input", { className: "input", value: fullName, onChange: (e) => setFullName(e.target.value), required: true, placeholder: "Vali Aliyev" })] }), _jsxs("div", { className: "label", children: ["Telefon (Login)", _jsx("input", { className: "input", value: phone, onChange: (e) => setPhone(e.target.value), required: true, placeholder: "998901234567", type: "number" })] }), _jsx("div", { className: "modalFooter", children: _jsx("button", { type: "submit", className: "btn ok", disabled: loading, children: loading ? "..." : "Yaratish" }) })] })] }) }));
}
