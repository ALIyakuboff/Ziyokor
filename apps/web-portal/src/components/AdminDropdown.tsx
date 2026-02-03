import React, { useEffect, useRef, useState } from "react";
import { hardDeleteWorker } from "../api/admin";

type Worker = { id: string; full_name: string; is_active?: boolean };

export default function AdminDropdown({
    workers,
    onClose,
    onPick
}: {
    workers: Worker[];
    onClose: () => void;
    onPick: (workerId: string) => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as any)) onClose();
        };
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, [onClose]);

    async function handleDelete(id: string, name: string) {
        if (!confirm(`${name} serverdan BUTUNLAY o'chirilsinmi? (Barcha topshiriqlari va izohlari ham o'chib ketadi!)`)) return;
        try {
            await hardDeleteWorker(id);
            window.location.reload();
        } catch (e: any) {
            alert("Xato: " + (e?.message || "O'chirib bo'lmadi"));
        }
    }

    return (
        <div className="dropdown" ref={ref}>
            <div className="dropdownList">
                <div className="rowBetween padSm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
                    <button
                        className="linkBtn"
                        style={{ color: "#41d17a", fontWeight: "bold", fontSize: "14px" }}
                        onClick={() => onPick("CREATE_NEW")}
                    >
                        + Ishchi qo‘shish
                    </button>
                    <button
                        className={`btn mini ${editMode ? "danger" : ""}`}
                        style={{ padding: "2px 6px" }}
                        onClick={() => setEditMode(!editMode)}
                        title="Tahrirlash"
                    >
                        {editMode ? "✓" : "⚙️"}
                    </button>
                </div>

                {workers.length === 0 && <div className="muted small padSm">Ishchi yo‘q</div>}
                {workers.map((w) => (
                    <div key={w.id} className="dropdownItemRow" style={{ display: "flex", alignItems: "center", opacity: w.is_active === false ? 0.5 : 1 }}>
                        <button className="dropdownItem" style={{ flex: 1, textAlign: "left" }} onClick={() => onPick(w.id)}>
                            {w.full_name} {w.is_active === false && "(O'chirilgan)"}
                        </button>
                        {editMode && (
                            <button
                                className="linkBtn"
                                style={{ padding: "0 10px", color: "#ff4d4d" }}
                                onClick={() => handleDelete(w.id, w.full_name)}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
