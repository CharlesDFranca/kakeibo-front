import styles from './AuthShowcase.module.css';

/** Painel decorativo inspirado no dashboard de referência. */
export function AuthShowcase() {
    return (
        <div className={styles.root}>
            <div className={styles.copy}>
                <h2 className={styles.headline}>Seu dinheiro, com clareza.</h2>
                <p className={styles.text}>
                    Carteiras, transações e metas em um só lugar. Inspirado no
                    kakeibo, o método japonês de controle financeiro.
                </p>
            </div>

            <div className={styles.overview}>
                <div className={styles.overviewHead}>
                    <span>Visão geral</span>
                    <span className={styles.chip}>Mensal</span>
                </div>

                <svg
                    className={styles.chart}
                    viewBox="0 0 320 110"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="showcase-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0 80 C 30 40, 60 40, 90 66 S 150 100, 180 58 S 250 20, 320 48 L320 110 L0 110 Z"
                        fill="url(#showcase-fill)"
                    />
                    <path
                        d="M0 80 C 30 40, 60 40, 90 66 S 150 100, 180 58 S 250 20, 320 48"
                        fill="none"
                        stroke="var(--color-accent-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>

                <div className={styles.stats}>
                    <div>
                        <span className={styles.statLabel}>Receitas</span>
                        <strong>R$ 8.450</strong>
                    </div>
                    <div className={styles.statMain}>
                        <span className={styles.statLabel}>Saldo total</span>
                        <strong>R$ 12.980</strong>
                    </div>
                    <div>
                        <span className={styles.statLabel}>Despesas</span>
                        <strong>R$ 3.120</strong>
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.goal}>
                    <span className={styles.statLabel}>Meta: Viagem</span>
                    <div className={styles.bar}>
                        <span style={{ width: '72%' }} />
                    </div>
                    <small>72% concluída</small>
                </div>
                <div className={styles.pill}>
                    <span className={styles.statLabel}>Transferência</span>
                    <strong>Nubank → Reserva</strong>
                </div>
            </div>
        </div>
    );
}
