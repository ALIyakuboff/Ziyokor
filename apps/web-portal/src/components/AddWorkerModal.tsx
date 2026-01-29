import React, { useState } from "react";
import { createWorker } from "../api/admin";

type Props = {
    onClose: () => void;
    onCreated: () => void;
};

export default function AddWorkerModal({ onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ name: string; pass: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await createWorker(name, phone);
            setResult({ name: res.worker.full_name, pass: res.initial_password_last4 });
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="modalOverlay">
                <div className="card pad loginCard" style={{ background: "white", color: "#111" }}>
                    <div className="h2" style={{ color: "#222" }}>Ishchi qo'shildi!</div>
                    <div style={{ marginTop: 20, fontSize: 15 }}>
                        <p>Ism: <b>{result.name}</b></p>
                        <p>Login: <b>{phone}</b></p>
                        <p>Parol: <b style={{ fontSize: 20, color: "#e63946" }}>{result.pass}</b></p>
                    </div>
                    <div className="form">
                        <button
                            className="btn primary"
                            style={{ background: "#eee", color: "#222" }}
                            onClick={() => {
                                onCreated();
                                onClose();
                            }}
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modalOverlay">
            <div className="card pad loginCard" style={{ background: "white", color: "#111" }}>
                <div className="rowBetween">
                    <div className="h2" style={{ color: "#222" }}>Yangi ishchi</div>
                    <button className="linkBtn" onClick={onClose} style={{ color: "#888" }}>X</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        To'liq ism
                        <input
                            className="input"
                            style={{ background: "#f9f9f9", color: "#111" }}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masalan: Ali Valiyev"
                        />
                    </label>

                    <label className="label">
                        Telefon (Login)
                        <input
                            className="input"
                            style={{ background: "#f9f9f9", color: "#111" }}
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Masalan: 998901234567"
                        />
                    </label>

                    {error && <div className="error" style={{ color: "#d00" }}>{error}</div>}

                    <button className="btn primary" disabled={loading} style={{ background: "#222", color: "#fff" }}>
                        {loading ? "Saqlanmoqda..." : "Yaratish"}
                    </button>
                </form>
            </div>
        </div>
    );
}
