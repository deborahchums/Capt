import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { api_base } from '@/external/bot-skeleton';
import { useApiBase } from '@/hooks/useApiBase';
import './account-type-pill.scss';

const AccountTypePill = observer(() => {
    const { authData, accountList, activeLoginid } = useApiBase();
    const [isSwitching, setIsSwitching] = useState(false);

    if (!authData || !activeLoginid) return null;

    const isVirtual = authData.is_virtual === 1;
    const label = isVirtual ? 'Demo' : 'Real';

    const handleSwitch = async () => {
        if (isSwitching) return;
        const stored = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
        const target = accountList.find(acc => {
            const isTargetVirtual = acc.is_virtual === 1;
            return isVirtual ? !isTargetVirtual : isTargetVirtual;
        });
        if (!target || !stored[target.loginid]) return;
        setIsSwitching(true);
        try {
            localStorage.setItem('authToken', stored[target.loginid]);
            localStorage.setItem('active_loginid', target.loginid);
            const param = target.is_virtual ? 'demo' : (target.currency || 'USD');
            const sp = new URLSearchParams(window.location.search);
            sp.set('account', param);
            window.history.pushState({}, '', `${window.location.pathname}?${sp.toString()}`);
            await api_base?.init(true);
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <button
            className={`ce-account-type-pill ce-account-type-pill--${label.toLowerCase()}${isSwitching ? ' ce-account-type-pill--switching' : ''}`}
            onClick={handleSwitch}
            title={`Switch to ${isVirtual ? 'Real' : 'Demo'} account`}
            disabled={isSwitching}
        >
            <span className='ce-account-type-pill__label'>{label}</span>
            <svg
                className='ce-account-type-pill__icon'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden='true'
            >
                <path
                    d='M5 7l-3 3 3 3M15 7l3 3-3 3M8 10h4'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </svg>
        </button>
    );
});

export default AccountTypePill;
