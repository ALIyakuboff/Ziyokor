import React, { useEffect, useRef } from "react";

export type ChartPoint = { label: string; value: number };

export default function SimpleLineChart({ points, height = 120 }: { points: ChartPoint[]; height?: number }) {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        const style = getComputedStyle(document.body);
        const chartColor = style.getPropertyValue("--chart-bg").trim() || "#ffffff";
        const gridColor = style.getPropertyValue("--chart-grid").trim() || "rgba(255,255,255,0.25)";

        // background grid
        ctx.strokeStyle = gridColor;
        for (let i = 0; i <= 4; i++) {
            const y = (h * i) / 4;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        if (!points.length) return;

        const maxV = Math.max(...points.map((p) => p.value), 1);
        const minV = Math.min(...points.map((p) => p.value), 0);
        const range = Math.max(1, maxV - minV);

        const pad = 10;
        const xStep = points.length === 1 ? 0 : (w - pad * 2) / (points.length - 1);

        // line
        ctx.lineWidth = 2;
        ctx.strokeStyle = chartColor;
        ctx.beginPath();

        points.forEach((p, i) => {
            const x = pad + i * xStep;
            const y = h - pad - ((p.value - minV) / range) * (h - pad * 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // dots
        ctx.fillStyle = chartColor;
        points.forEach((p, i) => {
            const x = pad + i * xStep;
            const y = h - pad - ((p.value - minV) / range) * (h - pad * 2);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }, [points]);

    return (
        <div className="chartBox">
            <canvas ref={ref} width={360} height={height} />
            <div className="chartLabels">
                {points.map((p) => (
                    <div key={p.label} className="chartLabel">
                        {p.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
