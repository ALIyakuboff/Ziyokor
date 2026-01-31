import { jsx as _jsx } from "react/jsx-runtime";
import DayCard9x16 from "./DayCard9x16";
export default function WeekGrid6Cards({ days, data, onDelete }) {
    return (_jsx("div", { className: "weekGrid", children: days.map((d) => (_jsx(DayCard9x16, { dayISO: d, group: data[d] || { mandatory: [], normal: [], project: [], carryover: [], progress: { done: 0, total: 0, percent: 0 } }, onDelete: onDelete }, d))) }));
}
