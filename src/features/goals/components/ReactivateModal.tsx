import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
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
            setError('Escolha um novo prazo a partir de amanhã.');
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
        <Modal title={`Reativar ${goalName}`} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}
                <p className={styles.note}>A meta volta a ficar em andamento, com o que já foi aportado, até o novo prazo.</p>
                <TextField label="Novo prazo" type="date" min={minDay} value={deadline} onChange={(e) => setDeadline(e.target.value)} error={error} />
                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saving}>
                        Reativar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
