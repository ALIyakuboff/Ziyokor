import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { login } from "../api/auth";
import { useSession } from "../state/session";
export default function Login() {
    const { setSession } = useSession();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    async function onSubmit(e) {
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
        }
        catch (e) {
            setErr(e?.message || "Login xatosi");
            setLoading(false);
        }
    }
    if (showSplash) {
        return (_jsxs("div", { className: "loginSplash", children: [_jsx("div", { className: "splashLogo", children: _jsx("img", { src: "/ziyokor-logo.jpg", alt: "Ziyokor Logo" }) }), _jsx("div", { className: "splashTitle", children: "ZIYOKOR" }), _jsx("div", { className: "splashProgressTrack", children: _jsx("div", { className: "splashProgressFill" }) }), _jsx("p", { className: "muted", style: { marginTop: 20 }, children: "Tizimga kirilmoqda..." })] }));
    }
    return (_jsx("div", { className: "screen center", children: _jsxs("div", { className: "card loginCard", children: [_jsx("h1", { className: "h1", children: "Kirish" }), _jsx("p", { className: "muted", children: "Telefon raqam va parol" }), _jsxs("form", { onSubmit: onSubmit, className: "form", children: [_jsxs("label", { className: "label", children: ["Telefon", _jsx("input", { className: "input", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "99890...", disabled: loading })] }), _jsxs("label", { className: "label", children: ["Parol", _jsx("input", { className: "input", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "****", type: "password", disabled: loading })] }), err && _jsx("div", { className: "error", children: err }), _jsx("button", { className: "btn primary", disabled: loading, children: loading ? _jsx("i", { className: "fa-solid fa-circle-notch fa-spin" }) : "Kirish" })] })] }) }));
}
