import React, { useState } from "react";
import { createWorker } from "../api/admin";

export default function CreateWorkerModal({
    onClose,
    onSuccess
}: {
    onClose: () => void;
    onSuccess: (newItem: any) => void;
}) {
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        try {
            const res = await createWorker(fullName, phone);
            alert(`Ishchi yaratildi!\nLogin: ${res.worker.phone_login}\nParol: ${res.initial_password_last4}`);
            onSuccess(res.worker);
        } catch (e: any) {
            setErr(e?.message || "Xato");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <div className="modalTitle">Yangi Ishchi Qo‘shish</div>
                    <button className="btn mini" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <form className="modalBody" onSubmit={submit}>
                    {err && <div className="error small">{err}</div>}
                    <div className="label">
                        Ism Familiya
                        <input
                            className="input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Vali Aliyev"
                        />
                    </div>
                    <div className="label">
                        Telefon (Login)
                        <input
                            className="input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="998901234567"
                            type="number"
                        />
                    </div>
                    <div className="modalFooter">
                        <button type="submit" className="btn ok" disabled={loading}>
                            {loading ? "..." : "Yaratish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
