import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DateTime } from "luxon";
import { getFullReportData } from "../api/admin";
import { getMyReportData } from "../api/tasks";
import { generateWorkerPDFReport } from "../utils/pdfReport";
export default function ReportModal({ onClose, defaultDate, isAdmin = true }) {
    const [reportDate, setReportDate] = useState(defaultDate);
    const [loading, setLoading] = useState(false);
    const handleDownload = async (type) => {
        setLoading(true);
        const anchor = DateTime.fromISO(reportDate);
        let start = "";
        let end = "";
        if (type === "Haftalik") {
            // Monday to Saturday
            start = anchor.startOf("week").toISODate();
            end = anchor.endOf("week").minus({ days: 1 }).toISODate();
        }
        else {
            // Full month
            start = anchor.startOf("month").toISODate();
            end = anchor.endOf("month").toISODate();
        }
        try {
            const r = isAdmin ? await getFullReportData(start, end) : await getMyReportData(start, end);
            await generateWorkerPDFReport(type + " Hisobot", `${start} - ${end}`, r.data);
            onClose();
        }
        catch (e) {
            alert(e.message || "Xatolik yuz berdi");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "modalOverlay", onClick: onClose, children: _jsxs("div", { className: "modalWhite", onClick: (e) => e.stopPropagation(), style: { width: "350px" }, children: [_jsxs("div", { className: "modalHeader", children: [_jsx("div", { className: "modalTitle", children: "PDF Hisobot" }), _jsx("button", { className: "linkBtn", onClick: onClose, style: { fontSize: "20px" }, children: "\u00D7" })] }), _jsxs("div", { className: "modalBody", style: { gap: "16px" }, children: [_jsxs("div", { className: "label", children: ["Hisobot sanasini tanlang:", _jsx("input", { type: "date", className: "input", value: reportDate, onChange: (e) => setReportDate(e.target.value) })] }), _jsx("p", { className: "muted small", style: { margin: 0 }, children: "Tanlangan sana asosida haftalik (Du-Sha) yoki oylik hisobot shakllantiriladi." }), _jsxs("div", { style: { display: "grid", gap: "10px", marginTop: "10px" }, children: [_jsx("button", { className: "btn primary", disabled: loading, onClick: () => handleDownload("Haftalik"), style: { background: "#41d17a", color: "#000", fontWeight: "bold" }, children: loading ? "Yuklanmoqda..." : "📊 Haftalik PDF (Barchaniki)" }), _jsx("button", { className: "btn", disabled: loading, onClick: () => handleDownload("Oylik"), children: "\uD83D\uDCC5 Oylik PDF (Barchaniki)" })] })] }), _jsx("div", { className: "modalFooter", children: _jsx("button", { className: "btn", onClick: onClose, children: "Bekor qilish" }) })] }) }));
}
