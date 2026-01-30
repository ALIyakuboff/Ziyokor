import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createOneOffMandatoryTask } from "../api/admin";
export default function DayMandatoryModal({ workerId, workerName, date, onClose, onSuccess }) {
    // Numbered slots: let's start with 10 slots
    const [tasks, setTasks] = useState(Array(10).fill(""));
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const handleTaskChange = (index, val) => {
        const newTasks = [...tasks];
        newTasks[index] = val;
        setTasks(newTasks);
    };
    const submit = async () => {
        const activeTasks = tasks.filter(t => t.trim() !== "");
        if (activeTasks.length === 0) {
            setErr("Hech bo‘lmaganda bitta vazifa yozing");
            return;
        }
        setLoading(true);
        setErr(null);
        try {
            for (const title of activeTasks) {
                await createOneOffMandatoryTask(workerId, title, date);
            }
            onSuccess();
        }
        catch (e) {
            setErr(e?.message || "Saqlashda xato yuz berdi");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "modalOverlay", onClick: onClose, children: _jsxs("div", { className: "modalCard", style: { width: "min(500px, 94vw)" }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modalHeader", children: [_jsxs("div", { children: [_jsx("div", { className: "modalTitle", children: "Majburiy ish qo\u2018shish" }), _jsxs("div", { className: "muted small", children: [workerName, " \u2022 ", date] })] }), _jsx("button", { className: "btn mini", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "modalBody", style: { maxHeight: "60vh", overflowY: "auto", gap: "10px", padding: "16px 24px" }, children: [err && _jsx("div", { className: "error small", style: { marginBottom: 10 }, children: err }), tasks.map((task, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [_jsxs("div", { style: { width: "24px", fontWeight: "900", color: "var(--muted)", fontSize: "14px" }, children: [i + 1, "."] }), _jsx("input", { className: "input", style: { flex: 1, height: "38px", fontSize: "14px" }, value: task, placeholder: "Topshiriq mazmuni...", onChange: (e) => handleTaskChange(i, e.target.value) })] }, i)))] }), _jsxs("div", { className: "modalFooter", style: { padding: "12px 24px" }, children: [_jsx("button", { className: "btn", onClick: onClose, style: { marginRight: 10 }, children: "Bekor" }), _jsx("button", { className: "btn primary", onClick: submit, disabled: loading, style: { background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }, children: loading ? "..." : "Tasdiqlash" })] })] }) }));
}
