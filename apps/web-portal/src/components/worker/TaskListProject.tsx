import { useState } from "react";
import { MessageCircle, Check, AlertTriangle, Play, HelpCircle, FileText } from "lucide-react";
import CommentModalWhite from "./CommentModalWhite";
import { updateTaskStatus, doneTask, Task } from "../../api/tasks";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Kutilmoqda", color: "#999", icon: FileText },
    started: { label: "Boshlandi", color: "#4f8dff", icon: Play },
    in_progress: { label: "Jarayonda", color: "#4f8dff", icon: Play },
    problem: { label: "Muammo", color: "#ff4d4f", icon: AlertTriangle },
    testing: { label: "Testing", color: "#faad14", icon: HelpCircle },
    done: { label: "Bajarildi", color: "#52c41a", icon: Check },
    missed: { label: "Bajarilmadi", color: "#ff4d4f", icon: AlertTriangle }
};

export default function TaskListProject({ items, onRefresh }: { items: Task[]; onRefresh: () => void }) {
    const [commentFor, setCommentFor] = useState<Task | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null); // taskId

    const changeStatus = async (task: Task, status: string) => {
        setLoadingId(task.id);
        setStatusMenuOpen(null);
        try {
            await updateTaskStatus(task.id, status);
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
        } finally {
            setLoadingId(null);
        }
    };

    const handleCheck = async (task: Task) => {
        if (task.status !== 'done') {
            alert("Vazifani tugatish uchun avval statusni 'Bajarildi' (Done) qilib belgilang.");
            return;
        }

        setLoadingId(task.id);
        try {
            await doneTask(task.id);
            onRefresh();
        } catch (e: any) {
            alert(e.message || "Xatolik");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="taskList">
            {items.length === 0 && <div className="muted small" style={{ textAlign: 'center', padding: '10px 0' }}>Project vazifalar yo'q</div>}

            {items.map((t) => {
                const conf = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
                const Icon = conf.icon;

                return (
                    <div key={t.id} className="taskRow" style={{ flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div className="taskTitle">{t.title}</div>
                            <div className="muted small">
                                Sana: {t.visible_date}
                            </div>
                        </div>

                        <div className="taskActions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Status Button */}
                            <button
                                className="btn mini"
                                style={{
                                    backgroundColor: conf.color,
                                    color: '#fff',
                                    width: 'auto',
                                    padding: '0 8px',
                                    fontSize: 11,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                                onClick={() => setStatusMenuOpen(statusMenuOpen === t.id ? null : t.id)}
                            >
                                <Icon size={12} />
                                {conf.label}
                            </button>

                            {/* Dropdown */}
                            {statusMenuOpen === t.id && (
                                <div className="dropdown" style={{
                                    right: 0,
                                    top: 32,
                                    width: 150,
                                    position: 'absolute',
                                    zIndex: 100,
                                    background: '#1a1c1e',
                                    border: '1px solid #333',
                                    borderRadius: 8,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                    padding: 4
                                }}>
                                    {[
                                        ['problem', 'Muammo', AlertTriangle, '#ff4d4f'],
                                        ['started', 'Boshlandi', Play, '#4f8dff'],
                                        ['testing', 'Testing', HelpCircle, '#faad14'],
                                        ['done', 'Bajarildi', Check, '#52c41a'],
                                    ].map(([key, label, Ico, col]: any) => (
                                        <div
                                            key={key}
                                            className="dropdownItem"
                                            onClick={() => changeStatus(t, key)}
                                            style={{
                                                color: col,
                                                gap: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                fontSize: 13,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Ico size={14} /> {label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comment Button */}
                            <button
                                className="btn mini"
                                onClick={() => setCommentFor(t)}
                                title="Izohlar"
                            >
                                <MessageCircle size={16} />
                                {t.comment_count !== undefined && t.comment_count > 0 && <span className="badge" style={{ marginLeft: 4 }}>{t.comment_count}</span>}
                            </button>

                            {/* Check Button (Finalize) */}
                            <button
                                className="btn mini ok"
                                onClick={() => handleCheck(t)}
                                disabled={!!loadingId}
                                title={t.status === 'done' ? "Tugatish" : "Avval 'Bajarildi' tanlang"}
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {commentFor && (
                <CommentModalWhite
                    task={commentFor}
                    onClose={() => setCommentFor(null)}
                    onSaved={() => {
                        onRefresh();
                        setCommentFor(null);
                    }}
                />
            )}

            {statusMenuOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    onClick={() => setStatusMenuOpen(null)}
                />
            )}
        </div>
    );
}
