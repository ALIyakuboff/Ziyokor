import React, { useEffect, useRef, useState } from "react";
import type { Task } from "../../api/tasks";
import { replaceComments, getTaskComments } from "../../api/tasks";

export default function CommentModalWhite({
    task,
    onClose,
    onSaved
}: {
    task: Task;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [items, setItems] = useState<string[]>([""]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const firstRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Fetch existing comments
        getTaskComments(task.id)
            .then((res) => {
                if (res.items && res.items.length > 0) {
                    setItems(res.items);
                }
            })
            .catch(() => {
                // ignore error, just empty
            })
            .finally(() => {
                setLoading(false);
                setTimeout(() => firstRef.current?.focus(), 100);
            });
    }, [task.id]);

    function setItem(i: number, v: string) {
        setItems((prev) => {
            const next = [...prev];
            next[i] = v;
            return next;
        });
    }

    function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            const cur = (items[i] || "").trim();
            if (!cur) return;

            setItems((prev) => [...prev, ""]);
            // focus next input after render
            setTimeout(() => {
                const el = document.getElementById(`cm_${task.id}_${i + 1}`) as HTMLInputElement | null;
                el?.focus();
            }, 0);
        } else if (e.key === "Escape") {
            onClose();
        }
    }

    async function save() {
        const clean = items.map((x) => x.trim()).filter((x) => x.length > 0);
        if (clean.length < 1) return;

        setSaving(true);
        try {
            await replaceComments(task.id, clean);
            onSaved();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modalOverlay" onMouseDown={onClose} role="dialog" aria-modal="true">
            <div className="modalWhite" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <div className="modalTitle">Hisobot — {task.title}</div>
                    <button className="btn mini" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="modalBody" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
                    {loading ? (
                        <div className="muted small center" style={{ padding: '20px' }}>Yuklanmoqda...</div>
                    ) : (
                        <>
                            {items.map((v, i) => (
                                <div key={i} className="numRow">
                                    <div className="num">{i + 1}</div>
                                    <input
                                        id={`cm_${task.id}_${i}`}
                                        ref={i === 0 ? firstRef : undefined}
                                        className="input"
                                        style={{ background: 'transparent', border: 'none', height: '32px', flex: 1 }}
                                        value={v}
                                        onChange={(e) => setItem(i, e.target.value)}
                                        onKeyDown={(e) => onKeyDown(i, e)}
                                        placeholder="Qilingan ish..."
                                        autoComplete="off"
                                    />
                                    {items.length > 1 && v.trim() === "" && i !== items.length - 1 && (
                                        <button className="linkBtn" onClick={() => {
                                            const next = [...items];
                                            next.splice(i, 1);
                                            setItems(next);
                                        }} style={{ fontSize: '10px' }}>✕</button>
                                    )}
                                </div>
                            ))}
                            <div className="muted small" style={{ textAlign: 'center', marginTop: '10px', opacity: 0.8 }}>
                                <i className="fa-solid fa-keyboard" style={{ marginRight: '6 row' }}></i>
                                Enter - yangi qator qo'shish
                            </div>
                        </>
                    )}
                </div>

                <div className="modalFooter">
                    <button className="btn" onClick={onClose}>
                        Bekor
                    </button>
                    <button className="btn primary" onClick={save} disabled={saving || loading}>
                        {saving ? "Saqlanyapti..." : "Saqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
}
