import { useState } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, BellIcon, Button, CheckIcon, EmptyState, LockedFeature, Skeleton, TargetIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useHasFeature } from '@/features/auth/hooks';
import { notificationsApi, type AppNotification } from './notifications.api';
import styles from './NotificationsPage.module.css';

const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Notificações exigem o plano Pro; sem ele mostramos o bloqueio e não chamamos a API. */
export function NotificationsPage() {
    const allowed = useHasFeature('NOTIFICATIONS');

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow="Conta" title="Notificações" />
                <Card>
                    <LockedFeature
                        feature="Notificações"
                        plan="Pro"
                        description="Receba avisos, por exemplo quando uma meta for alcançada."
                    />
                </Card>
            </>
        );
    }

    return <NotificationsContent />;
}

function NotificationsContent() {
    const toast = useToast();
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const { state, reload } = useAsyncData(() => notificationsApi.list(onlyUnread), [onlyUnread]);

    const items = state.status === 'ready' ? state.data : [];
    const unread = items.filter((n) => !n.read);

    async function markOne(n: AppNotification) {
        setBusy(n.id);
        try {
            await notificationsApi.markAsRead(n.id);
            reload();
        } catch (error) {
            toast(apiErrorMessage(error), 'danger');
        } finally {
            setBusy(null);
        }
    }

    async function markAll() {
        setBusy('all');
        try {
            // a API só marca uma por vez
            const results = await Promise.allSettled(unread.map((n) => notificationsApi.markAsRead(n.id)));
            const failed = results.filter((r) => r.status === 'rejected').length;
            if (failed > 0) toast(`Não foi possível marcar ${failed} notificação(ões).`, 'danger');
            reload();
        } finally {
            setBusy(null);
        }
    }

    const markAllButton = unread.length > 0 && (
        <Button variant="ghost" onClick={() => void markAll()} loading={busy === 'all'}>
            <CheckIcon size={18} /> Marcar todas como lidas
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow="Conta" title="Notificações" actions={markAllButton || undefined} />

            <div className={styles.tabs} role="group" aria-label="Filtrar notificações">
                {[
                    { value: false, label: 'Todas' },
                    { value: true, label: 'Não lidas' },
                ].map((f) => (
                    <button
                        key={f.label}
                        type="button"
                        aria-pressed={onlyUnread === f.value}
                        className={`${styles.tab} ${onlyUnread === f.value ? styles.tabActive : ''}`}
                        onClick={() => setOnlyUnread(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {state.status === 'loading' && (
                <div className={styles.list}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} height={84} radius="var(--radius-lg)" />
                    ))}
                </div>
            )}

            {state.status === 'error' && (
                <div className={styles.error}>
                    <Alert tone="danger">{state.message}</Alert>
                    <Button variant="ghost" onClick={reload}>
                        Tentar novamente
                    </Button>
                </div>
            )}

            {state.status === 'ready' && items.length === 0 && (
                <Card>
                    <EmptyState icon={<BellIcon size={26} />} title={onlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação ainda'}>
                        {onlyUnread ? 'Você está em dia.' : 'Quando uma meta for alcançada, o aviso aparece aqui.'}
                    </EmptyState>
                </Card>
            )}

            {state.status === 'ready' && items.length > 0 && (
                <ul className={styles.list} aria-busy={state.refreshing}>
                    {items.map((n) => (
                        <li key={n.id} className={`${styles.item} ${n.read ? styles.read : ''}`}>
                            <span className={styles.icon} aria-hidden="true">
                                <TargetIcon size={20} />
                            </span>
                            <div className={styles.body}>
                                <strong className={styles.title}>
                                    {!n.read && <span className={styles.dot} aria-label="Não lida" />}
                                    {n.title}
                                </strong>
                                <p className={styles.message}>{n.message}</p>
                                <time className={styles.time} dateTime={n.createdAt}>
                                    {dateTime.format(new Date(n.createdAt))}
                                </time>
                            </div>
                            {!n.read && (
                                <Button variant="ghost" onClick={() => void markOne(n)} loading={busy === n.id}>
                                    Marcar como lida
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
