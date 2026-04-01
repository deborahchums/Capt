import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import './analysis-tool.scss';

const MARKETS = [
    { value: 'R_10', label: 'Volatility 10 Index' },
    { value: 'R_25', label: 'Volatility 25 Index' },
    { value: 'R_50', label: 'Volatility 50 Index' },
    { value: 'R_75', label: 'Volatility 75 Index' },
    { value: 'R_100', label: 'Volatility 100 Index' },
    { value: '1HZ10V', label: 'Volatility 10 (1s) Index' },
    { value: '1HZ25V', label: 'Volatility 25 (1s) Index' },
    { value: '1HZ50V', label: 'Volatility 50 (1s) Index' },
    { value: '1HZ75V', label: 'Volatility 75 (1s) Index' },
    { value: '1HZ100V', label: 'Volatility 100 (1s) Index' },
];

const STRATEGIES = [
    { value: 'matches_differs', label: 'Matches & Differs' },
    { value: 'even_odd', label: 'Even / Odd' },
    { value: 'over_under', label: 'Over / Under' },
    { value: 'rise_fall', label: 'Rise / Fall' },
    { value: 'higher_lower', label: 'Higher / Lower' },
];

type LogEntry = { type: 'success' | 'info' | 'error' | 'warning' | 'ok'; text: string; ts: number };

const LOG_TEMPLATES: Array<{ type: LogEntry['type']; text: string }> = [
    { type: 'success', text: 'Data stream established...' },
    { type: 'info', text: 'Authenticating API key...' },
    { type: 'error', text: 'Connection timeout. Retrying...' },
    { type: 'warning', text: 'Unstable connection detected...' },
    { type: 'info', text: 'Fetching market data...' },
    { type: 'ok', text: 'Prediction model loaded.' },
    { type: 'info', text: 'Compiling results...' },
    { type: 'success', text: 'Data stream established...' },
    { type: 'warning', text: 'High market volatility detected...' },
    { type: 'info', text: 'Predicting next digit...' },
    { type: 'ok', text: 'Encryption enabled.' },
    { type: 'info', text: 'Data transmission complete...' },
    { type: 'info', text: 'Analysing Volatility patterns...' },
    { type: 'info', text: 'Connecting to server...' },
];

function randomLog(): LogEntry {
    const tmpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
    return { ...tmpl, ts: Date.now() };
}

// ─── Entry Scanner Form ────────────────────────────────────────────────────

interface EntryScannerFormProps {
    initialMarket?: string;
    onClose?: () => void;
    standalone?: boolean;
}

const EntryScannerForm: React.FC<EntryScannerFormProps> = ({ initialMarket = '', onClose, standalone = false }) => {
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState(initialMarket);
    const [tradeType, setTradeType] = useState('Waiting for scan');
    const [ticks, setTicks] = useState('500');
    const [predPath, setPredPath] = useState('--');

    const handleScan = async () => {
        if (!selectedMarket) return;
        setScanning(true);
        setTradeType('Scanning...');
        setPredPath('--');
        setScanned(false);

        await new Promise(r => setTimeout(r, 2200));

        const types = ['Matches & Differs', 'Even / Odd', 'Over / Under', 'Rise / Fall'];
        const paths = ['DIGIT MATCH', 'DIGIT DIFFER', 'DIGIT EVEN', 'DIGIT ODD', 'DIGIT OVER 4', 'DIGIT UNDER 5'];
        setTradeType(types[Math.floor(Math.random() * types.length)]);
        setPredPath(paths[Math.floor(Math.random() * paths.length)]);
        setScanned(true);
        setScanning(false);
    };

    return (
        <div className={`at__es ${standalone ? 'at__es--standalone' : 'at__es--modal'}`}>
            {!standalone && onClose && (
                <button className='at__es-close' onClick={onClose}>✕</button>
            )}
            <h2 className='at__es-title'>Entry Scanner</h2>

            <div className='at__es-field'>
                <label className='at__es-label'>SELECTED MARKET</label>
                <select
                    className='at__es-input'
                    value={selectedMarket}
                    onChange={e => setSelectedMarket(e.target.value)}
                >
                    <option value=''>Scan for best market</option>
                    {MARKETS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className='at__es-field'>
                <label className='at__es-label'>TRADE TYPE</label>
                <div className='at__es-static'>
                    {scanning ? (
                        <span className='at__es-scanning'>
                            <span className='at__es-dot' /><span className='at__es-dot' /><span className='at__es-dot' />
                            Scanning...
                        </span>
                    ) : tradeType}
                </div>
            </div>

            <div className='at__es-field'>
                <label className='at__es-label'>TICKS NUMBER (100–5000)</label>
                <input
                    className='at__es-input'
                    type='number'
                    min='100'
                    max='5000'
                    value={ticks}
                    onChange={e => setTicks(e.target.value)}
                />
            </div>

            <div className='at__es-field'>
                <label className='at__es-label'>PREDICTION PATH</label>
                <div className='at__es-static'>{predPath}</div>
                <div className={`at__es-status ${scanned ? 'at__es-status--ready' : ''}`}>
                    {scanned ? '✓ Scan complete — best entry identified' : 'Not scanned yet'}
                </div>
            </div>

            <button
                className='at__es-btn at__es-btn--primary'
                onClick={handleScan}
                disabled={scanning || !selectedMarket}
            >
                {scanning ? 'Scanning...' : 'Scan for Best Market'}
            </button>

            <button
                className={`at__es-btn at__es-btn--secondary ${!scanned ? 'at__es-btn--muted' : ''}`}
                disabled={!scanned}
                onClick={onClose}
            >
                Load and Run Bot
            </button>
        </div>
    );
};

// ─── Signal Analyzer ───────────────────────────────────────────────────────

const SignalAnalyzer: React.FC = () => {
    const [strategy, setStrategy] = useState('matches_differs');
    const [market, setMarket] = useState('1HZ10V');
    const [latestTick, setLatestTick] = useState('--');
    const [lastDigit, setLastDigit] = useState('--');
    const [analysing, setAnalysing] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>(() =>
        Array.from({ length: 22 }, () => randomLog())
    );
    const subscriptionRef = useRef<any>(null);
    const subIdRef = useRef<string | null>(null);
    const logTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const addLog = useCallback((entry: LogEntry) => {
        setLogs(prev => [...prev, entry].slice(-50));
    }, []);

    useEffect(() => {
        logTimerRef.current = setInterval(() => addLog(randomLog()), 1400);
        return () => { if (logTimerRef.current) clearInterval(logTimerRef.current); };
    }, [addLog]);

    const stopSub = useCallback(async () => {
        if (subscriptionRef.current) {
            try { subscriptionRef.current.unsubscribe?.(); } catch (_) {}
            subscriptionRef.current = null;
        }
        if (subIdRef.current && chart_api.api) {
            try { await chart_api.api.forget(subIdRef.current); } catch (_) {}
            subIdRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!analysing) { stopSub(); return; }

        const run = async () => {
            if (!chart_api.api) {
                addLog({ type: 'warning', text: 'API not ready — retrying...', ts: Date.now() });
                return;
            }
            try {
                const res = await chart_api.api.send({ ticks: market, subscribe: 1 });
                if (res?.subscription?.id) subIdRef.current = res.subscription.id;
                if (res?.tick) {
                    const q = res.tick.quote;
                    setLatestTick(q.toFixed(2));
                    setLastDigit(String(Math.floor(q * 10) % 10));
                }
                subscriptionRef.current = chart_api.api.onMessage?.()?.subscribe(({ data }: any) => {
                    if (data?.msg_type === 'tick' && data?.tick) {
                        const q = data.tick.quote;
                        setLatestTick(q.toFixed(2));
                        setLastDigit(String(Math.floor(q * 10) % 10));
                        addLog({ type: 'info', text: `Tick: ${q.toFixed(2)} | Digit: ${Math.floor(q * 10) % 10}`, ts: Date.now() });
                    }
                });
            } catch (e) {
                addLog({ type: 'error', text: 'Market stream error. Retrying...', ts: Date.now() });
            }
        };

        run();
        return () => { stopSub(); };
    }, [analysing, market]);

    useEffect(() => () => { stopSub(); }, []);

    const handleAnalyse = () => {
        if (!analysing) {
            addLog({ type: 'success', text: `Starting analysis: ${MARKETS.find(m => m.value === market)?.label}`, ts: Date.now() });
            setLatestTick('--');
            setLastDigit('--');
        } else {
            addLog({ type: 'warning', text: 'Analysis stopped.', ts: Date.now() });
            setLatestTick('--');
            setLastDigit('--');
        }
        setAnalysing(v => !v);
    };

    const logColors: Record<LogEntry['type'], string> = {
        success: '#22c55e', info: '#60a5fa', error: '#ef4444', warning: '#f59e0b', ok: '#22c55e',
    };
    const logPfx: Record<LogEntry['type'], string> = {
        success: '[SUCCESS]', info: '[INFO]', error: '[ERROR]', warning: '[WARNING]', ok: '[OK]',
    };

    return (
        <div className='at__analyzer'>
            {scannerOpen && (
                <div className='at__modal-bg' onClick={() => setScannerOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <EntryScannerForm
                            initialMarket={market}
                            onClose={() => setScannerOpen(false)}
                        />
                    </div>
                </div>
            )}

            <div className='at__log-bg' aria-hidden='true'>
                {logs.map((l, i) => (
                    <span key={l.ts + i} style={{ color: logColors[l.type] }}>
                        {logPfx[l.type]} {l.text}{'\u00a0\u00a0\u00a0'}
                    </span>
                ))}
            </div>

            <div className='at__az-card'>
                <h2 className='at__az-title'>Signal Analyzer</h2>

                <div className='at__az-field'>
                    <label className='at__az-label'>Select Strategy</label>
                    <select className='at__az-select' value={strategy} onChange={e => setStrategy(e.target.value)} disabled={analysing}>
                        {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div className='at__az-field'>
                    <label className='at__az-label'>Select Market</label>
                    <select className='at__az-select' value={market} onChange={e => setMarket(e.target.value)} disabled={analysing}>
                        {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>

                <div className='at__az-stats'>
                    <div className='at__az-stat'>
                        <span className='at__az-stat-lbl'>Latest Tick:</span>
                        <span className={`at__az-stat-val ${analysing && latestTick !== '--' ? 'at__az-stat-val--live' : ''}`}>
                            {latestTick}
                        </span>
                    </div>
                    <div className='at__az-stat'>
                        <span className='at__az-stat-lbl'>Last Digit:</span>
                        <span className={`at__az-stat-val ${analysing && lastDigit !== '--' ? 'at__az-stat-val--live' : ''}`}>
                            {lastDigit}
                        </span>
                    </div>
                </div>

                <button className={`at__az-btn ${analysing ? 'at__az-btn--stop' : ''}`} onClick={handleAnalyse}>
                    {analysing ? 'Stop' : 'Analyse'}
                </button>

                <button className='at__az-btn at__az-btn--outline' onClick={() => setScannerOpen(true)}>
                    Entry Scanner
                </button>
            </div>
        </div>
    );
};

// ─── Digit Stats ───────────────────────────────────────────────────────────

const DigitStats: React.FC = () => {
    const [market, setMarket] = useState('1HZ10V');
    const [running, setRunning] = useState(false);
    const [counts, setCounts] = useState<number[]>(Array(10).fill(0));
    const [total, setTotal] = useState(0);
    const subRef = useRef<any>(null);
    const subIdRef = useRef<string | null>(null);

    const stopSub = useCallback(async () => {
        if (subRef.current) { try { subRef.current.unsubscribe?.(); } catch (_) {} subRef.current = null; }
        if (subIdRef.current && chart_api.api) { try { await chart_api.api.forget(subIdRef.current); } catch (_) {} subIdRef.current = null; }
    }, []);

    useEffect(() => {
        if (!running) return;
        const run = async () => {
            if (!chart_api.api) return;
            try {
                const res = await chart_api.api.send({ ticks: market, subscribe: 1 });
                if (res?.subscription?.id) subIdRef.current = res.subscription.id;
                subRef.current = chart_api.api.onMessage?.()?.subscribe(({ data }: any) => {
                    if (data?.msg_type === 'tick' && data?.tick) {
                        const d = Math.floor(data.tick.quote * 10) % 10;
                        setCounts(p => { const n = [...p]; n[d]++; return n; });
                        setTotal(t => t + 1);
                    }
                });
            } catch (_) {}
        };
        run();
        return () => { stopSub(); };
    }, [running, market]);

    useEffect(() => () => { stopSub(); }, []);

    const maxC = Math.max(...counts, 1);

    const handleToggle = () => {
        if (running) { stopSub(); setRunning(false); }
        else { setCounts(Array(10).fill(0)); setTotal(0); setRunning(true); }
    };

    return (
        <div className='at__ds'>
            <h2 className='at__ds-title'>Digit Statistics</h2>
            <div className='at__ds-controls'>
                <select className='at__ds-select' value={market} onChange={e => setMarket(e.target.value)} disabled={running}>
                    {MARKETS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <button className={`at__ds-btn ${running ? 'at__ds-btn--stop' : ''}`} onClick={handleToggle}>
                    {running ? 'Stop' : 'Start Live Stats'}
                </button>
            </div>
            <div className='at__ds-info'>
                Ticks: <strong>{total}</strong>
                {running && <span className='at__ds-live'>● Live</span>}
            </div>
            <div className='at__ds-bars'>
                {counts.map((c, d) => {
                    const pct = total > 0 ? ((c / total) * 100).toFixed(1) : '0.0';
                    return (
                        <div key={d} className='at__ds-col'>
                            <div className='at__ds-pct'>{pct}%</div>
                            <div className='at__ds-track'>
                                <div className='at__ds-fill' style={{ height: `${Math.round((c / maxC) * 100)}%` }} />
                            </div>
                            <div className='at__ds-digit'>{d}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Analysis Tool ────────────────────────────────────────────────────

const AnalysisTool = observer(() => {
    const [tab, setTab] = useState<'analyzer' | 'scanner' | 'digits'>('analyzer');

    return (
        <div className='at'>
            <div className='at__tabs'>
                <button className={`at__tab ${tab === 'analyzer' ? 'at__tab--active' : ''}`} onClick={() => setTab('analyzer')}>
                    Signal Analyzer
                </button>
                <button className={`at__tab ${tab === 'scanner' ? 'at__tab--active' : ''}`} onClick={() => setTab('scanner')}>
                    Entry Scanner
                </button>
                <button className={`at__tab ${tab === 'digits' ? 'at__tab--active' : ''}`} onClick={() => setTab('digits')}>
                    Digit Stats
                </button>
            </div>

            <div className='at__content'>
                {tab === 'analyzer' && <SignalAnalyzer />}
                {tab === 'scanner' && (
                    <div className='at__scanner-page'>
                        <EntryScannerForm standalone initialMarket='1HZ10V' />
                    </div>
                )}
                {tab === 'digits' && <DigitStats />}
            </div>
        </div>
    );
});

export default AnalysisTool;
