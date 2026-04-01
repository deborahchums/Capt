import React from 'react';
import { observer } from 'mobx-react-lite';
import { addComma, getDecimalPlaces } from '@/components/shared';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import './balance-chip.scss';

const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const points = countryCode
        .toUpperCase()
        .split('')
        .map(c => 0x1f1e6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...points);
};

type TBalanceChipProps = {
    onClick?: () => void;
};

const BalanceChip = observer(({ onClick }: TBalanceChipProps) => {
    const { authData, activeLoginid } = useApiBase();
    const { client } = useStore() ?? {};

    if (!authData || !activeLoginid) return null;

    const currency = authData.currency || client?.getCurrency?.() || 'USD';
    const isVirtual = authData.is_virtual === 1;
    const country = client?.residence || authData.country || '';
    const flag = isVirtual ? '🎮' : getFlagEmoji(country);

    const rawBalance =
        client?.all_accounts_balance?.accounts?.[activeLoginid]?.balance ??
        (typeof authData.balance === 'number' ? authData.balance : parseFloat(authData.balance as any) || 0);
    const displayBalance = addComma(rawBalance.toFixed(getDecimalPlaces(currency)));

    return (
        <button className='ce-balance-chip' onClick={onClick} title='Switch account'>
            <span className='ce-balance-chip__flag'>{flag}</span>
            <span className='ce-balance-chip__amount'>
                {displayBalance} {currency}
            </span>
            <svg
                className='ce-balance-chip__arrow'
                viewBox='0 0 10 6'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
            >
                <path d='M1 1l4 4 4-4' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
        </button>
    );
});

export default BalanceChip;
