import React, { useEffect, useMemo, useState } from "react";
import Header3Panel from "../components/Header3Panel";
import AddWorkerModal from "../components/AddWorkerModal";
import { listWorkers } from "../api/admin";
import { todayISO } from "../utils/date";

export default function AdminHomeRoute() {
    const [workers, setWorkers] = useState<{ id: string; full_name: string }[]>([]);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="screen">
            <Header3Panel workers={workers} anchor={anchor} />

            <div className="content">
                <div className="card pad">
                    <div className="rowBetween" style={{ marginBottom: 12 }}>
                        <div className="h2" style={{ cursor: "pointer" }} onClick={() => window.location.hash = "#/"}>Admin Dashboard</div>
                    </div>

                    <p className="muted">
                        Chapdagi <b>Admin &gt;</b> orqali ishchini tanlab 6 ta card ko‘rinishini oching.
                    </p>
                    <p className="muted">
                        Mini calendar (kun raqami) bosilsa → calendar ochiladi → sana tanlaysiz → keyin ishchini tanlaysiz.
                    </p>

                    {loading && <div className="muted">Ishchilar yuklanmoqda...</div>}
                    {!loading && workers.length === 0 && <div className="muted">Hozircha ishchi yo‘q.</div>}
                </div>
            </div>

            {showAdd && (
                <AddWorkerModal
                    onClose={() => setShowAdd(false)}
                    onCreated={() => load()}
                />
            )}
        </div>
    );
}
