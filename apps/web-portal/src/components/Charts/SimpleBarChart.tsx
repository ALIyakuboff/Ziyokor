import React from "react";

export type ChartPoint = { label: string; value: number };

/**
 * SimpleBarChart - A professional data-driven bar chart.
 * - Total Height: 238px (fixed as per requirement)
 * - Max Bar Height: 200px (100% value)
 * - Features: Y-axis grid, animated growth, percentage labels.
 */
export default function SimpleBarChart({ points, max = 100 }: { points: ChartPoint[]; max?: number }) {
    const TOTAL_HEIGHT = 238;
    const BAR_AREA_HEIGHT = 200;
    const LABEL_AREA_HEIGHT = 24;
    // 238 - 200 - 24 = 14px for top margin/padding space.

    return (
        <div
            className="chartContainer"
            style={{
                width: '100%',
                height: TOTAL_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                fontFamily: 'inherit',
                userSelect: 'none',
                paddingTop: 14 // Space for top labels
            }}
        >
            {/* 1. Background Grid & Y-Axis Markers */}
            <div
                className="chartGrid"
                style={{
                    position: 'absolute',
                    top: 14,
                    left: 0,
                    right: 0,
                    height: BAR_AREA_HEIGHT,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            >
                {/* 100% Line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px solid var(--line)', opacity: 0.3 }} />
                <div style={{ position: 'absolute', top: -7, left: -2, fontSize: 10, color: 'var(--muted)', fontWeight: 800 }}>100</div>

                {/* 50% Line */}
                <div style={{ position: 'absolute', top: BAR_AREA_HEIGHT / 2, left: 0, right: 0, borderTop: '1px solid var(--line)', opacity: 0.2, borderStyle: 'dashed' }} />
                <div style={{ position: 'absolute', top: BAR_AREA_HEIGHT / 2 - 7, left: -2, fontSize: 10, color: 'var(--muted)', opacity: 0.8 }}>50</div>

                {/* 0% Line */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '1px solid var(--line)', opacity: 0.5 }} />
            </div>

            {/* 2. Bars Area */}
            <div
                className="barsWrapper"
                style={{
                    height: BAR_AREA_HEIGHT,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {points.map((p, i) => {
                    const ratio = Math.min(1, p.value / (max || 100));
                    const barHeightPx = ratio * BAR_AREA_HEIGHT;

                    return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                            {/* Percentage above bar */}
                            {p.value > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: barHeightPx + 4,
                                    fontSize: 10,
                                    fontWeight: 900,
                                    color: 'var(--chart-bg-active)',
                                    transition: 'bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>
                                    {Math.round(p.value)}%
                                </div>
                            )}

                            {/* The Bar */}
                            <div
                                style={{
                                    width: 'min(30px, 60%)',
                                    height: barHeightPx,
                                    background: ratio > 0 ? 'var(--chart-bg-active)' : 'var(--chart-bg-empty)',
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    boxShadow: ratio > 0 ? '0 4px 12px rgba(var(--alpha-base), 0.1)' : 'none',
                                    minHeight: ratio > 0 ? 4 : 0
                                }}
                                title={`${p.value.toFixed(1)}%`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 3. X-Axis Labels */}
            <div
                className="chartLabelsX"
                style={{
                    height: LABEL_AREA_HEIGHT,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    marginTop: 4
                }}
            >
                {points.map((p, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--chart-label)', opacity: 0.9 }}>
                        {p.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
