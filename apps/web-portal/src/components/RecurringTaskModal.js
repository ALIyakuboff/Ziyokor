import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { createRecurringTemplate } from "../api/tasks";
export default function RecurringTaskModal({ workers, onClose, onSuccess }) {
    const [tasks, setTasks] = useState(Array(10).fill(""));
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMandatory, setIsMandatory] = useState(true);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    // Dropdown state for workers
    const [workerDropOpen, setWorkerDropOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setWorkerDropOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleTaskChange = (index, val) => {
        const newTasks = [...tasks];
        newTasks[index] = val;
        setTasks(newTasks);
    };
    const toggleAllWorkers = () => {
        if (selectedIds.length === workers.length)
            setSelectedIds([]);
        else
            setSelectedIds(workers.map(w => w.id));
    };
    const toggleWorker = (id, e) => {
        e?.stopPropagation();
        if (selectedIds.includes(id))
            setSelectedIds(selectedIds.filter(x => x !== id));
        else
            setSelectedIds([...selectedIds, id]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const activeTitles = tasks.filter(t => t.trim() !== "");
        if (activeTitles.length === 0) {
            setErr("Hech bo'lmaganda bitta vazifa yozing");
            return;
        }
        if (selectedIds.length === 0) {
            setErr("Hech bo'lmaganda bitta ishchini tanlang");
            return;
        }
        setLoading(true);
        setErr(null);
        try {
            await createRecurringTemplate(selectedIds, activeTitles, isMandatory);
            onSuccess();
        }
        catch (err) {
            setErr(err.message || "Xatolik yuz berdi");
        }
        finally {
            setLoading(false);
        }
    };
    const selectedCount = selectedIds.length;
    let workerLabel = "Ishchilarni tanlang...";
    if (selectedCount > 0) {
        if (selectedCount === workers.length)
            workerLabel = "Barcha ishchilar";
        else
            workerLabel = `${selectedCount} ta ishchi tanlandi`;
    }
    return (_jsx("div", { className: "modalOverlay", onClick: onClose, children: _jsxs("div", { className: "modalCard", style: { width: "min(550px, 94vw)", overflow: "visible" }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modalHeader", children: [_jsxs("div", { children: [_jsx("div", { className: "modalTitle", children: "Doimiy ish qo\u2018shish" }), _jsx("div", { className: "muted small", children: "Har kuni avtomatik yaratiladi" })] }), _jsx("button", { className: "btn mini", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "modalBody", style: { maxHeight: "70vh", overflowY: "auto", padding: "16px 24px" }, children: [err && _jsx("div", { className: "error small", style: { marginBottom: 10 }, children: err }), _jsxs("div", { style: { marginBottom: 20, position: "relative" }, ref: dropdownRef, children: [_jsx("label", { className: "label", style: { marginBottom: 8, display: "block", fontSize: 13, fontWeight: "bold", opacity: 0.9 }, children: "Mas'ul Ishchilar" }), _jsxs("div", { onClick: () => setWorkerDropOpen(!workerDropOpen), style: {
                                        padding: "11px 16px",
                                        background: "var(--bg-card)",
                                        border: `1.5px solid ${workerDropOpen ? 'var(--primary)' : 'var(--border-subtle)'}`,
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: 14,
                                        transition: "all 0.2s ease"
                                    }, children: [_jsx("span", { style: { color: selectedCount ? "var(--text-primary)" : "var(--muted)" }, children: workerLabel }), _jsx("i", { className: `fa-solid fa-angle-${workerDropOpen ? 'up' : 'down'}`, style: { fontSize: 13, opacity: 0.5 } })] }), workerDropOpen && (_jsxs("div", { style: {
                                        position: "absolute",
                                        top: "100%", left: 0, right: 0,
                                        marginTop: 6,
                                        background: "#1a1c1e", // Solid dark background for dark mode consistency
                                        border: "1px solid var(--border-input)",
                                        borderRadius: 12,
                                        boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
                                        zIndex: 999, // Ensure it's above all modal content
                                        maxHeight: 220,
                                        overflowY: "auto",
                                        padding: "8px"
                                    }, children: [_jsxs("div", { onClick: toggleAllWorkers, style: {
                                                padding: "12px 14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                cursor: "pointer",
                                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                                                marginBottom: 6,
                                                borderRadius: 8,
                                                background: selectedCount === workers.length ? "rgba(65, 209, 122, 0.1)" : "transparent"
                                            }, children: [_jsx("div", { style: {
                                                        width: 18, height: 18,
                                                        border: selectedCount === workers.length ? "none" : "2px solid #555",
                                                        background: selectedCount === workers.length ? "var(--primary)" : "transparent",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 10, color: "#000", borderRadius: 4
                                                    }, children: selectedCount === workers.length && _jsx("i", { className: "fa-solid fa-check" }) }), _jsx("span", { style: { fontSize: 14, fontWeight: "bold", color: "#fff" }, children: selectedCount === workers.length ? "Barchasini bekor qilish" : "Barchasini tanlash" })] }), workers.map(w => {
                                            const isSel = selectedIds.includes(w.id);
                                            return (_jsxs("div", { onClick: () => toggleWorker(w.id), style: {
                                                    padding: "10px 14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    cursor: "pointer",
                                                    borderRadius: 8,
                                                    background: isSel ? "rgba(65, 209, 122, 0.1)" : "transparent",
                                                    marginBottom: 2
                                                }, children: [_jsx("span", { style: { fontSize: 14, color: isSel ? "var(--primary)" : "#ccc", fontWeight: isSel ? "600" : "400" }, children: w.full_name }), isSel && _jsx("i", { className: "fa-solid fa-check", style: { color: "var(--primary)", fontSize: 12 } })] }, w.id));
                                        })] }))] }), _jsxs("div", { style: { marginBottom: 20, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }, onClick: () => setIsMandatory(!isMandatory), children: [_jsx("div", { style: { width: 20, height: 20, border: isMandatory ? "none" : "2px solid var(--border-subtle)", background: isMandatory ? "#41d17a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000", borderRadius: 6 }, children: isMandatory && _jsx("i", { className: "fa-solid fa-check" }) }), _jsx("span", { style: { fontSize: 14, fontWeight: "bold" }, children: "Asosiy topshiriq (Majburiy)" })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [_jsx("label", { className: "label", style: { fontSize: 13, fontWeight: "bold" }, children: "Vazifalar (Har kuni takrorlanadi)" }), tasks.map((task, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsxs("div", { style: { width: 24, fontWeight: "900", color: "var(--muted)", fontSize: 14, textAlign: "right" }, children: [i + 1, "."] }), _jsx("input", { className: "input", style: { flex: 1, height: 38, fontSize: 14 }, value: task, placeholder: "Topshiriq mazmuni...", onChange: (e) => handleTaskChange(i, e.target.value) })] }, i)))] })] }), _jsxs("div", { className: "modalFooter", style: { padding: "12px 24px" }, children: [_jsx("button", { className: "btn", onClick: onClose, style: { marginRight: 10 }, children: "Bekor" }), _jsx("button", { className: "btn primary", onClick: handleSubmit, disabled: loading, style: { background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }, children: loading ? "..." : "Tasdiqlash" })] })] }) }));
}
