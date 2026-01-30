import React, { useState } from "react";
import { DateTime } from "luxon";
import { getFullReportData } from "../api/admin";
import { getMyReportData } from "../api/tasks";
import { generateWorkerPDFReport } from "../utils/pdfReport";

export default function ReportModal({ onClose, defaultDate, isAdmin = true }: { onClose: () => void; defaultDate: string; isAdmin?: boolean }) {
    const [reportDate, setReportDate] = useState(defaultDate);
    const [loading, setLoading] = useState(false);

    const handleDownload = async (type: "Haftalik" | "Oylik") => {
        setLoading(true);
        const anchor = DateTime.fromISO(reportDate);
        let start = "";
        let end = "";

        if (type === "Haftalik") {
            // Monday to Saturday
            start = anchor.startOf("week").toISODate()!;
            end = anchor.endOf("week").minus({ days: 1 }).toISODate()!;
        } else {
            // Full month
            start = anchor.startOf("month").toISODate()!;
            end = anchor.endOf("month").toISODate()!;
        }

        try {
            const r = isAdmin ? await getFullReportData(start, end) : await getMyReportData(start, end);
            await generateWorkerPDFReport(type + " Hisobot", `${start} - ${end}`, r.data);
            onClose();
        } catch (e: any) {
            alert(e.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalWhite" onClick={(e) => e.stopPropagation()} style={{ width: "350px" }}>
                <div className="modalHeader">
                    <div className="modalTitle">PDF Hisobot</div>
                    <button className="linkBtn" onClick={onClose} style={{ fontSize: "20px" }}>&times;</button>
                </div>

                <div className="modalBody" style={{ gap: "16px" }}>
                    <div className="label">
                        Hisobot sanasini tanlang:
                        <input
                            type="date"
                            className="input"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                        />
                    </div>

                    <p className="muted small" style={{ margin: 0 }}>
                        Tanlangan sana asosida haftalik (Du-Sha) yoki oylik hisobot shakllantiriladi.
                    </p>

                    <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                        <button
                            className="btn primary"
                            disabled={loading}
                            onClick={() => handleDownload("Haftalik")}
                            style={{ background: "#41d17a", color: "#000", fontWeight: "bold" }}
                        >
                            {loading ? "Yuklanmoqda..." : `📊 Haftalik PDF ${isAdmin ? "(Barchaniki)" : ""}`}
                        </button>

                        <button
                            className="btn"
                            disabled={loading}
                            onClick={() => handleDownload("Oylik")}
                        >
                            {loading ? "Yuklanmoqda..." : `📅 Oylik PDF ${isAdmin ? "(Barchaniki)" : ""}`}
                        </button>
                    </div>
                </div>

                <div className="modalFooter">
                    <button className="btn" onClick={onClose}>Bekor qilish</button>
                </div>
            </div>
        </div>
    );
}
