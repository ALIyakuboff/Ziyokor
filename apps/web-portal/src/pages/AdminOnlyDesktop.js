import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSession } from "../state/session";
export default function AdminOnlyDesktop() {
    const { logout } = useSession();
    return (_jsx("div", { className: "screen center", children: _jsxs("div", { className: "card pad", children: [_jsx("h2", { className: "h2", children: "Admin panel" }), _jsx("p", { className: "muted", children: "Admin panel faqat noutbuk (desktop) uchun." }), _jsx("button", { className: "btn", onClick: logout, children: "Chiqish" })] }) }));
}
