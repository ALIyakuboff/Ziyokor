import React, { useState } from "react";
import { useSession } from "../../state/session";
import WorkerMiniDayPicker from "./WorkerMiniDayPicker";
import ProductivityChart from "../Charts/ProductivityChart";
import ComplianceChart from "../Charts/ComplianceChart";
import ReportModal from "../ReportModal";

type Props = {
    anchor: string;
    onPickDate: (iso: string) => void;
    children?: React.ReactNode;
};

export default function WorkerHeader3Panel({ anchor, onPickDate, children }: Props) {
    const { user, logout } = useSession();
    const [range, setRange] = useState<"week" | "month" | "year">("week");
    const [pdfModalOpen, setPdfModalOpen] = useState(false);

    return (
        <div className="header3">
            <div className="headerPanel">
                <div className="rowBetween">
                    {children ? children : (
                        <div className="panelTitle">
                            <div className="h2">{user?.full_name || "Ishchi"}</div>
                            <div className="muted small">{user?.phone_login}</div>
                        </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            className="btn mini"
                            onClick={() => {
                                const isLight = document.body.classList.toggle("light-mode");
                                localStorage.setItem("theme", isLight ? "light" : "dark");
                            }}
                            title="Mavzu"
                            style={{ width: 32, padding: 0 }}
                        >
                            🌓
                        </button>
                        <WorkerMiniDayPicker
                            currentISO={anchor}
                            onPick={onPickDate}
                        />
                    </div>
                </div>

                <div className="kpiBox" style={{ alignItems: "flex-start", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div className="kpi" style={{ margin: 0 }}>
                            <div className="kpiLabel">Sana</div>
                            <div className="kpiValue">{anchor}</div>
                        </div>
                        <button
                            className="linkBtn muted"
                            onClick={logout}
                            title="Chiqish"
                            style={{ fontSize: "24px", color: "#666" }}
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>

                    <div className="kpi">
                        <div className="kpiLabel">Holat</div>
                        <div className="kpiValue" style={{ color: "#41d17a" }}>Faol</div>
                    </div>

                    <button
                        className="linkBtn"
                        onClick={() => setPdfModalOpen(true)}
                        title="Hisobot (PDF)"
                        style={{ fontSize: "28px", color: "#41d17a", marginLeft: "4px", marginTop: "8px" }}
                    >
                        <i className="fa-solid fa-file-pdf"></i>
                    </button>
                </div>
            </div>

            {pdfModalOpen && (
                <ReportModal
                    onClose={() => setPdfModalOpen(false)}
                    defaultDate={anchor}
                    isAdmin={false}
                />
            )}

            <div className="headerPanel">
                <div className="rowBetween">
                    <div className="panelTitle">Unumdorlik</div>
                    <div className="seg">
                        {(["week", "month", "year"] as const).map((r) => (
                            <button
                                key={r}
                                className={`segBtn ${range === r ? "segOn" : ""}`}
                                onClick={() => setRange(r)}
                            >
                                {r === "week" ? "H" : r === "month" ? "O" : "Y"}
                            </button>
                        ))}
                    </div>
                </div>
                <ProductivityChart range={range} anchor={anchor} workerId={user?.id} />
            </div>

            <div className="headerPanel">
                <div className="rowBetween">
                    <div className="panelTitle">Majburiy</div>
                </div>
                <ComplianceChart range={range} anchor={anchor} workerId={user?.id} />
            </div>
        </div>
    );
}
