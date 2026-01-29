import React, { useState, useRef, useEffect } from "react";
import { createRecurringTemplate, Worker } from "../api/tasks";

type Props = {
    workers: Worker[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function RecurringTaskModal({ workers, onClose, onSuccess }: Props) {
    const [tasks, setTasks] = useState<string[]>(Array(10).fill(""));
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isMandatory, setIsMandatory] = useState(true);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Dropdown state for workers
    const [workerDropOpen, setWorkerDropOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setWorkerDropOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTaskChange = (index: number, val: string) => {
        const newTasks = [...tasks];
        newTasks[index] = val;
        setTasks(newTasks);
    };

    const toggleAllWorkers = () => {
        if (selectedIds.length === workers.length) setSelectedIds([]);
        else setSelectedIds(workers.map(w => w.id));
    };

    const toggleWorker = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(x => x !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
        } catch (err: any) {
            setErr(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const selectedCount = selectedIds.length;
    let workerLabel = "Ishchilarni tanlang...";
    if (selectedCount > 0) {
        if (selectedCount === workers.length) workerLabel = "Barcha ishchilar";
        else workerLabel = `${selectedCount} ta ishchi tanlandi`;
    }

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalCard" style={{ width: "min(550px, 94vw)", overflow: "visible" }} onClick={(e) => e.stopPropagation()}>
                {/* Header matching DayMandatoryModal */}
                <div className="modalHeader">
                    <div>
                        <div className="modalTitle">Doimiy ish qo‘shish</div>
                        <div className="muted small">Har kuni avtomatik yaratiladi</div>
                    </div>
                    <button className="btn mini" onClick={onClose}>✕</button>
                </div>

                <div className="modalBody" style={{ maxHeight: "70vh", overflowY: "auto", padding: "16px 24px" }}>
                    {err && <div className="error small" style={{ marginBottom: 10 }}>{err}</div>}

                    {/* Simple Worker Selection Dropdown */}
                    <div style={{ marginBottom: 20, position: "relative" }} ref={dropdownRef}>
                        <label className="label" style={{ marginBottom: 8, display: "block", fontSize: 13, fontWeight: "bold", opacity: 0.9 }}>
                            Mas'ul Ishchilar
                        </label>
                        <div
                            onClick={() => setWorkerDropOpen(!workerDropOpen)}
                            style={{
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
                            }}
                        >
                            <span style={{ color: selectedCount ? "var(--text-primary)" : "var(--muted)" }}>
                                {workerLabel}
                            </span>
                            <i className={`fa-solid fa-angle-${workerDropOpen ? 'up' : 'down'}`} style={{ fontSize: 13, opacity: 0.5 }}></i>
                        </div>

                        {workerDropOpen && (
                            <div style={{
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
                            }}>
                                <div
                                    onClick={toggleAllWorkers}
                                    style={{
                                        padding: "12px 14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        cursor: "pointer",
                                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                                        marginBottom: 6,
                                        borderRadius: 8,
                                        background: selectedCount === workers.length ? "rgba(65, 209, 122, 0.1)" : "transparent"
                                    }}
                                >
                                    <div style={{
                                        width: 18, height: 18,
                                        border: selectedCount === workers.length ? "none" : "2px solid #555",
                                        background: selectedCount === workers.length ? "var(--primary)" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, color: "#000", borderRadius: 4
                                    }}>
                                        {selectedCount === workers.length && <i className="fa-solid fa-check"></i>}
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
                                        {selectedCount === workers.length ? "Barchasini bekor qilish" : "Barchasini tanlash"}
                                    </span>
                                </div>
                                {workers.map(w => {
                                    const isSel = selectedIds.includes(w.id);
                                    return (
                                        <div
                                            key={w.id}
                                            onClick={() => toggleWorker(w.id)}
                                            style={{
                                                padding: "10px 14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                cursor: "pointer",
                                                borderRadius: 8,
                                                background: isSel ? "rgba(65, 209, 122, 0.1)" : "transparent",
                                                marginBottom: 2
                                            }}
                                        >
                                            <span style={{ fontSize: 14, color: isSel ? "var(--primary)" : "#ccc", fontWeight: isSel ? "600" : "400" }}>
                                                {w.full_name}
                                            </span>
                                            {isSel && <i className="fa-solid fa-check" style={{ color: "var(--primary)", fontSize: 12 }}></i>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Mandatory Toggle */}
                    <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setIsMandatory(!isMandatory)}>
                        <div style={{ width: 20, height: 20, border: isMandatory ? "none" : "2px solid var(--border-subtle)", background: isMandatory ? "#41d17a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000", borderRadius: 6 }}>
                            {isMandatory && <i className="fa-solid fa-check"></i>}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: "bold" }}>Asosiy topshiriq (Majburiy)</span>
                    </div>

                    {/* Task Slots - matching DayMandatoryModal */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <label className="label" style={{ fontSize: 13, fontWeight: "bold" }}>Vazifalar (Har kuni takrorlanadi)</label>
                        {tasks.map((task, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 24, fontWeight: "900", color: "var(--muted)", fontSize: 14, textAlign: "right" }}>{i + 1}.</div>
                                <input
                                    className="input"
                                    style={{ flex: 1, height: 38, fontSize: 14 }}
                                    value={task}
                                    placeholder="Topshiriq mazmuni..."
                                    onChange={(e) => handleTaskChange(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modalFooter" style={{ padding: "12px 24px" }}>
                    <button className="btn" onClick={onClose} style={{ marginRight: 10 }}>Bekor</button>
                    <button className="btn primary" onClick={handleSubmit} disabled={loading} style={{ background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }}>
                        {loading ? "..." : "Tasdiqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
}
