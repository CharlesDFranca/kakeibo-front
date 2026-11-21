import { useState } from 'react';
import { useAsyncData } from '@/shared/hooks/useAsyncData';
import { apiErrorMessage, intlTag, notificationText, t, tn } from '@/shared/i18n';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Alert, BellIcon, Button, CheckIcon, EmptyState, LockedFeature, Skeleton, TargetIcon, useToast } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useHasFeature } from '@/features/auth/hooks';
import { notificationsApi, type AppNotification } from './notifications.api';
import styles from './NotificationsPage.module.css';

const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat(intlTag(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Notificações exigem o plano Pro; sem ele mostramos o bloqueio e não chamamos a API. */
export function NotificationsPage() {
    const allowed = useHasFeature('NOTIFICATIONS');

    if (!allowed) {
        return (
            <>
                <PageHeader eyebrow={t('notifications.eyebrow')} title={t('notifications.title')} />
                <Card>
                    <LockedFeature
                        feature={t('notifications.locked.feature')}
                        plan="Pro"
                        description={t('notifications.locked.description')}
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
            if (failed > 0) toast(tn('notifications.markFailed', failed), 'danger');
            reload();
        } finally {
            setBusy(null);
        }
    }

    const markAllButton = unread.length > 0 && (
        <Button variant="ghost" onClick={() => void markAll()} loading={busy === 'all'} data-tour="notif-markall">
            <CheckIcon size={18} /> {t('notifications.markAll')}
        </Button>
    );

    return (
        <>
            <PageHeader eyebrow={t('notifications.eyebrow')} title={t('notifications.title')} actions={markAllButton || undefined} />

            <div className={styles.tabs} role="group" aria-label={t('notifications.filters.aria')} data-tour="notif-filters">
                {[
                    { value: false, label: t('notifications.filter.all') },
                    { value: true, label: t('notifications.filter.unread') },
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
                        {t('notifications.retry')}
                    </Button>
                </div>
            )}

            {state.status === 'ready' && items.length === 0 && (
                <Card tour="notif-empty">
                    <EmptyState icon={<BellIcon size={26} />} title={onlyUnread ? t('notifications.empty.unread.title') : t('notifications.empty.title')}>
                        {onlyUnread ? t('notifications.empty.unread.text') : t('notifications.empty.text')}
                    </EmptyState>
                </Card>
            )}

            {state.status === 'ready' && items.length > 0 && (
                <ul className={styles.list} aria-busy={state.refreshing} data-tour="notif-list">
                    {items.map((n) => {
                        const text = notificationText(n);
                        return (
                        <li key={n.id} className={`${styles.item} ${n.read ? styles.read : ''}`}>
                            <span className={styles.icon} aria-hidden="true">
                                <TargetIcon size={20} />
                            </span>
                            <div className={styles.body}>
                                <strong className={styles.title}>
                                    {!n.read && <span className={styles.dot} aria-label={t('notifications.unread.aria')} />}
                                    {text.title}
                                </strong>
                                <p className={styles.message}>{text.message}</p>
                                <time className={styles.time} dateTime={n.createdAt}>
                                    {formatDateTime(n.createdAt)}
                                </time>
                            </div>
                            {!n.read && (
                                <Button variant="ghost" data-tour="notif-mark" onClick={() => void markOne(n)} loading={busy === n.id}>
                                    {t('notifications.markOne')}
                                </Button>
                            )}
                        </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
