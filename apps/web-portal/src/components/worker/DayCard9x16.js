import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import ProgressRing from "./ProgressRing";
import TaskListMandatory from "./TaskListMandatory";
import TaskListNormal from "./TaskListNormal";
import TaskListCarryover from "./TaskListCarryover";
import { weekdayUz } from "../../utils/weekday";
import { formatDateShort } from "../../utils/date";

export default function DayCard9x16({ dayISO, group, onRefresh }) {
    const weekday = useMemo(() => weekdayUz(dayISO), [dayISO]);
    return (_jsxs("div", {
        className: "dayCard", children: [
            _jsxs("div", {
                className: "dayHeader", children: [
                    _jsxs("div", {
                        children: [
                            _jsx("div", { className: "dayTitle", children: weekday }),
                            _jsx("div", { className: "muted", children: formatDateShort(dayISO) })
                        ]
                    }),
                    _jsx(ProgressRing, { percent: group?.progress?.percent || 0 })
                ]
            }),
            _jsxs("div", {
                className: "dayCardBody", children: [
                    _jsxs("div", {
                        className: "section", children: [
                            _jsx("div", { className: "sectionTitle", children: "Majburiy ishlar" }),
                            _jsx(TaskListMandatory, { items: group?.mandatory || [], onRefresh: onRefresh })
                        ]
                    }),
                    _jsxs("div", {
                        className: "section", children: [
                            _jsx("div", { className: "sectionTitle", children: "Mening ishlarim" }),
                            _jsx(TaskListNormal, { dayISO: dayISO, items: group?.normal || [], onRefresh: onRefresh })
                        ]
                    }),
                    _jsxs("div", {
                        className: "section", children: [
                            _jsx("div", { className: "sectionTitle", style: { color: "#4f8dff" }, children: "Project" }),
                            _jsx(TaskListNormal, { dayISO: dayISO, items: group?.project || [], onRefresh: onRefresh })
                        ]
                    }),
                    _jsx("div", { className: "divider" }),
                    _jsxs("div", {
                        className: "section", children: [
                            _jsxs("div", { className: "sectionTitle red", style: { display: "flex", alignItems: "center", gap: "6px" }, children: ["Kecha qolganlar ", _jsx("span", { children: "🔴" })] }),
                            _jsx(TaskListCarryover, { items: group?.carryover || [], onRefresh: onRefresh })
                        ]
                    })
                ]
            })
        ]
    }));
}
