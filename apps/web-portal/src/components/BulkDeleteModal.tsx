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

        if (!window.confirm("Tanlangan topshiriqlar butunlay o'chiriladi. Ishonchingiz komilmi?")) {
            return;
        }

        setLoading(true);
        try {
            const today = todayISO();
            if (startDate < today) {
                alert("O'tmishdagi ishlarni o'chirib bo'lmaydi");
                setLoading(false);
                return;
            }

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
            <div className="modal card pad" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div className="h2" style={{ marginBottom: 16 }}>O'chirish (Bulk Delete)</div>

                <div className="formGroup">
                    <label>Ishchi</label>
                    <select className="input" value={workerId} onChange={e => setWorkerId(e.target.value)}>
                        <option value="">Tanlang...</option>
                        {workers.map(w => (
                            <option key={w.id} value={w.id}>{w.full_name}</option>
                        ))}
                    </select>
                </div>

                <div className="formGroup">
                    <label>Topshiriq turi</label>
                    <select className="input" value={taskType} onChange={e => setTaskType(e.target.value as any)}>
                        <option value="all">Hammasi</option>
                        <option value="mandatory">Majburiy ishlar</option>
                        <option value="normal">Mening ishlarim</option>
                        <option value="project">Project topshiriqlar</option>
                    </select>
                </div>

                <div className="formGroup">
                    <label>Shu sanadan boshlab (shu sana ham kiradi)</label>
                    <input
                        type="date"
                        className="input"
                        value={startDate}
                        min={todayISO()}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>

                <div className="muted small" style={{ marginBottom: 16 }}>
                    Belgilangan sanadan keyingi bajarilmagan barcha topshiriqlar o'chiriladi.
                </div>

                <div className="rowEnd" style={{ gap: 8 }}>
                    <button className="btn secondary" onClick={onClose} disabled={loading}>Bekor qilish</button>
                    <button className="btn danger" onClick={handleConfirm} disabled={loading}>
                        {loading ? "O'chirilmoqda..." : "O'chirish"}
                    </button>
                </div>
            </div>
        </div>
    );
}
