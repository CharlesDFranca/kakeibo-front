import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage, t } from '@/shared/i18n';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Button, CheckIcon, ConfirmDialog, MinusIcon, useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { Plan } from '@/features/auth/api/auth.api';
import { baseFeatures, FEATURE_KEYS, FEATURE_LABEL, PLAN_INFO, PLAN_ORDER, planDiff } from './plans';
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
            toast(t('plans.changed', { plan: PLAN_INFO[plan].label }));
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
            <PageHeader eyebrow={t('plans.eyebrow')} title={t('plans.title')} />

            <p className={styles.intro}>
                {t('plans.intro', { plan: '\u0000' })
                    .split('\u0000')
                    .flatMap((part, i) => (i === 0 ? [part] : [<strong key="plan">{PLAN_INFO[current].label}</strong>, part]))}{' '}
                <Link to="/perfil">{t('plans.viewProfile')}</Link>
            </p>

            <div className={styles.grid} data-tour="plan-cards">
                {PLAN_ORDER.map((plan) => {
                    const info = PLAN_INFO[plan];
                    const isCurrent = plan === current;
                    return (
                        <section key={plan} className={`${styles.card} ${isCurrent ? styles.current : ''}`} data-tour={isCurrent ? 'plan-current' : undefined} aria-label={t('plans.planAria', { plan: info.label })}>
                            <header className={styles.head}>
                                <h2 className={styles.name}>{info.label}</h2>
                                {isCurrent && <span className={styles.badge}>{t('plans.current')}</span>}
                            </header>
                            <p className={styles.tagline}>{info.tagline}</p>

                            <ul className={styles.features}>
                                {baseFeatures().map((label) => (
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
                                                {!included && <span className={styles.sr}>{t('plans.notIncluded')}</span>}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>

                            <Button
                                data-tour={isCurrent ? undefined : 'plan-change'}
                                variant={isCurrent ? 'ghost' : 'primary'}
                                fullWidth
                                disabled={isCurrent}
                                onClick={() => setTarget(plan)}
                            >
                                {isCurrent ? t('plans.current') : PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(current) ? t('plans.switchTo', { plan: info.label }) : t('plans.backTo', { plan: info.label })}
                            </Button>
                        </section>
                    );
                })}
            </div>

            {target && diff && (
                <ConfirmDialog
                    title={t(upgrade ? 'plans.dialog.upgrade' : 'plans.dialog.downgrade', { plan: PLAN_INFO[target].label })}
                    confirmLabel={t('plans.dialog.confirm')}
                    loading={saving}
                    onCancel={() => setTarget(null)}
                    onConfirm={() => void confirm(target)}
                >
                    {diff.gained.length > 0 && (
                        <p>
                            <strong>{t('plans.dialog.gain')}</strong> {diff.gained.map((f) => FEATURE_LABEL[f]).join(', ')}.
                        </p>
                    )}
                    {diff.lost.length > 0 && (
                        <p>
                            <strong>{t('plans.dialog.lose')}</strong> {diff.lost.map((f) => FEATURE_LABEL[f]).join(', ')}. {t('plans.dialog.loseNote')}
                        </p>
                    )}
                </ConfirmDialog>
            )}
        </>
    );
}
