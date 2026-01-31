import React, { useState } from "react";
import AdminCommentModal from "./AdminCommentModal";
import { todayISO } from "../utils/date";

export default function TaskBlock({ items, tone, onDelete }: { items: any[]; tone: "normal" | "danger"; onDelete?: (id: string) => void }) {
    const [viewingComments, setViewingComments] = useState<any>(null);
    const today = todayISO();

    if (!items.length) {
        return <div className="muted small">—</div>;
    }

    return (
        <div className={`taskList ${tone === "danger" ? "carryoverBox" : ""}`}>
            {items.map((t) => {
                // Ensure date string comparison works
                const canDelete = onDelete && t.visible_date >= today;

                return (
                    <div key={t.id} className={`taskRow ${tone === "danger" ? "carryoverRow" : ""} ${t.status === "done" ? "taskDone" : ""}`}>
                        <div className="taskTitle">{t.title}</div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {(t.status === "done" || t.comment_count > 0) && (
                                <button className="linkBtn" onClick={() => setViewingComments(t)} style={{ padding: "4px" }}>
                                    💬
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    className="linkBtn textDanger"
                                    onClick={() => {
                                        if (window.confirm("Vazifani o'chirishni tasdiqlaysizmi?")) {
                                            if (onDelete) onDelete(t.id);
                                        }
                                    }}
                                    style={{ padding: "4px" }}
                                >
                                    🗑️
                                </button>
                            )}

                            <div className="badge">{t.status}</div>
                        </div>
                    </div>
                );
            })}

            {viewingComments && (
                <AdminCommentModal
                    task={viewingComments}
                    onClose={() => setViewingComments(null)}
                />
            )}
        </div>
    );
}
