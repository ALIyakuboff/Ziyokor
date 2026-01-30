import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function TaskTimer({ startedAt }) {
    const [elapsed, setElapsed] = useState("");
    useEffect(() => {
        const start = new Date(startedAt).getTime();
        function update() {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((now - start) / 1000));
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            setElapsed(`${m}:${s < 10 ? '0' : ''}${s}`);
        }
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [startedAt]);
    return (_jsxs("span", { className: "small", style: { color: "#41d17a", fontWeight: 800 }, children: ["\u26A1 ", elapsed] }));
}
