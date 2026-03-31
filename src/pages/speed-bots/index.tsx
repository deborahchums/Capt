import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { load, save_types } from '@/external/bot-skeleton';
import './speed-bots.scss';

const MARKETS = [
    { value: 'R_10', label: 'Volatility 10 Index' },
    { value: 'R_25', label: 'Volatility 25 Index' },
    { value: 'R_50', label: 'Volatility 50 Index' },
    { value: 'R_75', label: 'Volatility 75 Index' },
    { value: 'R_100', label: 'Volatility 100 Index' },
    { value: '1HZ10V', label: 'Volatility 10 (1s) Index' },
    { value: '1HZ100V', label: 'Volatility 100 (1s) Index' },
];

const DIGIT_TYPES = [
    { value: 'even', label: 'Even' },
    { value: 'odd', label: 'Odd' },
    { value: 'over', label: 'Over' },
    { value: 'under', label: 'Under' },
];

const BOT_FILES: Record<string, string> = {
    even: 'Even_Bot_Free_Version_1774935169490.xml',
    odd: 'Even_Bot_Free_Version_1774935169490.xml',
    over: 'Over_Market_Dream_2.1_1774935169248.xml',
    under: 'Over_Market_Dream_2.1_1774935169248.xml',
};

const SpeedBots = observer(() => {
    const { dashboard } = useStore();
    const [market, setMarket] = useState('');
    const [digitType, setDigitType] = useState('even');
    const [ticks, setTicks] = useState('1');
    const [stake, setStake] = useState('0.5');
    const [altEvenOdd, setAltEvenOdd] = useState(false);
    const [altOnLoss, setAltOnLoss] = useState(false);
    const [martingale, setMartingale] = useState(true);
    const [martingaleMultiplier, setMartingaleMultiplier] = useState('1.15');
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [ticksProcessed, setTicksProcessed] = useState(0);
    const [lastDigit, setLastDigit] = useState(0);
    const [updating, setUpdating] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setUpdating(false), 1800);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTicksProcessed(p => p + 1);
                setLastDigit(Math.floor(Math.random() * 10));
            }, 900);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning]);

    const handleStart = async () => {
        const fileName = BOT_FILES[digitType] || 'Even_Bot_Free_Version_1774935169490.xml';
        try {
            const response = await fetch(`/bots/${fileName}`);
            if (!response.ok) throw new Error('Failed to fetch bot file');
            const xmlContent = await response.text();
            await load({
                block_string: xmlContent,
                file_name: `AI SpeedBot — ${digitType.toUpperCase()}`,
                workspace: (window as any).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });
            setIsRunning(true);
            setTicksProcessed(0);
            setLastDigit(0);
            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';
        } catch (e) {
            console.error('SpeedBot error:', e);
        }
    };

    const handleStop = () => setIsRunning(false);

    return (
        <div className='speedbot'>
            <div className='speedbot__body'>
                <h1 className='speedbot__headline'>EXECUTE TRADE ON EVERY TICK</h1>

                <div className='speedbot__row'>
                    <div className='speedbot__field speedbot__field--grow'>
                        <select
                            className='speedbot__select'
                            value={market}
                            onChange={e => setMarket(e.target.value)}
                        >
                            <option value=''>SELECT MARKET</option>
                            {MARKETS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className='speedbot__status-badge'>
                        {updating ? 'Updating...' : market ? '● Live' : '● Ready'}
                    </div>
                </div>

                <div className='speedbot__field'>
                    <select
                        className='speedbot__select'
                        value={digitType}
                        onChange={e => setDigitType(e.target.value)}
                    >
                        {DIGIT_TYPES.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                <div className='speedbot__row speedbot__row--two'>
                    <div className='speedbot__field'>
                        <label className='speedbot__label'>Ticks</label>
                        <input
                            className='speedbot__input'
                            type='number'
                            min='1'
                            max='10'
                            value={ticks}
                            onChange={e => setTicks(e.target.value)}
                        />
                    </div>
                    <div className='speedbot__field'>
                        <label className='speedbot__label'>Stake</label>
                        <input
                            className='speedbot__input'
                            type='number'
                            min='0.35'
                            step='0.01'
                            value={stake}
                            onChange={e => setStake(e.target.value)}
                        />
                    </div>
                </div>

                <div className='speedbot__row speedbot__row--two'>
                    <div className='speedbot__toggle-card'>
                        <span className='speedbot__toggle-label'>Alternate Even<br />and Odd</span>
                        <button
                            className={`speedbot__toggle ${altEvenOdd ? 'speedbot__toggle--on' : ''}`}
                            onClick={() => setAltEvenOdd(v => !v)}
                        >
                            <span className='speedbot__toggle-thumb' />
                        </button>
                    </div>
                    <div className='speedbot__toggle-card'>
                        <span className='speedbot__toggle-label'>Alternate on<br />Loss</span>
                        <button
                            className={`speedbot__toggle ${altOnLoss ? 'speedbot__toggle--on' : ''}`}
                            onClick={() => setAltOnLoss(v => !v)}
                        >
                            <span className='speedbot__toggle-thumb' />
                        </button>
                    </div>
                </div>

                <div className='speedbot__toggle-row'>
                    <span className='speedbot__toggle-label-full'>Enable Martingale</span>
                    <button
                        className={`speedbot__toggle ${martingale ? 'speedbot__toggle--on' : ''}`}
                        onClick={() => setMartingale(v => !v)}
                    >
                        <span className='speedbot__toggle-thumb' />
                    </button>
                </div>

                {martingale && (
                    <div className='speedbot__field'>
                        <label className='speedbot__label'>Martingale Multiplier</label>
                        <input
                            className='speedbot__input speedbot__input--right'
                            type='number'
                            min='1'
                            step='0.01'
                            value={martingaleMultiplier}
                            onChange={e => setMartingaleMultiplier(e.target.value)}
                        />
                    </div>
                )}

                <div className='speedbot__toggle-row'>
                    <span className='speedbot__toggle-label-full'>Recovery Mode</span>
                    <button
                        className={`speedbot__toggle ${recoveryMode ? 'speedbot__toggle--on' : ''}`}
                        onClick={() => setRecoveryMode(v => !v)}
                    >
                        <span className='speedbot__toggle-thumb' />
                    </button>
                </div>

                {!isRunning ? (
                    <button className='speedbot__start-btn' onClick={handleStart}>
                        START AI SPEEDBOT
                    </button>
                ) : (
                    <button className='speedbot__stop-btn' onClick={handleStop}>
                        STOP SPEEDBOT
                    </button>
                )}

                <div className='speedbot__stats-row'>
                    <span>Ticks Processed: <strong>{ticksProcessed}</strong></span>
                    <span>Last Digit: <strong>{lastDigit}</strong></span>
                </div>
            </div>

            <div className='speedbot__footer'>
                <div className='speedbot__run-bar'>
                    <button className={`speedbot__run-btn ${isRunning ? 'speedbot__run-btn--active' : ''}`}>
                        ▶ {isRunning ? 'Running' : 'Run'}
                    </button>
                    <span className='speedbot__run-status'>
                        {isRunning ? '● Bot is running...' : 'Bot is not running'}
                    </span>
                    <div className='speedbot__run-dots'>
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SpeedBots;
