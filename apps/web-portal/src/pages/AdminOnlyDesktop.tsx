import React from "react";
import { useSession } from "../state/session";

export default function AdminOnlyDesktop() {
    const { logout } = useSession();
    return (
        <div className="screen center">
            <div className="card pad">
                <h2 className="h2">Admin panel</h2>
                <p className="muted">Admin panel faqat noutbuk (desktop) uchun.</p>
                <button className="btn" onClick={logout}>
                    Chiqish
                </button>
            </div>
        </div>
    );
}
