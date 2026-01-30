import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import { useSession } from "./state/session";
import Login from "./pages/Login";
import AdminHomeRoute from "./routes/admin.home";
import AdminWorkerWeekRoute from "./routes/admin.worker_week";
import WorkerWeekRoute from "./routes/worker/worker.week";
import { initSocket, disconnectSocket } from "./socket";
function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
}
export default function App() {
    const { token, user } = useSession();
    // Theme persistence
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "light") {
            document.body.classList.add("light-mode");
        }
    }, []);
    // Initialize Socket.IO when logged in
    useEffect(() => {
        if (token) {
            initSocket(token);
            return () => {
                disconnectSocket();
            };
        }
    }, [token]);
    const [hash, setHash] = React.useState(window.location.hash);
    useEffect(() => {
        const onHashChange = () => setHash(window.location.hash);
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);
    const path = hash.split("?")[0].replace("#", "");
    if (!token)
        return _jsx(Login, {});
    // Role-based routing
    if (user?.role === "admin") {
        // if (!isDesktop()) return <AdminOnlyDesktop />; // Removed mobile restriction
        if (path === "/worker")
            return _jsx(AdminWorkerWeekRoute, {});
        return _jsx(AdminHomeRoute, {});
    }
    // Worker routing
    if (user?.role === "worker") {
        if (path === "/day")
            return _jsx(WorkerWeekRoute, { mode: "day" });
        return _jsx(WorkerWeekRoute, { mode: "week" });
    }
    return (_jsx("div", { className: "screen center", children: _jsxs("div", { className: "card pad", children: [_jsx("h2", { className: "h2", children: "Ruxsat yo'q" }), _jsx("p", { className: "muted", children: "Sizning rolingiz aniqlanmadi." })] }) }));
}
