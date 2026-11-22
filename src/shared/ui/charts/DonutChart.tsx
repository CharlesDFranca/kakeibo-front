import { t } from '@/shared/i18n';
import styles from './DonutChart.module.css';

export type DonutSlice = { label: string; value: number };

const SIZE = 120;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

/** Retorna o nome da variável CSS da série (cicla se houver mais fatias que cores). */
export const seriesColor = (index: number, total = 5) => `var(--chart-series-${index % total})`;

export function DonutChart({ slices, centerLabel, centerValue }: { slices: DonutSlice[]; centerLabel: string; centerValue: string }) {
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    let offset = 0;

    return (
        <div className={styles.wrap}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg} role="img" aria-label={t('dashboard.chart.expensesByCategory')}>
                <circle cx={SIZE / 2} cy={SIZE / 2} r={R} className={styles.track} strokeWidth={STROKE} />
                {total > 0 &&
                    slices.map((slice, i) => {
                        const length = (slice.value / total) * C;
                        const circle = (
                            <circle
                                key={slice.label}
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={R}
                                fill="none"
                                stroke={seriesColor(i)}
                                strokeWidth={STROKE}
                                strokeDasharray={`${Math.max(length - 2, 0)} ${C}`}
                                strokeDashoffset={-offset}
                                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                            />
                        );
                        offset += length;
                        return circle;
                    })}
            </svg>
            <div className={styles.center}>
                <span>{centerLabel}</span>
                <strong>{centerValue}</strong>
            </div>
        </div>
    );
}
