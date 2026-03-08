'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { ChartConfig, CellMap } from '@/types';
import { getColumnIndex, getColumnLabel, parseCellId } from '@/constants/grid';

interface ChartRendererProps {
    chart: ChartConfig;
    cells: CellMap;
    onRemove: () => void;
}

function getDataFromRange(
    range: { start: string; end: string },
    cells: CellMap
): { labels: string[]; values: number[] } {
    const startParsed = parseCellId(range.start);
    const endParsed = parseCellId(range.end);
    if (!startParsed || !endParsed) return { labels: [], values: [] };

    const minCol = Math.min(startParsed.colIndex, endParsed.colIndex);
    const maxCol = Math.max(startParsed.colIndex, endParsed.colIndex);
    const minRow = Math.min(startParsed.row, endParsed.row);
    const maxRow = Math.max(startParsed.row, endParsed.row);

    const labels: string[] = [];
    const values: number[] = [];

    if (maxCol > minCol) {
        // Multiple columns: first column = labels, second = values
        for (let r = minRow; r <= maxRow; r++) {
            const labelId = `${getColumnLabel(minCol)}${r}`;
            const valueId = `${getColumnLabel(minCol + 1)}${r}`;
            labels.push(cells[labelId]?.v || `Row ${r}`);
            values.push(parseFloat(cells[valueId]?.v || '0') || 0);
        }
    } else {
        // Single column: row numbers as labels
        for (let r = minRow; r <= maxRow; r++) {
            const cellId = `${getColumnLabel(minCol)}${r}`;
            labels.push(`${r}`);
            values.push(parseFloat(cells[cellId]?.v || '0') || 0);
        }
    }

    return { labels, values };
}

const CHART_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

export default function ChartRenderer({ chart, cells, onRemove }: ChartRendererProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { labels, values } = getDataFromRange(chart.dataRange, cells);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = chart.width;
        const h = chart.height;
        canvas.width = w * 2;
        canvas.height = h * 2;
        ctx.scale(2, 2);

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillRect(0, 0, w, h);

        // Title
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chart.title || 'Chart', w / 2, 20);

        const padding = { top: 35, right: 20, bottom: 40, left: 50 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        if (values.length === 0) return;

        const maxVal = Math.max(...values, 1);

        if (chart.type === 'bar') {
            const barWidth = chartW / values.length * 0.7;
            const gap = chartW / values.length * 0.3;

            values.forEach((val, i) => {
                const x = padding.left + i * (barWidth + gap) + gap / 2;
                const barH = (val / maxVal) * chartH;
                const y = padding.top + chartH - barH;

                ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
                ctx.fill();

                // Label
                ctx.fillStyle = '#666';
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(labels[i] || '', x + barWidth / 2, padding.top + chartH + 15);
            });
        } else if (chart.type === 'line') {
            ctx.strokeStyle = CHART_COLORS[0];
            ctx.lineWidth = 2;
            ctx.beginPath();

            values.forEach((val, i) => {
                const x = padding.left + (i / (values.length - 1 || 1)) * chartW;
                const y = padding.top + chartH - (val / maxVal) * chartH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Points
            values.forEach((val, i) => {
                const x = padding.left + (i / (values.length - 1 || 1)) * chartW;
                const y = padding.top + chartH - (val / maxVal) * chartH;
                ctx.fillStyle = CHART_COLORS[0];
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#666';
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(labels[i] || '', x, padding.top + chartH + 15);
            });
        } else if (chart.type === 'pie') {
            const total = values.reduce((a, b) => a + b, 0);
            if (total === 0) return;
            const cx = w / 2;
            const cy = padding.top + chartH / 2;
            const radius = Math.min(chartW, chartH) / 2 - 10;
            let startAngle = -Math.PI / 2;

            values.forEach((val, i) => {
                const sliceAngle = (val / total) * Math.PI * 2;
                ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();
                startAngle += sliceAngle;
            });
        }
    }, [chart, values, labels]);

    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <div
            className="chart-overlay"
            style={{
                left: chart.x,
                top: chart.y,
                width: chart.width,
                height: chart.height,
            }}
        >
            <button className="chart-close-btn" onClick={onRemove} title="Remove chart">×</button>
            <canvas
                ref={canvasRef}
                style={{ width: chart.width, height: chart.height }}
            />
        </div>
    );
}
