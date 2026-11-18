import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '@/shared/api/error-messages';
import { formatCurrency } from '@/shared/format/format';
import { parseMoneyInput } from '@/shared/format/money-input';
import { Alert, Button, Modal, SelectField, TextField } from '@/shared/ui';
import type { Wallet } from '@/features/wallets/api/wallets.api';
import { transfersApi } from '../api/transfers.api';
import styles from './TransferFormModal.module.css';

type Props = { wallets: Wallet[]; onClose: () => void; onSaved: () => void };
type Errors = Partial<Record<'source' | 'destination' | 'amount', string>>;

export function TransferFormModal({ wallets, onClose, onSaved }: Props) {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const sourceWallet = wallets.find((w) => w.id === source);

    function swap() {
        setSource(destination);
        setDestination(source);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = parseMoneyInput(amount);
        const found: Errors = {};
        if (!source) found.source = 'Escolha a carteira de origem.';
        if (!destination) found.destination = 'Escolha a carteira de destino.';
        else if (destination === source) found.destination = 'Origem e destino devem ser diferentes.';
        if (parsed === null || Number(parsed) <= 0) found.amount = 'Informe um valor maior que zero, como 250,00.';
        else if (sourceWallet && Number(parsed) > Number(sourceWallet.balance)) {
            found.amount = `Saldo insuficiente (disponível: ${formatCurrency(sourceWallet.balance)}).`;
        }
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            await transfersApi.create({ amount: parsed!, sourceWalletId: source, destinationWalletId: destination });
            onSaved();
        } catch (error) {
            setFormError(apiErrorMessage(error));
            setSaving(false);
        }
    }

    if (wallets.length < 2) {
        return (
            <Modal title="Nova transferência" onClose={onClose}>
                <p className={styles.notice}>Para transferir você precisa de pelo menos duas carteiras.</p>
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                    <Link to="/carteiras" className={styles.linkButton}>
                        Ir para carteiras
                    </Link>
                </div>
            </Modal>
        );
    }

    const options = wallets.map((w) => ({ value: w.id, label: `${w.name} · ${formatCurrency(w.balance)}` }));

    return (
        <Modal title="Nova transferência" onClose={onClose}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {formError && <Alert tone="danger">{formError}</Alert>}

                <SelectField
                    label="De (origem)"
                    placeholder="Selecione"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    options={options}
                    error={errors.source}
                />

                <button type="button" className={styles.swap} onClick={swap} disabled={!source && !destination}>
                    ⇅ Inverter
                </button>

                <SelectField
                    label="Para (destino)"
                    placeholder="Selecione"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    options={options.filter((o) => o.value !== source)}
                    error={errors.destination}
                />

                <TextField
                    label="Valor"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={errors.amount}
                    hint={sourceWallet ? `Disponível na origem: ${formatCurrency(sourceWallet.balance)}` : undefined}
                />

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saving}>
                        Transferir
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
