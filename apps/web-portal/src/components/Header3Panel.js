import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState } from "react";
import { useSession } from "../state/session";
import AdminDropdown from "./AdminDropdown";
import MiniDayPicker from "./MiniDayPicker";
import WorkerPicker from "./WorkerPicker";
import ProductivityChart from "./Charts/ProductivityChart";
import ComplianceChart from "./Charts/ComplianceChart";
import CreateWorkerModal from "./CreateWorkerModal";
import DayMandatoryModal from "./DayMandatoryModal";
import RecurringTaskModal from "./RecurringTaskModal";
import ReportModal from "./ReportModal";
import { todayISO } from "../utils/date";
export default function Header3Panel({ workers, workerId, anchor }) {
    const { user, logout } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Sync selectedDate with external anchor if provided
    const [selectedDate, setSelectedDate] = useState(anchor || todayISO());
    const [pickDateOpen, setPickDateOpen] = useState(false);
    React.useEffect(() => {
        if (anchor)
            setSelectedDate(anchor);
    }, [anchor]);
    const [workerPickOpen, setWorkerPickOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [recurOpen, setRecurOpen] = useState(false);
    const [mandatoryModalOpen, setMandatoryModalOpen] = useState(false);
    const [targetWorker, setTargetWorker] = useState(null);
    // Chart range toggle
    const [range, setRange] = useState("week");
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const adminName = user?.full_name || "Admin";
    // Find selected worker name if workerId is provided
    const selectedWorker = useMemo(() => {
        if (!workerId)
            return null;
        return workers.find(w => w.id === workerId);
    }, [workerId, workers]);
    return (_jsxs("div", { className: "header3", children: [_jsxs("div", { className: "headerPanel", children: [_jsxs("div", { className: "rowBetween", children: [_jsxs("div", { className: "adminTitle", style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }, children: [_jsx("button", { className: "linkBtn strong", onClick: () => (window.location.hash = "#/"), style: { fontSize: "18px" }, children: adminName }), selectedWorker && (_jsxs("span", { style: { fontSize: "18px", color: "var(--muted)" }, children: ["/ ", selectedWorker.full_name] })), _jsx("button", { className: "linkBtn", onClick: () => setDropdownOpen((v) => !v), style: { marginLeft: 4, opacity: 0.7 }, children: _jsx("i", { className: "fa-solid fa-chevron-down" }) }), dropdownOpen && (_jsx(AdminDropdown, { workers: workers, onClose: () => setDropdownOpen(false), onPick: (wid) => {
                                            setDropdownOpen(false);
                                            if (wid === "CREATE_NEW") {
                                                setCreateOpen(true);
                                            }
                                            else {
                                                window.location.hash = `#/worker?workerId=${encodeURIComponent(wid)}&anchor=${encodeURIComponent(selectedDate)}`;
                                            }
                                        } }))] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("button", { className: "btn mini", onClick: () => {
                                            const isLight = document.body.classList.toggle("light-mode");
                                            localStorage.setItem("theme", isLight ? "light" : "dark");
                                        }, title: "Mavzu", style: { width: 32, padding: 0 }, children: "\uD83C\uDF13" }), _jsx(MiniDayPicker, { currentISO: selectedDate, onOpen: () => setPickDateOpen(true) }), _jsx("button", { className: "btn mini secondary", onClick: () => setRecurOpen(true), title: "Takrorlanuvchi (Davom etuvchi)", style: { width: 32, padding: 0, marginLeft: 4 }, children: _jsx("i", { className: "fa-solid fa-repeat" }) })] })] }), pickDateOpen && (_jsx(MiniDayPicker.Calendar, { initialISO: selectedDate, onClose: () => setPickDateOpen(false), onPick: (iso) => {
                            setSelectedDate(iso);
                            setPickDateOpen(false);
                            setWorkerPickOpen(true);
                        } })), workerPickOpen && (_jsx(WorkerPicker, { dateISO: selectedDate, workers: workers, onClose: () => setWorkerPickOpen(false), onPick: (wid, action) => {
                            setWorkerPickOpen(false);
                            if (action === "TASK") {
                                const w = workers.find(x => x.id === wid);
                                setTargetWorker({ id: wid, name: w?.full_name || "Noma'lum" });
                                setMandatoryModalOpen(true);
                            }
                            else {
                                window.location.hash = `#/worker?workerId=${encodeURIComponent(wid)}&anchor=${encodeURIComponent(selectedDate)}`;
                            }
                        } })), _jsxs("div", { className: "kpiBox", style: { position: "relative", alignItems: "center" }, children: [_jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpiLabel", children: "Sana" }), _jsx("div", { className: "kpiValue", children: selectedDate })] }), _jsxs("div", { className: "kpi", children: [_jsx("div", { className: "kpiLabel", children: "Range" }), _jsx("div", { className: "kpiValue", children: range })] }), _jsx("button", { className: "linkBtn", onClick: () => setPdfModalOpen(true), title: "Hisobot (PDF)", style: { fontSize: "22px", color: "#41d17a", padding: "4px 8px", marginLeft: "4px" }, children: _jsx("i", { className: "fa-solid fa-file-pdf" }) })] }), _jsx("button", { className: "btn mini", onClick: logout, children: "Chiqish" })] }), pdfModalOpen && (_jsx(ReportModal, { onClose: () => setPdfModalOpen(false), defaultDate: selectedDate })), _jsxs("div", { className: "headerPanel", children: [_jsxs("div", { className: "rowBetween", children: [_jsx("div", { className: "panelTitle", children: "Unumdorlik (Completion %)" }), _jsx("div", { className: "seg", children: ["week", "month", "year"].map((r) => (_jsx("button", { className: `segBtn ${range === r ? "segOn" : ""}`, onClick: () => setRange(r), children: r === "week" ? "Hafta" : r === "month" ? "Oy" : "Yil" }, r))) })] }), _jsx(ProductivityChart, { range: range, anchor: selectedDate, workerId: workerId })] }), _jsxs("div", { className: "headerPanel", children: [_jsxs("div", { className: "rowBetween", children: [_jsx("div", { className: "panelTitle", children: "Majburiy (Compliance %)" }), _jsx("div", { className: "seg", children: ["week", "month", "year"].map((r) => (_jsx("button", { className: `segBtn ${range === r ? "segOn" : ""}`, onClick: () => setRange(r), children: r === "week" ? "Hafta" : r === "month" ? "Oy" : "Yil" }, r))) })] }), _jsx(ComplianceChart, { range: range, anchor: selectedDate, workerId: workerId })] }), recurOpen && (_jsx(RecurringTaskModal, { workers: workers, onClose: () => setRecurOpen(false), onSuccess: () => {
                    setRecurOpen(false);
                    window.location.reload();
                } })), createOpen && (_jsx(CreateWorkerModal, { onClose: () => setCreateOpen(false), onSuccess: () => {
                    setCreateOpen(false);
                    window.location.reload(); // Simple reload to refresh list
                } })), mandatoryModalOpen && targetWorker && (_jsx(DayMandatoryModal, { workerId: targetWorker.id, workerName: targetWorker.name, date: selectedDate, onClose: () => setMandatoryModalOpen(false), onSuccess: () => {
                    setMandatoryModalOpen(false);
                    alert("Vazifalar muvaffaqiyatli saqlandi");
                } }))] }));
}
