import { useState, type FormEvent } from 'react';
import { parseMoneyInput } from '@/shared/format/money-input';
import { apiErrorMessage, t } from '@/shared/i18n';
import { Alert, Button, Modal, TextField } from '@/shared/ui';
import { goalsApi } from '../api/goals.api';
import { deadlineToIso, tomorrowDateOnly } from '../status';
import styles from './Forms.module.css';

type Props = {
    /** Se informado, é renomeação. */
    goal?: { id: string; name: string };
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function GoalFormModal({ goal, onClose, onSaved }: Props) {
    const editing = goal !== undefined;
    const minDay = tomorrowDateOnly();
    const [name, setName] = useState(goal?.name ?? '');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [errors, setErrors] = useState<Partial<Record<'name' | 'target' | 'deadline', string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const found: typeof errors = {};
        if (!name.trim()) found.name = t('goals.form.error.name');
        const amount = parseMoneyInput(target);
        if (!editing) {
            if (amount === null || Number(amount) <= 0) found.target = t('goals.form.error.target');
            if (!deadline) found.deadline = t('goals.form.error.deadline');
            else if (deadline < minDay) found.deadline = t('goals.form.error.deadlineMin');
        }
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await goalsApi.rename(goal.id, name.trim());
                onSaved(t('goals.toast.renamed'));
            } else {
                await goalsApi.create({ name: name.trim(), targetAmount: amount!, deadline: deadlineToIso(deadline) });
                onSaved(t('goals.toast.created'));
            }
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    return (
        <Modal title={editing ? t('goals.form.renameTitle') : t('goals.form.newTitle')} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <TextField
                    label={t('goals.form.name')}
                    placeholder={t('goals.form.namePlaceholder')}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                />

                {!editing && (
                    <>
                        <TextField
                            label={t('goals.form.target')}
                            inputMode="decimal"
                            placeholder={t('goals.form.amountPlaceholder')}
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            error={errors.target}
                        />
                        <TextField
                            label={t('goals.form.deadline')}
                            type="date"
                            min={minDay}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            error={errors.deadline}
                            hint={t('goals.form.deadlineHint')}
                        />
                    </>
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        {t('goals.form.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {editing ? t('goals.form.save') : t('goals.form.create')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
