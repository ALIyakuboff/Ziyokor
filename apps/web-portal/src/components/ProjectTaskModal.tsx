import React, { useState } from "react";
import WorkerPicker from "./WorkerPicker";

const { createProjectTask } = require("../api/tasks") as any;

type Worker = { id: string; full_name: string };

type Props = {
    workers: Worker[];
    onClose: () => void;
    onSuccess: () => void;
    defaultDate?: string;
};

// Fix for strict mode complaining about missing types in JS module
// @ts-ignore
const createProjectTaskFn = createProjectTask as (uid: string, title: string, date: string) => Promise<any>;

export default function ProjectTaskModal({ workers, onClose, onSuccess, defaultDate }: Props) {
    const [step, setStep] = useState(1);
    const [targetWorker, setTargetWorker] = useState<Worker | null>(null);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(defaultDate || "");
    const [busy, setBusy] = useState(false);

    const handleWorkerPick = (wid: string) => {
        const w = workers.find(x => x.id === wid);
        if (w) {
            setTargetWorker(w);
            setStep(2);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date || !targetWorker) return;
        setBusy(true);
        try {
            await createProjectTaskFn(targetWorker.id, title, date);
            onSuccess();
        } catch (err: any) {
            alert(err?.message || "Xatolik yuz berdi");
            setBusy(false);
        }
    };

    return (
        <div className="modalOverlay">
            <div className="modalCard">
                <div className="modalHeader">
                    <div className="h3">Yangi "Project" Topshiriq</div>
                    <button className="closeBtn" onClick={onClose}>&times;</button>
                </div>

                {step === 1 && (
                    <div className="modalBody">
                        <p className="muted">Kimga biriktiramiz?</p>
                        <WorkerPicker
                            workers={workers}
                            dateISO={defaultDate || ""}
                            onClose={onClose}
                            onPick={(wid) => handleWorkerPick(wid)}
                            embedded={true}
                        />
                    </div>
                )}

                {step === 2 && targetWorker && (
                    <form onSubmit={handleSubmit} className="modalBody">
                        <div className="formGroup">
                            <label>Ishchi:</label>
                            <div className="value">{targetWorker.full_name}</div>
                        </div>
                        <div className="formGroup">
                            <label>Sana:</label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="formGroup">
                            <label>Topshiriq matni (Project):</label>
                            <textarea
                                className="input"
                                rows={3}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Masalan: Katta loyiha smetasini tuzish..."
                                required
                            />
                        </div>
                        <div className="notifBox" style={{ marginTop: 10 }}>
                            <i className="fa-solid fa-info-circle"></i>
                            <div>
                                Bu topshiriq bajarilmasa, 2 oygacha avtomatik keyingi kunga ko'chib yuradi.
                            </div>
                        </div>

                        <div className="modalFooter">
                            <button type="button" className="btn secondary" onClick={() => setStep(1)}>Ortga</button>
                            <button type="submit" className="btn primary" disabled={busy}>
                                {busy ? "Saqlanmoqda..." : "Saqlash"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
