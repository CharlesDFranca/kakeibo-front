import { useState, type FormEvent } from 'react';
import { apiErrorMessage, t } from '@/shared/i18n';
import { Alert, Button, Modal, TextField } from '@/shared/ui';
import { goalsApi } from '../api/goals.api';
import { deadlineToIso, tomorrowDateOnly } from '../status';
import styles from './Forms.module.css';

type Props = { goalId: string; goalName: string; onClose: () => void; onSaved: () => void };

export function ReactivateModal({ goalId, goalName, onClose, onSaved }: Props) {
    const minDay = tomorrowDateOnly();
    const [deadline, setDeadline] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);
        if (!deadline || deadline < minDay) {
            setError(t('goals.reactivate.error'));
            return;
        }
        setError(undefined);
        setSaving(true);
        try {
            await goalsApi.reactivate(goalId, deadlineToIso(deadline));
            onSaved();
        } catch (e) {
            setFormError(apiErrorMessage(e));
            setSaving(false);
        }
    }

    return (
        <Modal title={t('goals.reactivate.title', { name: goalName })} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}
                <p className={styles.note}>{t('goals.reactivate.note')}</p>
                <TextField label={t('goals.reactivate.deadline')} type="date" min={minDay} value={deadline} onChange={(e) => setDeadline(e.target.value)} error={error} />
                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('goals.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {t('goals.reactivate.submit')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
