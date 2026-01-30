import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import MediumCalendar from "./MediumCalendar";
export default function WorkerMiniDayPicker({ currentISO, onPick }) {
    const dayNumber = useMemo(() => Number(currentISO.slice(8, 10)), [currentISO]);
    const [open, setOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: "miniDay", onClick: () => setOpen(true), title: "Sana tanlash", children: dayNumber }), open && (_jsx(MediumCalendar, { initialISO: currentISO, onClose: () => setOpen(false), onPick: (iso) => {
                    setOpen(false);
                    onPick(iso);
                } }))] }));
}
