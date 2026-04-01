import React, { useEffect, useRef, useState } from 'react';
import { generateOAuthURL } from '@/components/shared';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import './landing.scss';

// ── Stars data (generated once) ────────────────────────────────────────────
const STARS = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.6 + 0.4,
    o: Math.random() * 0.6 + 0.2,
    dur: Math.random() * 3 + 2,
    delay: Math.random() * 4,
}));

// ── Feature chips shown at bottom of loading screen ────────────────────────
const CHIPS = [
    { icon: '🤖', label: 'AI Bots',       sub: 'Smart automation' },
    { icon: '📊', label: 'Analysis Tool',  sub: 'Deep insights' },
    { icon: '🔗', label: 'Copy Trading',   sub: 'Follow experts' },
    { icon: '⚡', label: 'Speed Bot',      sub: 'Lightning fast' },
];

// ── Status messages cycling in the pill ────────────────────────────────────
const STATUS_MSGS = [
    'Analyzing Tick Data...',
    'Connecting to Markets...',
    'Loading AI Models...',
    'Fetching Live Prices...',
    'Initializing Platform...',
    'Almost Ready...',
];

// ── Stats data ──────────────────────────────────────────────────────────────
const STATS = [
    { label: 'Active Traders',  value: '50.0K++' },
    { label: 'Trading Volume',  value: '$2.5B++'  },
    { label: 'Uptime',          value: '99.9%'    },
    { label: 'Trading Pairs',   value: '150++'    },
];

// ── Circular SVG progress ring ──────────────────────────────────────────────
const RADIUS = 80;
const CIRCUM = 2 * Math.PI * RADIUS;

function ProgressRing({ pct }: { pct: number }) {
    const offset = CIRCUM - (pct / 100) * CIRCUM;
    return (
        <svg className='ce2-ring' viewBox='0 0 200 200' fill='none'>
            <defs>
                <linearGradient id='ring-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%'   stopColor='#00e5cc' />
                    <stop offset='33%'  stopColor='#3b82f6' />
                    <stop offset='66%'  stopColor='#ec4899' />
                    <stop offset='100%' stopColor='#a855f7' />
                </linearGradient>
                <linearGradient id='track-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%'   stopColor='#1e3a5f' />
                    <stop offset='100%' stopColor='#2d1b4e' />
                </linearGradient>
            </defs>
            {/* Track */}
            <circle cx='100' cy='100' r={RADIUS} stroke='url(#track-grad)' strokeWidth='12' />
            {/* Progress arc */}
            <circle
                cx='100' cy='100' r={RADIUS}
                stroke='url(#ring-grad)'
                strokeWidth='12'
                strokeLinecap='round'
                strokeDasharray={CIRCUM}
                strokeDashoffset={offset}
                transform='rotate(-90 100 100)'
                style={{ transition: 'stroke-dashoffset 0.08s linear' }}
            />
            {/* Glowing dot at tip */}
            <circle
                cx={100 + RADIUS * Math.cos((2 * Math.PI * pct) / 100 - Math.PI / 2)}
                cy={100 + RADIUS * Math.sin((2 * Math.PI * pct) / 100 - Math.PI / 2)}
                r='6'
                fill='#00e5cc'
                style={{ filter: 'drop-shadow(0 0 6px #00e5cc)' }}
            />
        </svg>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
const LandingPage = () => {
    const [pct, setPct] = useState(0);
    const [loadingDone, setLoadingDone] = useState(false);
    const [loadingHidden, setLoadingHidden] = useState(false);
    const [msgIdx, setMsgIdx] = useState(0);
    const [loggingIn, setLoggingIn] = useState(false);

    // Count up from 0 → 100 over ~3.2 s
    useEffect(() => {
        const start = performance.now();
        const DURATION = 3200;

        const tick = (now: number) => {
            const elapsed = now - start;
            const p = Math.min(Math.floor((elapsed / DURATION) * 100), 100);
            setPct(p);
            if (p < 100) {
                requestAnimationFrame(tick);
            } else {
                setLoadingDone(true);
                setTimeout(() => setLoadingHidden(true), 700);
            }
        };
        requestAnimationFrame(tick);
    }, []);

    // Cycle status message
    useEffect(() => {
        const iv = setInterval(() => {
            setMsgIdx(i => (i + 1) % STATUS_MSGS.length);
        }, 700);
        return () => clearInterval(iv);
    }, []);

    const handleLogin = async () => {
        if (loggingIn) return;
        setLoggingIn(true);
        try {
            // Use OIDC authentication (same flow as the rest of the app).
            // Falls back to legacy OAuth URL if OIDC fails.
            await requestOidcAuthentication({
                redirectCallbackUri: `${window.location.origin}/callback`,
            });
        } catch {
            // If OIDC fails, fall back to legacy OAuth redirect
            window.location.href = generateOAuthURL();
        }
    };

    return (
        <div className='ce2'>

            {/* ═══════════════ LOADING SCREEN ═══════════════ */}
            {!loadingHidden && (
                <div className={`ce2-loading${loadingDone ? ' ce2-loading--out' : ''}`}>
                    {/* Star particles */}
                    <svg className='ce2-stars' aria-hidden>
                        {STARS.map(s => (
                            <circle
                                key={s.id}
                                cx={`${s.x}%`} cy={`${s.y}%`}
                                r={s.r} fill='#fff'
                                opacity={s.o}
                                style={{ animation: `ce2-twinkle ${s.dur}s ${s.delay}s infinite alternate ease-in-out` }}
                            />
                        ))}
                    </svg>

                    {/* Ring + counter */}
                    <div className='ce2-ring-wrap'>
                        <ProgressRing pct={pct} />
                        <div className='ce2-ring-center'>
                            <span className='ce2-ring-pct'>{pct}</span>
                            <span className='ce2-ring-lbl'>LOADING</span>
                        </div>
                    </div>

                    {/* Brand */}
                    <div className='ce2-brand'>
                        <span className='ce2-brand__primary'>Capital</span>
                        <span className='ce2-brand__secondary'> Edge</span>
                    </div>
                    <div className='ce2-tagline'>TRADE SMARTER. EXECUTE FASTER.</div>

                    {/* Status pill */}
                    <div className='ce2-pill'>
                        <img src='/capital-edge-logo-dark.png' alt='' className='ce2-pill__icon' />
                        <span className='ce2-pill__text'>{STATUS_MSGS[msgIdx]}</span>
                        <span className='ce2-pill__dots'>
                            <span /><span /><span />
                        </span>
                    </div>

                    {/* Feature chips */}
                    <div className='ce2-chips'>
                        {CHIPS.map(c => (
                            <div className='ce2-chip' key={c.label}>
                                <span className='ce2-chip__icon'>{c.icon}</span>
                                <div className='ce2-chip__text'>
                                    <span className='ce2-chip__label'>{c.label}</span>
                                    <span className='ce2-chip__sub'>{c.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════ LANDING PAGE ═══════════════ */}
            <div className={`ce2-page${loadingHidden ? ' ce2-page--visible' : ''}`}>

                {/* ── Chart canvas background ── */}
                <div className='ce2-chart-bg' aria-hidden>
                    <svg viewBox='0 0 400 220' preserveAspectRatio='none' className='ce2-chart-svg'>
                        <defs>
                            <linearGradient id='chart-fill' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='0%'   stopColor='#3dba7e' stopOpacity='0.18' />
                                <stop offset='100%' stopColor='#3dba7e' stopOpacity='0' />
                            </linearGradient>
                        </defs>
                        {/* Candlestick lines */}
                        {[40,70,100,130,160,190,220,250,280,310,340,370].map((x, i) => {
                            const h = Math.max(8, Math.abs(30 + Math.sin(i * 1.2) * 22 + Math.cos(i * 0.7) * 15));
                            const y = 100 - h / 2;
                            const isUp = i % 3 !== 1;
                            return (
                                <g key={x} opacity='0.5'>
                                    <line x1={x} y1={y - 15} x2={x} y2={y + h + 15} stroke={isUp ? '#3dba7e' : '#ef4444'} strokeWidth='1' />
                                    <rect x={x - 6} y={y} width='12' height={h} fill={isUp ? '#3dba7e' : '#ef4444'} rx='1' />
                                </g>
                            );
                        })}
                        {/* Trend line */}
                        <polyline
                            points='0,160 50,140 100,120 150,130 200,100 250,90 300,75 350,60 400,50'
                            stroke='#3dba7e' strokeWidth='2' fill='none' opacity='0.7'
                        />
                        <polyline
                            points='0,160 50,140 100,120 150,130 200,100 250,90 300,75 350,60 400,50 400,220 0,220'
                            fill='url(#chart-fill)'
                        />
                    </svg>
                </div>

                {/* ── Navbar ── */}
                <nav className='ce2-nav'>
                    <div className='ce2-nav__brand'>
                        <img src='/capital-edge-logo-dark.png' alt='' className='ce2-nav__logo' />
                        <span className='ce2-nav__name'>
                            <span className='ce2-nav__cap'>Capital</span>
                            <span className='ce2-nav__edge'> Edge</span>
                        </span>
                    </div>
                    <button className='ce2-btn-login' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce2-spinner' /> : 'Login Now →'}
                    </button>
                </nav>

                {/* ── Hero ── */}
                <section className='ce2-hero'>
                    <div className='ce2-trust-badge'>
                        <span>⚡</span> Trusted by 50,000+ Traders Worldwide
                    </div>

                    <h1 className='ce2-hero__title'>
                        <span className='ce2-grad'>Capital Edge</span>
                    </h1>
                    <p className='ce2-hero__sub'>The Future of Automated Trading</p>
                    <p className='ce2-hero__desc'>
                        Harness the power of AI-driven bots, real-time analytics, and copy trading to
                        maximize your profits. Join the revolution today.
                    </p>

                    <button className='ce2-btn-cta' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce2-spinner' /> : 'Start Trading Now →'}
                    </button>

                    <div className='ce2-hero__checks'>
                        <span>✓ No Credit Card Required</span>
                        <span>✓ $10,000 Virtual Account</span>
                    </div>

                    {/* Stats grid */}
                    <div className='ce2-stats'>
                        {STATS.map(s => (
                            <div className='ce2-stat' key={s.label}>
                                <span className='ce2-stat__val'>{s.value}</span>
                                <span className='ce2-stat__lbl'>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Features ── */}
                <section className='ce2-section'>
                    <h2 className='ce2-section__title'>Why Traders Choose <span className='ce2-grad'>Capital Edge</span></h2>
                    <div className='ce2-feats'>
                        {[
                            { icon: '🤖', t: 'AI Trading Bots',       d: 'Deploy intelligent bots 24/7. No coding required.' },
                            { icon: '📊', t: 'Signal Analyzer',        d: 'Live tick analysis with strategy-grade signals.' },
                            { icon: '🔗', t: 'Copy Trading',           d: 'Mirror top traders automatically in real time.' },
                            { icon: '⚡', t: 'Lightning Execution',    d: 'Under 50ms trade execution across all markets.' },
                        ].map(f => (
                            <div className='ce2-feat' key={f.t}>
                                <span className='ce2-feat__icon'>{f.icon}</span>
                                <strong>{f.t}</strong>
                                <p>{f.d}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA banner ── */}
                <div className='ce2-cta-band'>
                    <h2>Ready to Transform Your Trading?</h2>
                    <p>Join 50,000+ traders already profiting with Capital Edge.</p>
                    <button className='ce2-btn-cta' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce2-spinner' /> : 'Start Free Trial →'}
                    </button>
                    <div className='ce2-cta-checks'>
                        <span>✓ No Credit Card</span>
                        <span>✓ $10K Virtual</span>
                        <span>✓ Full Access</span>
                    </div>
                </div>

                {/* ── Disclaimer ── */}
                <div className='ce2-disclaimer'>
                    <strong>⚠ Risk Disclaimer:</strong> Trading derivatives involves significant risk of loss.
                    Only trade with funds you can afford to lose. Past performance is not indicative of future results.
                </div>

                {/* ── Footer ── */}
                <footer className='ce2-footer'>
                    <span>© {new Date().getFullYear()} Capital Edge. All rights reserved.</span>
                    <span>Powered by Deriv</span>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
