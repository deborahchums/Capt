import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { useApiBase } from '@/hooks/useApiBase';
import './copy-trading.scss';

const CopyTrading = observer(() => {
    const { client } = useStore() ?? {};
    const { activeLoginid, authData } = useApiBase();
    const [token, setToken] = useState('');
    const [clients, setClients] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Read loginid from multiple sources — reactive first, then localStorage fallback
    const storedLoginid = localStorage.getItem('active_loginid') || '';
    const accountId = activeLoginid || authData?.loginid || client?.loginid || storedLoginid || '—';
    const balance = client?.balance ?? (authData?.balance != null ? String(authData.balance) : '0.00');
    const currency = client?.currency || authData?.currency || 'USD';

    const handleAdd = () => {
        const val = token.trim();
        if (!val) return;
        if (!clients.includes(val)) {
            setClients(prev => [...prev, val]);
        }
        setToken('');
    };

    const handleSync = async () => {
        setSyncing(true);
        await new Promise(r => setTimeout(r, 1200));
        setSyncing(false);
    };

    const handleRemove = (t: string) => {
        setClients(prev => prev.filter(c => c !== t));
    };

    const handleStartCopy = () => {
        if (clients.length === 0) return;
        setIsRunning(true);
    };

    const handleStop = () => setIsRunning(false);

    return (
        <div className='ct'>
            <div className='ct__header'>
                <button className='ct__demo-btn'>
                    Start Demo to Real Copy Trading
                </button>
                <button className='ct__yt-btn' aria-label='Tutorial'>
                    <span className='ct__yt-icon'>▶</span>
                    <span>Tutorial</span>
                </button>
            </div>

            <div className='ct__account-card'>
                <span className='ct__account-id'>{accountId}</span>
                <span className='ct__account-balance'>{parseFloat(balance || '0').toFixed(2)} {currency}</span>
            </div>

            <div className='ct__section-title'>Add tokens to Replicator</div>

            <div className='ct__card'>
                <div className='ct__token-row'>
                    <input
                        className='ct__token-input'
                        placeholder='Enter Client token'
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <button className='ct__add-btn' onClick={handleAdd}>Add</button>
                    <button
                        className='ct__sync-btn'
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        {syncing ? (
                            <span className='ct__sync-spinner' />
                        ) : (
                            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
                                <path d='M23 4v6h-6M1 20v-6h6'/>
                                <path d='M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15'/>
                            </svg>
                        )} Sync
                    </button>
                </div>

                <button className='ct__tutorial-icon' aria-label='Tutorial'>
                    <span className='ct__yt-icon ct__yt-icon--sm'>▶</span>
                    <span>Tutorial</span>
                </button>
            </div>

            <div className='ct__card'>
                <div className='ct__clients-row'>
                    <div className='ct__clients-count'>
                        Total Clients added: <strong>{clients.length}</strong>
                    </div>
                    <button
                        className='ct__start-copy-btn'
                        onClick={isRunning ? handleStop : handleStartCopy}
                        disabled={!isRunning && clients.length === 0}
                    >
                        {isRunning ? 'Stop Copy Trading' : 'Start Copy Trading'}
                    </button>
                </div>

                {clients.length === 0 ? (
                    <p className='ct__no-clients'>No tokens added yet</p>
                ) : (
                    <ul className='ct__client-list'>
                        {clients.map(c => (
                            <li key={c} className='ct__client-item'>
                                <span className='ct__client-token'>{c}</span>
                                <button className='ct__remove-btn' onClick={() => handleRemove(c)}>✕</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isRunning && (
                <div className='ct__card ct__card--running'>
                    <div className='ct__running-indicator' />
                    <span>Copy trading active — replicating {clients.length} client(s)</span>
                </div>
            )}

            <div className='ct__footer'>
                <div className='ct__run-bar'>
                    <button
                        className={`ct__run-btn ${isRunning ? 'ct__run-btn--active' : ''}`}
                        onClick={isRunning ? handleStop : handleStartCopy}
                    >
                        ▶ {isRunning ? 'Running' : 'Run'}
                    </button>
                    <span className='ct__run-status'>
                        {isRunning ? '● Copy trading is active' : 'Bot is not running'}
                    </span>
                    <div className='ct__run-dots'>
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CopyTrading;
