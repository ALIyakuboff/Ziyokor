import React, { useEffect, useRef, useState } from "react";
import { deactivateWorker } from "../api/admin";

type Worker = { id: string; full_name: string };

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

    async function handleDeactivate(id: string, name: string) {
        if (!confirm(`${name} o'chirilsinmi? (Ma'lumotlari saqlanib qoladi, lekin ro'yxatda ko'rinmaydi)`)) return;
        try {
            await deactivateWorker(id);
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
                    <div key={w.id} className="dropdownItemRow" style={{ display: "flex", alignItems: "center" }}>
                        <button className="dropdownItem" style={{ flex: 1, textAlign: "left" }} onClick={() => onPick(w.id)}>
                            {w.full_name}
                        </button>
                        {editMode && (
                            <button
                                className="linkBtn"
                                style={{ padding: "0 10px", color: "#ff4d4d" }}
                                onClick={() => handleDeactivate(w.id, w.full_name)}
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
