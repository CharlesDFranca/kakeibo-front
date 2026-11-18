import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Button, CheckIcon, ConfirmDialog, MinusIcon, useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { Plan } from '@/features/auth/api/auth.api';
import { BASE_FEATURES, FEATURE_KEYS, FEATURE_LABEL, PLAN_INFO, PLAN_ORDER, planDiff } from './plans';
import styles from './PlansPage.module.css';

export function PlansPage() {
    const { user, changePlan } = useAuth();
    const toast = useToast();
    const [target, setTarget] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);

    if (!user) return null;
    const current = user.plan;

    async function confirm(plan: Plan) {
        setSaving(true);
        try {
            await changePlan(plan);
            toast(`Plano alterado para ${PLAN_INFO[plan].label}.`);
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setSaving(false);
            setTarget(null);
        }
    }

    const diff = target ? planDiff(current, target) : null;
    const upgrade = target ? PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current) : false;

    return (
        <>
            <PageHeader eyebrow="Sua conta" title="Planos" />

            <p className={styles.intro}>
                Você está no plano <strong>{PLAN_INFO[current].label}</strong>. Por enquanto a troca de plano é direta, sem cobrança. Ao mudar, seus dados são mantidos; só o acesso às telas de cada plano muda.{' '}
                <Link to="/perfil">Ver perfil</Link>
            </p>

            <div className={styles.grid}>
                {PLAN_ORDER.map((plan) => {
                    const info = PLAN_INFO[plan];
                    const isCurrent = plan === current;
                    return (
                        <section key={plan} className={`${styles.card} ${isCurrent ? styles.current : ''}`} aria-label={`Plano ${info.label}`}>
                            <header className={styles.head}>
                                <h2 className={styles.name}>{info.label}</h2>
                                {isCurrent && <span className={styles.badge}>Plano atual</span>}
                            </header>
                            <p className={styles.tagline}>{info.tagline}</p>

                            <ul className={styles.features}>
                                {BASE_FEATURES.map((label) => (
                                    <li key={label} className={styles.on}>
                                        <CheckIcon size={16} /> {label}
                                    </li>
                                ))}
                                {FEATURE_KEYS.map((key) => {
                                    const included = info.features.includes(key);
                                    return (
                                        <li key={key} className={included ? styles.on : styles.off}>
                                            {included ? <CheckIcon size={16} /> : <MinusIcon size={16} />}
                                            <span>
                                                {FEATURE_LABEL[key]}
                                                {!included && <span className={styles.sr}> (não incluído)</span>}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>

                            <Button
                                variant={isCurrent ? 'ghost' : 'primary'}
                                fullWidth
                                disabled={isCurrent}
                                onClick={() => setTarget(plan)}
                            >
                                {isCurrent ? 'Plano atual' : PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(current) ? `Mudar para ${info.label}` : `Voltar para ${info.label}`}
                            </Button>
                        </section>
                    );
                })}
            </div>

            {target && diff && (
                <ConfirmDialog
                    title={`${upgrade ? 'Mudar' : 'Reduzir'} para ${PLAN_INFO[target].label}`}
                    confirmLabel="Confirmar"
                    loading={saving}
                    onCancel={() => setTarget(null)}
                    onConfirm={() => void confirm(target)}
                >
                    {diff.gained.length > 0 && (
                        <p>
                            <strong>Você ganha:</strong> {diff.gained.map((f) => FEATURE_LABEL[f]).join(', ')}.
                        </p>
                    )}
                    {diff.lost.length > 0 && (
                        <p>
                            <strong>Você perde o acesso a:</strong> {diff.lost.map((f) => FEATURE_LABEL[f]).join(', ')}. Seus dados continuam guardados e voltam a aparecer se você retornar ao plano.
                        </p>
                    )}
                </ConfirmDialog>
            )}
        </>
    );
}
