import React from "react";

export default function ProgressRing({ percent }: { percent: number }) {
    const p = Math.max(0, Math.min(100, percent || 0));
    const r = 22;
    const c = 2 * Math.PI * r;
    const offset = c - (p / 100) * c;

    return (
        <div className="ringWrap" aria-label={`Progress ${p}%`}>
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={r} strokeWidth="6" className="ringBg" fill="none" />
                <circle
                    cx="28"
                    cy="28"
                    r={r}
                    strokeWidth="6"
                    className="ringFg"
                    fill="none"
                    strokeDasharray={`${c} ${c}`}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="ringText">{p}%</div>
        </div>
    );
}
