import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import WorkerPicker from "./WorkerPicker";
import { createProjectTask } from "../api/tasks";
export default function ProjectTaskModal({ workers, onClose, onSuccess, defaultDate }) {
    const [step, setStep] = useState(1); // 1=Pick Worker, 2=Details
    const [targetWorker, setTargetWorker] = useState(null);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(defaultDate || "");
    const [busy, setBusy] = useState(false);
    const handleWorkerPick = (wid) => {
        const w = workers.find(x => x.id === wid);
        setTargetWorker(w);
        setStep(2);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !date)
            return;
        setBusy(true);
        try {
            await createProjectTask(targetWorker.id, title, date);
            onSuccess();
        }
        catch (err) {
            alert(err.message || "Xatolik yuz berdi");
            setBusy(false);
        }
    };
    return (_jsx("div", { className: "modalOverlay", children: _jsxs("div", { className: "modalCard", children: [_jsxs("div", { className: "modalHeader", children: [_jsx("div", { className: "h3", children: "Yangi \"Project\" Topshiriq" }), _jsx("button", { className: "closeBtn", onClick: onClose, children: "\u00D7" })] }), step === 1 && (_jsxs("div", { className: "modalBody", children: [_jsx("p", { className: "muted", children: "Kimga biriktiramiz?" }), _jsx(WorkerPicker, { workers: workers, dateISO: defaultDate, onClose: onClose, onPick: (wid) => handleWorkerPick(wid), embedded: true })] })), step === 2 && targetWorker && (_jsxs("form", { onSubmit: handleSubmit, className: "modalBody", children: [_jsxs("div", { className: "formGroup", children: [_jsx("label", { children: "Ishchi:" }), _jsx("div", { className: "value", children: targetWorker.full_name })] }), _jsxs("div", { className: "formGroup", children: [_jsx("label", { children: "Sana:" }), _jsx("input", { type: "date", className: "input", value: date, onChange: e => setDate(e.target.value), required: true })] }), _jsxs("div", { className: "formGroup", children: [_jsx("label", { children: "Topshiriq matni (Project):" }), _jsx("textarea", { className: "input", rows: 3, value: title, onChange: e => setTitle(e.target.value), placeholder: "Masalan: Katta loyiha smetasini tuzish...", required: true })] }), _jsxs("div", { className: "notifBox", style: { marginTop: 10 }, children: [_jsx("i", { className: "fa-solid fa-info-circle" }), _jsx("div", { children: "Bu topshiriq bajarilmasa, 2 oygacha avtomatik keyingi kunga ko'chib yuradi." })] }), _jsxs("div", { className: "modalFooter", children: [_jsx("button", { type: "button", className: "btn secondary", onClick: () => setStep(1), children: "Ortga" }), _jsx("button", { type: "submit", className: "btn primary", disabled: busy, children: busy ? "Saqlanmoqda..." : "Saqlash" })] })] }))] }) }));
}
