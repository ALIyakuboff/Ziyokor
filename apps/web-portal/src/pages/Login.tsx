import React, { useState } from "react";
import { login } from "../api/auth";
import { useSession } from "../state/session";

export default function Login() {
    const { setSession } = useSession();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            const res = await login({ phone_login: phone, password });

            // Start splash animation
            setShowSplash(true);

            // Wait 5 seconds before entering the app
            setTimeout(() => {
                setSession(res.token, res.user);
                window.location.hash = "#/admin";
            }, 5000);

        } catch (e: any) {
            setErr(e?.message || "Login xatosi");
            setLoading(false);
        }
    }

    if (showSplash) {
        return (
            <div className="loginSplash">
                <div className="splashLogo">
                    <img src="/ziyokor-logo.jpg" alt="Ziyokor Logo" />
                </div>
                <div className="splashTitle">ZIYOKOR</div>
                <div className="splashProgressTrack">
                    <div className="splashProgressFill"></div>
                </div>
                <p className="muted" style={{ marginTop: 20 }}>Tizimga kirilmoqda...</p>
            </div>
        );
    }

    return (
        <div className="screen center">
            <div className="card loginCard">
                <h1 className="h1">Kirish</h1>
                <p className="muted">Telefon raqam va parol</p>

                <form onSubmit={onSubmit} className="form">
                    <label className="label">
                        Telefon
                        <input
                            className="input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="99890..."
                            disabled={loading}
                        />
                    </label>

                    <label className="label">
                        Parol
                        <input
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="****"
                            type="password"
                            disabled={loading}
                        />
                    </label>

                    {err && <div className="error">{err}</div>}

                    <button className="btn primary" disabled={loading}>
                        {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    );
}
