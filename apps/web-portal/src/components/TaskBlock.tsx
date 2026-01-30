import { MessageCircle, Trash2 } from "lucide-react";
// ... (existing imports)

export default function TaskBlock({
    // ...
    return (
        <div className={`taskList ${tone === "danger" ? "carryoverBox" : ""}`}>
            {items.map((t) => {
                const canDelete = onDelete && t.visible_date >= today;

                return (
                    <div key={t.id} className={`taskRow ${tone === "danger" ? "carryoverRow" : ""} ${t.status === "done" ? "taskDone" : ""}`}>
                        <div className="taskTitle">{t.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {(t.status === "done" || t.comment_count > 0) && (
                                <button className="linkBtn" onClick={() => setViewingComments(t)} style={{ padding: "4px" }}>
                                    <MessageCircle size={18} />
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    className="linkBtn textDanger"
                                    onClick={() => {
                                        if (window.confirm("Vazifani o'chirishni tasdiqlaysizmi?")) {
                                            onDelete(t.id);
                                        }
                                    }}
                                    style={{ padding: "4px" }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="badge">{t.status}</div>
                        </div>
                    </div>
                );
            })}
// ...

            {viewingComments && (
                <AdminCommentModal
                    task={viewingComments}
                    onClose={() => setViewingComments(null)}
                />
            )}
        </div>
    );
}
