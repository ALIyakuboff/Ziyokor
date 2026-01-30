import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef } from "react";
import DayCard9x16 from "./DayCard9x16";
export default function WeekSwiper6Cards({ days, data, anchor, mode, onChangeAnchor, onRefresh }) {
    const containerRef = useRef(null);
    const activeIndex = useMemo(() => {
        const idx = days.indexOf(anchor);
        return idx >= 0 ? idx : 0;
    }, [anchor, days]);
    useEffect(() => {
        if (!containerRef.current)
            return;
        const el = containerRef.current;
        const child = el.children.item(activeIndex);
        if (child)
            child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [activeIndex]);
    const visibleDays = mode === "day" ? [anchor] : days;
    return (_jsxs("div", { className: "weekWrap", children: [_jsx("div", { className: mode === "week" ? "weekGrid" : "weekStrip", ref: containerRef, children: visibleDays.map((d) => (_jsx("div", { className: "daySlot", children: _jsx(DayCard9x16, { dayISO: d, group: data[d] || { mandatory: [], normal: [], carryover: [], progress: { done: 0, total: 0, percent: 0 } }, onPickDay: onChangeAnchor, onRefresh: onRefresh }) }, d))) }), mode !== "week" && (_jsx("div", { className: "weekDots", children: days.map((d) => (_jsx("button", { className: `dot ${d === anchor ? "dotActive" : ""}`, onClick: () => onChangeAnchor(d), "aria-label": d }, d))) }))] }));
}
