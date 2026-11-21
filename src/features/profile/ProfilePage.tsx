import { Link } from 'react-router-dom';
import { initials } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Button, CheckIcon, LogoutIcon, MinusIcon, StarIcon } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { SCREENS, TUTORIAL_ORDER, useTutorial } from '@/features/tutorial';
import { FEATURE_KEYS, FEATURE_LABEL, PLAN_INFO } from '@/features/plans/plans';
import { LOCALES, t, useI18n } from '@/shared/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, themes, setThemeId } = useTheme();
    const { replay, resetAll } = useTutorial();
    const { locale, setLocale } = useI18n();

    if (!user) return null;
    const displayName = user.name || user.username;

    return (
        <>
            <PageHeader eyebrow={t('profile.eyebrow')} title={t('profile.title')} />

            <div className={styles.layout}>
                <Card tone="brand" tour="profile-id">
                    <div className={styles.identity}>
                        <span className={styles.avatar} aria-hidden="true">
                            {initials(displayName)}
                        </span>
                        <div>
                            <h2 className={styles.name}>{displayName}</h2>
                            <span className={styles.username}>@{user.username}</span>
                        </div>
                    </div>
                    <div className={styles.planRow}>
                        <span className={styles.planBadge}>{t('profile.planBadge', { plan: PLAN_INFO[user.plan].label })}</span>
                        <Link to="/planos" className={styles.manage}>
                            {t('profile.managePlan')}
                        </Link>
                    </div>
                </Card>

                <Card title={t('profile.features.title')} tour="profile-features">
                    <ul className={styles.features}>
                        {FEATURE_KEYS.map((key) => {
                            // a lista vem da API: é ela quem decide o acesso
                            const included = user.features.includes(key);
                            return (
                                <li key={key} className={included ? styles.on : styles.off}>
                                    {included ? <CheckIcon size={16} /> : <MinusIcon size={16} />}
                                    <span>
                                        {FEATURE_LABEL[key]}
                                        {!included && <span className={styles.sr}> ({t('profile.features.excluded')})</span>}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                    {user.plan !== 'PRO' && (
                        <Link to="/planos" className={styles.upgrade}>
                            {t('profile.features.upgrade')}
                        </Link>
                    )}
                </Card>

                <Card title={t('profile.theme.title')} tour="profile-theme">
                    <div className={styles.themes} role="radiogroup" aria-label={t('profile.theme.aria')}>
                        {themes.map((th) => (
                            <label key={th.id} className={`${styles.theme} ${th.id === theme.id ? styles.themeActive : ''}`}>
                                <input type="radio" name="theme" value={th.id} checked={th.id === theme.id} onChange={() => setThemeId(th.id)} />
                                <span className={styles.swatch} aria-hidden="true">
                                    {[th.color.bg.app, th.color.bg.sidebar, th.color.accent.primary].map((c, i) => (
                                        <i key={i} style={{ background: c }} />
                                    ))}
                                </span>
                                {th.label === 'Alto contraste' ? t('profile.theme.highContrast') : th.label}
                            </label>
                        ))}
                    </div>
                </Card>

                <Card title={t('profile.tutorials.title')} tour="profile-tutorial">
                    <p className={styles.text}>{t('profile.tutorials.hint')}</p>
                    <ul className={styles.tutorials}>
                        {TUTORIAL_ORDER.filter((id) => !SCREENS[id].feature || user.features.includes(SCREENS[id].feature!)).map((id) => (
                            <li key={id}>
                                <button type="button" className={styles.tutorialBtn} onClick={() => replay(id)} aria-label={`${t('profile.tutorials.replay')}: ${SCREENS[id].label}`}>
                                    <span className={styles.tutorialName}>
                                        {SCREENS[id].icon}
                                        {SCREENS[id].label}
                                    </span>
                                    {user.seenTutorials.includes(id) ? null : <em className={styles.newTag}>{t('profile.tutorials.new')}</em>}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <Button variant="ghost" onClick={resetAll}>
                        <StarIcon size={18} /> {t('profile.tutorials.resetAll')}
                    </Button>
                </Card>

                <Card title={t('profile.language.title')} tour="profile-language">
                    <p className={styles.text}>{t('profile.language.hint')}</p>
                    <div className={styles.themes} role="radiogroup" aria-label={t('profile.language.title')}>
                        {LOCALES.map((l) => (
                            <label key={l.id} className={`${styles.theme} ${l.id === locale ? styles.themeActive : ''}`}>
                                <input type="radio" name="locale" value={l.id} checked={l.id === locale} onChange={() => setLocale(l.id)} />
                                {l.name}
                            </label>
                        ))}
                    </div>
                </Card>

                <Card title={t('profile.session.title')} tour="profile-logout">
                    <p className={styles.text}>{t('profile.session.hint')}</p>
                    <Button variant="ghost" onClick={() => void logout()}>
                        <LogoutIcon size={18} /> {t('profile.session.logout')}
                    </Button>
                </Card>
            </div>
        </>
    );
}
