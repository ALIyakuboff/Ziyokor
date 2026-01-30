import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
function toISO(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
export default function MediumCalendar({ initialISO, onPick, onClose }) {
    const initial = new Date(initialISO + "T00:00:00");
    const [year, setYear] = useState(initial.getFullYear());
    const [month, setMonth] = useState(initial.getMonth()); // 0-11
    const grid = useMemo(() => {
        const first = new Date(year, month, 1);
        const startDay = (first.getDay() + 6) % 7; // Monday=0
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < startDay; i++)
            cells.push(null);
        for (let d = 1; d <= daysInMonth; d++)
            cells.push(new Date(year, month, d));
        while (cells.length % 7 !== 0)
            cells.push(null);
        return cells;
    }, [year, month]);
    const monthName = useMemo(() => {
        const names = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
        return names[month];
    }, [month]);
    return (_jsx("div", { className: "modalOverlay", onMouseDown: onClose, role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "calendarBox", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "calHeader", children: [_jsx("button", { className: "btn mini", onClick: () => setMonth((m) => (m === 0 ? 11 : m - 1)), children: "\u2190" }), _jsxs("div", { className: "calTitle", children: [monthName, " ", year] }), _jsx("button", { className: "btn mini", onClick: () => setMonth((m) => (m === 11 ? 0 : m + 1)), children: "\u2192" })] }), _jsx("div", { className: "calWeek", children: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((x) => (_jsx("div", { className: "calW", children: x }, x))) }), _jsx("div", { className: "calGrid", children: grid.map((d, i) => {
                        if (!d)
                            return _jsx("div", { className: "calCell empty" }, i);
                        return (_jsx("button", { className: "calCell", onClick: () => onPick(toISO(d)), title: toISO(d), children: d.getDate() }, i));
                    }) }), _jsx("div", { className: "calFooter", children: _jsx("button", { className: "btn", onClick: onClose, children: "Yopish" }) })] }) }));
}
