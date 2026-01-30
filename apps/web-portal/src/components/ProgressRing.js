import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ProgressRing({ percent }) {
    const p = Math.max(0, Math.min(100, percent || 0));
    const r = 22;
    const c = 2 * Math.PI * r;
    const offset = c - (p / 100) * c;
    return (_jsxs("div", { className: "ringWrap", "aria-label": `Progress ${p}%`, children: [_jsxs("svg", { width: "56", height: "56", viewBox: "0 0 56 56", children: [_jsx("circle", { cx: "28", cy: "28", r: r, strokeWidth: "6", className: "ringBg", fill: "none" }), _jsx("circle", { cx: "28", cy: "28", r: r, strokeWidth: "6", className: "ringFg", fill: "none", strokeDasharray: `${c} ${c}`, strokeDashoffset: offset, strokeLinecap: "round" })] }), _jsxs("div", { className: "ringText", children: [p, "%"] })] }));
}
