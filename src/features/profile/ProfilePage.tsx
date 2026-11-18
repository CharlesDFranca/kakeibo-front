import { Link } from 'react-router-dom';
import { initials } from '@/shared/format/format';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Button, CheckIcon, LogoutIcon, MinusIcon } from '@/shared/ui';
import { Card } from '@/features/dashboard/components/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { FEATURE_KEYS, FEATURE_LABEL, PLAN_INFO } from '@/features/plans/plans';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, themes, setThemeId } = useTheme();

    if (!user) return null;
    const displayName = user.name || user.username;

    return (
        <>
            <PageHeader eyebrow="Sua conta" title="Perfil" />

            <div className={styles.layout}>
                <Card tone="brand">
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
                        <span className={styles.planBadge}>Plano {PLAN_INFO[user.plan].label}</span>
                        <Link to="/planos" className={styles.manage}>
                            Gerenciar plano
                        </Link>
                    </div>
                </Card>

                <Card title="O que seu plano inclui">
                    <ul className={styles.features}>
                        {FEATURE_KEYS.map((key) => {
                            // a lista vem da API: é ela quem decide o acesso
                            const included = user.features.includes(key);
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
                    {user.plan !== 'PRO' && (
                        <Link to="/planos" className={styles.upgrade}>
                            Ver planos para liberar mais recursos →
                        </Link>
                    )}
                </Card>

                <Card title="Aparência">
                    <div className={styles.themes} role="radiogroup" aria-label="Tema">
                        {themes.map((t) => (
                            <label key={t.id} className={`${styles.theme} ${t.id === theme.id ? styles.themeActive : ''}`}>
                                <input type="radio" name="theme" value={t.id} checked={t.id === theme.id} onChange={() => setThemeId(t.id)} />
                                <span className={styles.swatch} aria-hidden="true">
                                    {[t.color.bg.app, t.color.bg.sidebar, t.color.accent.primary].map((c, i) => (
                                        <i key={i} style={{ background: c }} />
                                    ))}
                                </span>
                                {t.label}
                            </label>
                        ))}
                    </div>
                </Card>

                <Card title="Sessão">
                    <p className={styles.text}>Encerre a sessão neste navegador.</p>
                    <Button variant="ghost" onClick={() => void logout()}>
                        <LogoutIcon size={18} /> Sair da conta
                    </Button>
                </Card>
            </div>
        </>
    );
}
