import React, { useEffect, useRef, useState } from 'react';
import { generateOAuthURL } from '@/components/shared';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import './landing.scss';

/* ---- Data ---- */
const LOADING_MESSAGES = [
    'Initializing platform...',
    'Connecting to markets...',
    'Loading your dashboard...',
    'Syncing trade data...',
    'Fetching live prices...',
    'Almost ready...',
];

const LOGO_IMG = (
    <img src='/capital-edge-logo.png' alt='Capital Edge' style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
);

const STATS = [
    { end: 50000, suffix: 'K+', divisor: 1000, label: 'Active Traders' },
    { end: 2.5, suffix: 'B+', divisor: 1, label: 'Trading Volume', prefix: '$' },
    { end: 99.9, suffix: '%', divisor: 1, label: 'Uptime' },
    { end: 150, suffix: '+', divisor: 1, label: 'Trading Pairs' },
];

const FEATURE_CARDS = [
    { icon: '🤖', sub: 'Automation', title: 'AI-Powered Trading Bots', desc: 'Deploy intelligent strategies with our advanced bot system. No coding required — configure, backtest, and let bots work 24/7.' },
    { icon: '📊', sub: 'Analytics', title: 'Real-Time Market Analysis', desc: 'Professional-grade charts, indicators, and analytics. Track market trends, identify opportunities, and execute with confidence.' },
    { icon: '👥', sub: 'Social Trading', title: 'Copy Trading Network', desc: 'Mirror top traders automatically. Transparent performance metrics, full capital control, and instant execution.' },
    { icon: '🛡️', sub: 'Risk Control', title: 'Risk Management Tools', desc: 'Advanced stop-loss, take-profit, and position-sizing tools. Set your parameters and trade with complete peace of mind.' },
];

const TESTIMONIALS = [
    { quote: 'Capital Edge transformed my trading. The automated bots handle my strategies flawlessly, and I\'ve seen consistent profits. Intuitive and powerful.', name: 'Mark Gonzales', role: 'Professional Day Trader', avatar: 'https://www.dbtraders.com/reviews/positive-human-emotions-expressions-feelings-attitude.jpg' },
    { quote: 'The copy trading feature is incredible! I follow top performers and my portfolio grew 40% in 3 months. The transparency and control are unmatched.', name: 'Kelvin Maxwell', role: 'Crypto Investor', avatar: 'https://www.dbtraders.com/reviews/young-african-american-woman-wearing-casual-clothes-pointing-fingers-camera-with-happy-funny-face-good-energy-vibes.jpg' },
    { quote: 'Lightning-fast execution and professional tools. Risk management features saved me from major losses. This is the future of trading.', name: 'Delvoux Glen', role: 'Forex Specialist', avatar: 'https://www.dbtraders.com/reviews/awesome-well-done-pleased-satisfied-supportive-female-dark-skinned-friend-wearing-striped-blouse-smiling-affirmative-showing-thumb-up-like-approve-your-idea-grinning-satisfied-white-wall.jpg' },
];

const BENEFITS = [
    { icon: '🔒', title: 'Bank-grade security', desc: 'Encrypted sessions and secure authentication' },
    { icon: '⚡', title: 'Lightning-fast execution', desc: 'Under 50ms trade execution speed' },
    { icon: '🎮', title: 'Virtual account', desc: 'Risk-free testing with $10,000 virtual funds' },
    { icon: '📱', title: 'Mobile-friendly', desc: 'Trade seamlessly on any device, anywhere' },
    { icon: '💼', title: 'Multi-asset trading', desc: 'Forex, crypto, indices and more' },
    { icon: '🕐', title: '24/7 availability', desc: 'Markets and support around the clock' },
];

/* ---- Animated counter hook ---- */
function useCountUp(end: number, duration = 1800, started = false) {
    const [value, setValue] = useState(0);
    const raf = useRef<number | null>(null);

    useEffect(() => {
        if (!started) return;
        const startTime = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(end * eased);
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    }, [end, duration, started]);

    return value;
}

/* ---- Single stat counter ---- */
function StatCounter({ stat, started }: { stat: typeof STATS[0]; started: boolean }) {
    const raw = useCountUp(stat.end, 1800, started);
    const display = stat.divisor > 1
        ? Math.floor(raw / stat.divisor).toLocaleString()
        : stat.end < 10
            ? raw.toFixed(1)
            : Math.floor(raw).toLocaleString();

    return (
        <div>
            <div className='ce-stat__num'>
                {stat.prefix || ''}{display}{stat.suffix}
            </div>
            <div className='ce-stat__label'>{stat.label}</div>
        </div>
    );
}

/* ---- Main component ---- */
const LandingPage = () => {
    const [loadingHidden, setLoadingHidden] = useState(false);
    const [msgIdx, setMsgIdx] = useState(0);
    const [msgVisible, setMsgVisible] = useState(true);
    const [statsStarted, setStatsStarted] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const statsRef = useRef<HTMLDivElement | null>(null);

    /* Loading screen: cycle messages then hide */
    useEffect(() => {
        let msgTimer: ReturnType<typeof setInterval>;
        const msgCycle = () => {
            msgTimer = setInterval(() => {
                setMsgVisible(false);
                setTimeout(() => {
                    setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
                    setMsgVisible(true);
                }, 280);
            }, 600);
        };
        msgCycle();

        const hideTimer = setTimeout(() => {
            clearInterval(msgTimer);
            setLoadingHidden(true);
        }, 3200);

        return () => { clearInterval(msgTimer); clearTimeout(hideTimer); };
    }, []);

    /* Stats counter: trigger when visible */
    useEffect(() => {
        if (!statsRef.current) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setStatsStarted(true); obs.disconnect(); }
        }, { threshold: 0.3 });
        obs.observe(statsRef.current);
        return () => obs.disconnect();
    }, [loadingHidden]);

    const handleLogin = async () => {
        if (loggingIn) return;
        setLoggingIn(true);
        try {
            // Try OIDC first — this redirects the browser; the await never resolves on success
            await requestOidcAuthentication({
                redirectCallbackUri: `${window.location.origin}/callback`,
            });
        } catch {
            // OIDC failed or not configured — fall back to legacy Deriv OAuth
        }
        // Fallback: redirect to legacy OAuth (generateOAuthURL now includes explicit redirect_uri)
        window.location.href = generateOAuthURL();
    };

    return (
        <div className='ce-landing'>

            {/* ===== LOADING SCREEN ===== */}
            <div className={`ce-loading${loadingHidden ? ' ce-loading--hidden' : ''}`}>
                <div className='ce-loading__brand'>
                    <div className='ce-loading__logo-row'>
                        {LOGO_IMG}
                        <div className='ce-loading__name'>
                            <span className='ce-loading__name-cap'>Capital</span>
                            <span className='ce-loading__name-edge'> Edge</span>
                        </div>
                    </div>
                    <div className='ce-loading__tagline'>built for traders</div>
                </div>

                {/* Animated candlestick bars */}
                <div className='ce-loading__bars'>
                    {[0,1,2,3,4,5,6].map(i => <div key={i} className='ce-loading__bar' />)}
                </div>

                {/* Progress bar */}
                <div className='ce-loading__track'>
                    <div className='ce-loading__fill' />
                </div>

                {/* Cycling status */}
                <div className='ce-loading__status' style={{ opacity: msgVisible ? 1 : 0 }}>
                    {LOADING_MESSAGES[msgIdx]}
                </div>

                {/* Footer */}
                <div className='ce-loading__badges'>
                    <span>⚡ Powered by Deriv</span>
                    <span>🔒 Secure Connection</span>
                </div>
            </div>

            {/* ===== NAVBAR ===== */}
            <nav className='ce-nav'>
                <div className='ce-nav__logo'>
                    {LOGO_IMG}
                    <div>
                        <div className='ce-nav__name'>
                            <span className='green'>Capital</span> Edge
                        </div>
                        <span className='ce-nav__tag'>built for traders</span>
                    </div>
                </div>
                <button className='ce-btn-primary' onClick={handleLogin} disabled={loggingIn}>
                    {loggingIn ? <span className='ce-spinner' /> : 'Log In'}
                </button>
            </nav>

            {/* ===== HERO ===== */}
            <section className='ce-hero'>
                <div className='ce-hero__grid' />
                <div className='ce-hero__trust'>
                    <span className='dot' />
                    ⚡ Trusted by 50,000+ Traders Worldwide
                </div>
                <h1>
                    The Future of{' '}
                    <span className='gold'>Automated Trading</span>
                </h1>
                <p className='ce-hero__sub'>
                    Harness the power of AI-driven bots, real-time analytics, and copy trading to
                    maximise your profits. Join the revolution today.
                </p>
                <div className='ce-hero__ctas'>
                    <button className='ce-btn-cta' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce-spinner' /> : 'Start Trading Now →'}
                    </button>
                    <button className='ce-btn-ghost' onClick={handleLogin}>
                        View Demo Account
                    </button>
                </div>
                <p className='ce-hero__note'>
                    ✓ No Credit Card Required &nbsp;·&nbsp; ✓ $10,000 Virtual Account
                </p>
            </section>

            {/* ===== STATS ===== */}
            <div className='ce-stats' ref={statsRef}>
                <div className='ce-stats__inner'>
                    {STATS.map(s => (
                        <StatCounter key={s.label} stat={s} started={statsStarted} />
                    ))}
                </div>
            </div>

            {/* ===== FEATURES ===== */}
            <section className='ce-section'>
                <div className='ce-section__header'>
                    <span className='ce-tag'>Platform Features</span>
                    <h2>Powerful Features for Modern Traders</h2>
                    <p>Everything you need to succeed in today's fast-paced markets</p>
                </div>
                <div className='ce-features-grid'>
                    {FEATURE_CARDS.map(f => (
                        <div className='ce-feat-card' key={f.title}>
                            <div className='ce-feat-card__icon'>{f.icon}</div>
                            <div className='ce-feat-card__sub'>{f.sub}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className='ce-section ce-testimonials'>
                <div className='ce-section__header'>
                    <span className='ce-tag'>Testimonials</span>
                    <h2>Trusted by Traders Worldwide</h2>
                    <p>
                        <strong style={{ color: '#d4af37' }}>4.9</strong> average rating &nbsp;·&nbsp; 50,000+ traders
                    </p>
                </div>
                <div className='ce-testi-grid'>
                    {TESTIMONIALS.map(t => (
                        <div className='ce-testi-card' key={t.name}>
                            <div className='stars'>★★★★★</div>
                            <p className='quote'>"{t.quote}"</p>
                            <div className='author'>
                                <img src={t.avatar} alt={t.name} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <div className='author__name'>{t.name}</div>
                                    <div className='author__role'>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== WHY CHOOSE ===== */}
            <section className='ce-section ce-why'>
                <div className='ce-why__inner'>
                    <div>
                        <h2>Why Choose <span className='gold'>Capital Edge</span>?</h2>
                        <p>
                            We've built the platform that professional traders wish they always had —
                            fast, intelligent, and completely under your control.
                        </p>
                        <button className='ce-btn-cta' onClick={handleLogin} disabled={loggingIn}>
                            {loggingIn ? <span className='ce-spinner' /> : 'Get Started Free →'}
                        </button>
                    </div>
                    <div className='ce-why__list'>
                        {BENEFITS.map(b => (
                            <div className='ce-why__item' key={b.title}>
                                <span className='icon'>{b.icon}</span>
                                <div className='text'>
                                    <strong>{b.title}</strong>
                                    {b.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA BANNER ===== */}
            <div className='ce-cta-banner'>
                <div className='inner'>
                    <h2>Ready to Transform Your Trading?</h2>
                    <p>
                        Join 50,000+ traders already profiting with Capital Edge.
                        Start with a free virtual account today.
                    </p>
                    <button className='ce-btn-cta' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce-spinner' /> : 'Start Free Trial →'}
                    </button>
                    <div className='trust-row'>
                        <span>✓ No Credit Card</span>
                        <span>✓ $10K Virtual Money</span>
                        <span>✓ Full Platform Access</span>
                    </div>
                </div>
            </div>

            {/* ===== RISK DISCLAIMER ===== */}
            <div className='ce-disclaimer'>
                <div className='inner'>
                    <h4>⚠️ Risk Disclaimer</h4>
                    <p>
                        Deriv offers complex derivatives, such as options and contracts for difference ("CFDs").
                        These products may not be suitable for all clients, and trading them puts you at risk.
                        Please make sure that you understand the following risks before trading:
                    </p>
                    <ul>
                        <li>You may lose some or all of the money you invest in the trade.</li>
                        <li>If your trade involves currency conversion, exchange rates will affect your profit and loss.</li>
                        <li>You should never trade with borrowed money or with money that you cannot afford to lose.</li>
                    </ul>
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <footer className='ce-footer'>
                <span>© {new Date().getFullYear()} Capital Edge. All rights reserved.</span>
                <span>·</span>
                <span>Powered by Deriv</span>
            </footer>
        </div>
    );
};

export default LandingPage;
