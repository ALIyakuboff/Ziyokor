import React, { useEffect, useRef, useState } from "react";

type Worker = { id: string; full_name: string };

export default function WorkerPicker({
    dateISO,
    workers,
    onClose,
    onPick
}: {
    dateISO: string;
    workers: Worker[];
    onClose: () => void;
    onPick: (workerId: string, action: "VIEW" | "TASK") => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [selected, setSelected] = useState<string>("");

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

    return (
        <div className="modalOverlay" onMouseDown={onClose} role="dialog" aria-modal="true">
            <div className="pickerBox" ref={ref} onMouseDown={(e) => e.stopPropagation()}>
                <div className="pickerHeader">
                    <div className="pickerTitle">Sana: {dateISO}</div>
                    <button className="btn mini" onClick={onClose}>✕</button>
                </div>

                <div className="pickerBody">
                    <div className="muted small">Ishchini tanlang</div>
                    <select
                        className="select"
                        value={selected}
                        onChange={(e) => {
                            setSelected(e.target.value);
                        }}
                    >
                        <option value="">— tanlang —</option>
                        {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.full_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pickerFooter">
                    <button className="btn" onClick={onClose}>Bekor</button>
                    <button className="btn" disabled={!selected} onClick={() => onPick(selected, "VIEW")}>
                        Ochish
                    </button>
                    <button className="btn primary" disabled={!selected} onClick={() => onPick(selected, "TASK")} style={{ background: "#41d17a", borderColor: "#41d17a", color: "#000", fontWeight: "bold" }}>
                        + Majburiy ish qo‘shish
                    </button>
                </div>
            </div>
        </div>
    );
}
