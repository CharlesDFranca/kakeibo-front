import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { parseMoneyInput } from '@/shared/format/money-input';
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
        if (!name.trim()) found.name = 'Informe um nome.';
        const amount = parseMoneyInput(target);
        if (!editing) {
            if (amount === null || Number(amount) <= 0) found.target = 'Informe um valor-alvo maior que zero, como 5.000,00.';
            if (!deadline) found.deadline = 'Escolha o prazo.';
            else if (deadline < minDay) found.deadline = 'O prazo precisa ser a partir de amanhã.';
        }
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await goalsApi.rename(goal.id, name.trim());
                onSaved('Meta renomeada.');
            } else {
                await goalsApi.create({ name: name.trim(), targetAmount: amount!, deadline: deadlineToIso(deadline) });
                onSaved('Meta criada.');
            }
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    return (
        <Modal title={editing ? 'Renomear meta' : 'Nova meta'} onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <TextField
                    label="Nome"
                    placeholder="Ex.: Viagem, Notebook, Reserva"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                />

                {!editing && (
                    <>
                        <TextField
                            label="Valor-alvo"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            error={errors.target}
                        />
                        <TextField
                            label="Prazo"
                            type="date"
                            min={minDay}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            error={errors.deadline}
                            hint="Se o prazo passar sem atingir o valor, a meta expira (você pode reativá-la)."
                        />
                    </>
                )}

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saving}>
                        {editing ? 'Salvar' : 'Criar meta'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
