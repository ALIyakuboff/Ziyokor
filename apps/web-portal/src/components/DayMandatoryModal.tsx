import React, { useState } from "react";
import { createOneOffMandatoryTask } from "../api/admin";

export default function DayMandatoryModal({
    workerId,
    workerName,
    date,
    onClose,
    onSuccess
}: {
    workerId: string;
    workerName: string;
    date: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    // Numbered slots: let's start with 10 slots
    const [tasks, setTasks] = useState<string[]>(Array(10).fill(""));
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const handleTaskChange = (index: number, val: string) => {
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
        } catch (e: any) {
            setErr(e?.message || "Saqlashda xato yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalCard" style={{ width: "min(500px, 94vw)" }} onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <div>
                        <div className="modalTitle">Majburiy ish qo‘shish</div>
                        <div className="muted small">{workerName} • {date}</div>
                    </div>
                    <button className="btn mini" onClick={onClose}>✕</button>
                </div>

                <div className="modalBody" style={{ maxHeight: "60vh", overflowY: "auto", gap: "10px", padding: "16px 24px" }}>
                    {err && <div className="error small" style={{ marginBottom: 10 }}>{err}</div>}

                    {tasks.map((task, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "24px", fontWeight: "900", color: "var(--muted)", fontSize: "14px" }}>{i + 1}.</div>
                            <input
                                className="input"
                                style={{ flex: 1, height: "38px", fontSize: "14px" }}
                                value={task}
                                placeholder="Topshiriq mazmuni..."
                                onChange={(e) => handleTaskChange(i, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="modalFooter" style={{ padding: "12px 24px" }}>
                    <button className="btn" onClick={onClose} style={{ marginRight: 10 }}>Bekor</button>
                    <button className="btn primary" onClick={submit} disabled={loading} style={{ background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }}>
                        {loading ? "..." : "Tasdiqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
}
