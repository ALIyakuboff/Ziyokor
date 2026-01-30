import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import Header3Panel from "../components/Header3Panel";
import AddWorkerModal from "../components/AddWorkerModal";
import { listWorkers } from "../api/admin";
import { todayISO } from "../utils/date";
export default function AdminHomeRoute() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const anchor = useMemo(() => {
        const hash = window.location.hash || "";
        const q = hash.split("?")[1] || "";
        const p = new URLSearchParams(q);
        return p.get("anchor") || todayISO();
    }, [window.location.hash]);
    const load = async () => {
        try {
            const r = await listWorkers();
            setWorkers(r.workers);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    return (_jsxs("div", { className: "screen", children: [_jsx(Header3Panel, { workers: workers, anchor: anchor }), _jsx("div", { className: "content", children: _jsxs("div", { className: "card pad", children: [_jsx("div", { className: "rowBetween", style: { marginBottom: 12 }, children: _jsx("div", { className: "h2", style: { cursor: "pointer" }, onClick: () => window.location.hash = "#/", children: "Admin Dashboard" }) }), _jsxs("p", { className: "muted", children: ["Chapdagi ", _jsx("b", { children: "Admin >" }), " orqali ishchini tanlab 6 ta card ko\u2018rinishini oching."] }), _jsx("p", { className: "muted", children: "Mini calendar (kun raqami) bosilsa \u2192 calendar ochiladi \u2192 sana tanlaysiz \u2192 keyin ishchini tanlaysiz." }), loading && _jsx("div", { className: "muted", children: "Ishchilar yuklanmoqda..." }), !loading && workers.length === 0 && _jsx("div", { className: "muted", children: "Hozircha ishchi yo\u2018q." })] }) }), showAdd && (_jsx(AddWorkerModal, { onClose: () => setShowAdd(false), onCreated: () => load() }))] }));
}
