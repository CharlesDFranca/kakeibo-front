import { useId, useState, type MouseEvent } from 'react';
import styles from './AreaChart.module.css';

export type AreaPoint = { label: string; value: number };

type Props = {
    data: AreaPoint[];
    format: (value: number) => string;
    height?: number;
};

const W = 600;
const PAD = { top: 16, right: 12, bottom: 12, left: 12 };

/** Linha suave com área, grade e tooltip. Só usa variáveis de tema. */
export function AreaChart({ data, format, height = 200 }: Props) {
    const gradientId = useId();
    const [active, setActive] = useState<number | null>(null);

    if (data.length === 0) return null;

    const H = height;
    const values = data.map((d) => d.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values);
    const span = max - min || 1;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const xs = data.map((_, i) =>
        data.length === 1 ? W / 2 : PAD.left + (i / (data.length - 1)) * innerW,
    );
    const ys = data.map((d) => PAD.top + innerH - ((d.value - min) / span) * innerH);

    // Curva suave (bezier com controles no meio do intervalo em x)
    let line = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < data.length; i++) {
        const cx = (xs[i - 1]! + xs[i]!) / 2;
        line += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    const area = `${line} L ${xs[xs.length - 1]} ${H - PAD.bottom} L ${xs[0]} ${H - PAD.bottom} Z`;

    const gridLines = [0, 1, 2, 3].map((i) => PAD.top + (innerH / 3) * i);

    function handleMove(e: MouseEvent<SVGSVGElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * W;
        let nearest = 0;
        for (let i = 1; i < xs.length; i++) {
            if (Math.abs(xs[i]! - x) < Math.abs(xs[nearest]! - x)) nearest = i;
        }
        setActive(nearest);
    }

    const point = active !== null ? data[active] : undefined;

    return (
        <div className={styles.wrap} style={{ height }}>
            <svg
                className={styles.svg}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                role="img"
                aria-label="Evolução do saldo"
                onMouseMove={handleMove}
                onMouseLeave={() => setActive(null)}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" className={styles.stopTop} />
                        <stop offset="100%" className={styles.stopBottom} />
                    </linearGradient>
                </defs>

                {gridLines.map((y) => (
                    <line key={y} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className={styles.grid} />
                ))}

                <path d={area} fill={`url(#${gradientId})`} />
                <path d={line} className={styles.line} vectorEffect="non-scaling-stroke" />

                {active !== null && (
                    <line x1={xs[active]} x2={xs[active]} y1={PAD.top} y2={H - PAD.bottom} className={styles.cursor} vectorEffect="non-scaling-stroke" />
                )}
            </svg>

            {point && active !== null && (
                <>
                    <span
                        className={styles.dot}
                        style={{ left: `${(xs[active]! / W) * 100}%`, top: `${(ys[active]! / H) * 100}%` }}
                    />
                    <div
                        className={styles.tooltip}
                        style={{
                            left: `${Math.min(Math.max((xs[active]! / W) * 100, 12), 88)}%`,
                            top: `${(ys[active]! / H) * 100}%`,
                        }}
                    >
                        <strong>{format(point.value)}</strong>
                        <span>{point.label}</span>
                    </div>
                </>
            )}
        </div>
    );
}
