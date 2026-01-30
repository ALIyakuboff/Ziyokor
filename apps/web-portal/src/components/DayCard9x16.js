import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { weekdayUz } from "../utils/weekday";
import { formatDateShort } from "../utils/date";
import ProgressRing from "./ProgressRing";
import TaskBlock from "./TaskBlock";
export default function DayCard9x16({ dayISO, group, onDelete }) {
    const weekday = useMemo(() => weekdayUz(dayISO), [dayISO]);
    return (_jsxs("div", { className: "dayCard", children: [_jsxs("div", { className: "dayHeader", children: [_jsxs("div", { children: [_jsx("div", { className: "dayTitle", children: weekday }), _jsx("div", { className: "muted", children: formatDateShort(dayISO) })] }), _jsx(ProgressRing, { percent: group?.progress?.percent || 0 })] }), _jsxs("div", { className: "section", children: [_jsx("div", { className: "sectionTitle", children: "Majburiy ishlar \uD83D\uDD12" }), _jsx(TaskBlock, { items: group?.mandatory || [], tone: "normal", onDelete: onDelete })] }), _jsxs("div", { className: "section", children: [_jsx("div", { className: "sectionTitle", children: "Oddiy ishlar" }), _jsx(TaskBlock, { items: group?.normal || [], tone: "normal", onDelete: onDelete })] }), _jsx("div", { className: "divider" }), _jsxs("div", { className: "section", children: [_jsx("div", { className: "sectionTitle", children: "Carryover \uD83D\uDD34" }), _jsx(TaskBlock, { items: group?.carryover || [], tone: "danger", onDelete: onDelete })] })] }));
}
