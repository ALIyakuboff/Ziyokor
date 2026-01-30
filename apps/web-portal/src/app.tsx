import React, { useEffect } from "react";
import { useSession } from "./state/session";
import Login from "./pages/Login";
import AdminOnlyDesktop from "./pages/AdminOnlyDesktop";
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

    if (!token) return <Login />;

    // Role-based routing
    if (user?.role === "admin") {
        // if (!isDesktop()) return <AdminOnlyDesktop />; // Removed mobile restriction

        if (path === "/worker") return <AdminWorkerWeekRoute />;
        return <AdminHomeRoute />;
    }

    // Worker routing
    if (user?.role === "worker") {
        if (path === "/day") return <WorkerWeekRoute mode="day" />;
        return <WorkerWeekRoute mode="week" />;
    }

    return (
        <div className="screen center">
            <div className="card pad">
                <h2 className="h2">Ruxsat yo'q</h2>
                <p className="muted">Sizning rolingiz aniqlanmadi.</p>
            </div>
        </div>
    );
}
// Trigger deployment for ziyokor.vercel.app
