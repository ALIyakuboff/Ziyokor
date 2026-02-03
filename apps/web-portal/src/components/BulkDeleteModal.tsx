import React, { useState } from "react";
import { todayISO } from "../utils/date";

type BulkDeleteModalProps = {
    workers: { id: string; full_name: string }[];
    onClose: () => void;
    onSuccess: () => void;
};

export default function BulkDeleteModal({ workers, onClose, onSuccess }: BulkDeleteModalProps) {
    const [workerId, setWorkerId] = useState("");
    const [taskType, setTaskType] = useState<"mandatory" | "normal" | "project" | "all">("all");
    const [startDate, setStartDate] = useState(todayISO());
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!workerId) {
            alert("Ishchini tanlang");
            return;
        }

        const today = todayISO();
        if (startDate < today) {
            alert("Oldingi ishlarni o'chirib bo'lmaydi");
            return;
        }

        if (!window.confirm("Tanlangan topshiriqlar butunlay o'chiriladi. Ishonchingiz komilmi?")) {
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/admin/bulk-delete-tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("wc_token")}`
                },
                body: JSON.stringify({ worker_id: workerId, task_type: taskType, start_date: startDate })
            });

            const text = await res.text();
            let data: any;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (err) {
                console.error("Non-JSON response:", text);
                throw new Error("Server xatosi (JSON emas)");
            }

            if (!res.ok) throw new Error(data.error || data.message || "Xatolik");

            alert(`Muvaffaqiyatli o'chirildi: ${data.deleted_count} ta topshiriq`);
            onSuccess();
        } catch (e: any) {
            console.error("Bulk Delete error:", e);
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalCard" style={{ width: "min(400px, 94vw)" }} onClick={e => e.stopPropagation()}>
                <div className="modalHeader" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
                    <div>
                        <div className="modalTitle" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-trash-can"></i>
                            Ommaviy o'chirish
                        </div>
                        <div className="muted small">Topshiriqlarni guruhlab o'chirish</div>
                    </div>
                    <button className="btn mini" onClick={onClose} disabled={loading}>✕</button>
                </div>

                <div className="modalBody" style={{ padding: '20px 24px' }}>
                    <div className="formGroup" style={{ marginBottom: 16 }}>
                        <label className="label">Ishchi</label>
                        <select className="input" value={workerId} onChange={e => setWorkerId(e.target.value)} style={{ width: '100%' }}>
                            <option value="">Tanlang...</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>{w.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="formGroup" style={{ marginBottom: 16 }}>
                        <label className="label">Topshiriq turi</label>
                        <select className="input" value={taskType} onChange={e => setTaskType(e.target.value as any)} style={{ width: '100%' }}>
                            <option value="all">Hammasi</option>
                            <option value="mandatory" style={{ fontWeight: 'bold' }}>Majburiy ishlar</option>
                            <option value="normal">Mening ishlarim</option>
                            <option value="project">Project topshiriqlar</option>
                        </select>
                    </div>

                    <div className="formGroup" style={{ marginBottom: 20 }}>
                        <label className="label">Qachondan boshlab</label>
                        <input
                            type="date"
                            className="input"
                            style={{ width: '100%' }}
                            value={startDate}
                            min={todayISO()}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <div className="muted small" style={{ marginTop: 6, fontSize: 11 }}>
                            <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }}></i>
                            Faqat bugun va kelajakdagi ishlar o'chiriladi
                        </div>
                    </div>

                    <div className="dangerBox" style={{
                        background: 'rgba(255, 77, 77, 0.08)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 12,
                        color: '#ff7070',
                        lineHeight: 1.4
                    }}>
                        <strong>DIQQAT:</strong> O'chirilgan topshiriqlar qayta tiklanmaydi. Barcha izohlar ham birga o'chirib yuboriladi.
                    </div>
                </div>

                <div className="modalFooter" style={{ background: 'var(--bg-card-alt)', borderTop: '1px solid var(--border-subtle)' }}>
                    <button className="btn" onClick={onClose} disabled={loading} style={{ border: 'none', background: 'transparent' }}>Bekor qilish</button>
                    <button className="btn danger" onClick={handleConfirm} disabled={loading} style={{
                        background: 'var(--danger)',
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '8px 20px',
                        borderRadius: 8
                    }}>
                        {loading ? "O'chirilmoqda..." : "Tasdiqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
}
