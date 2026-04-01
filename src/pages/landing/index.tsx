import React, { useEffect, useState } from 'react';
import { generateOAuthURL } from '@/components/shared';
import { clearAuthData, handleOidcAuthFailure } from '@/utils/auth-utils';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import './landing.scss';

const LOGO_SVG = (
    <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='40' height='40' rx='10' fill='#0a0f1e' />
        <polygon points='20,4 36,14 36,26 20,36 4,26 4,14' fill='none' stroke='#d4af37' strokeWidth='2' />
        <polygon points='20,10 30,16 30,24 20,30 10,24 10,16' fill='#d4af37' opacity='0.25' />
        <polygon points='20,14 26,18 26,22 20,26 14,22 14,18' fill='#d4af37' />
    </svg>
);

const FEATURES = [
    { icon: '🤖', label: 'AI Bots', desc: 'Smart automation' },
    { icon: '📊', label: 'Analysis Tool', desc: 'Deep insights' },
    { icon: '👥', label: 'Copy Trading', desc: 'Follow experts' },
    { icon: '⚡', label: 'Speed Bot', desc: 'Lightning fast' },
];

const FEATURE_CARDS = [
    {
        icon: '🤖',
        subtitle: 'Automation',
        title: 'AI-Powered Trading Bots',
        desc: 'Deploy intelligent trading strategies with our advanced bot system. No coding required — just configure and let the bots work for you 24/7.',
    },
    {
        icon: '📊',
        subtitle: 'Analytics',
        title: 'Real-Time Market Analysis',
        desc: 'Access professional-grade charts, indicators, and analytics. Track market trends, identify opportunities, and execute with confidence.',
    },
    {
        icon: '👥',
        subtitle: 'Social Trading',
        title: 'Copy Trading Network',
        desc: 'Mirror successful traders automatically. Transparent performance metrics, full control over your capital, and instant execution.',
    },
    {
        icon: '🛡️',
        subtitle: 'Risk Control',
        title: 'Risk Management Tools',
        desc: 'Advanced stop-loss, take-profit, and position sizing tools. Set your risk parameters and trade with complete peace of mind.',
    },
];

const TESTIMONIALS = [
    {
        quote: 'Capital Edge transformed my trading. The automated bots handle my strategies flawlessly, and I\'ve seen consistent profits. The platform is intuitive and powerful.',
        name: 'Mark Gonzales',
        role: 'Professional Day Trader',
        avatar: 'https://www.dbtraders.com/reviews/positive-human-emotions-expressions-feelings-attitude.jpg',
    },
    {
        quote: 'Copy trading feature is incredible! I follow top performers and my portfolio has grown 40% in 3 months. The transparency and control are unmatched.',
        name: 'Kelvin Maxwell',
        role: 'Crypto Investor',
        avatar: 'https://www.dbtraders.com/reviews/young-african-american-woman-wearing-casual-clothes-pointing-fingers-camera-with-happy-funny-face-good-energy-vibes.jpg',
    },
    {
        quote: 'Lightning-fast execution and professional-grade tools. The risk management features saved me from major losses. This is the future of trading.',
        name: 'Delvoux Glen',
        role: 'Forex Specialist',
        avatar: 'https://www.dbtraders.com/reviews/awesome-well-done-pleased-satisfied-supportive-female-dark-skinned-friend-wearing-striped-blouse-smiling-affirmative-showing-thumb-up-like-approve-your-idea-grinning-satisfied-white-wall.jpg',
    },
];

const BENEFITS = [
    { icon: '🔒', title: 'Bank-grade security', desc: 'Encrypted sessions and secure authentication' },
    { icon: '⚡', title: 'Lightning-fast execution', desc: 'Under 50ms trade execution speed' },
    { icon: '🎮', title: 'Virtual account', desc: 'Risk-free testing with $10,000 virtual funds' },
    { icon: '📱', title: 'Mobile-friendly', desc: 'Trade seamlessly on any device, anywhere' },
    { icon: '💼', title: 'Multi-asset trading', desc: 'Forex, crypto, indices and more' },
    { icon: '🕐', title: '24/7 availability', desc: 'Markets and support around the clock' },
];

const LandingPage = () => {
    const [loading, setLoading] = useState(true);
    const [loggingIn, setLoggingIn] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async () => {
        if (loggingIn) return;
        setLoggingIn(true);
        clearAuthData(false);
        const currency = sessionStorage.getItem('query_param_currency') || 'USD';
        try {
            await requestOidcAuthentication({
                redirectCallbackUri: `${window.location.origin}/callback`,
                state: { account: currency },
            });
        } catch {
            try {
                handleOidcAuthFailure(new Error('OIDC failed'));
            } catch {
                // ignore
            }
            window.location.replace(generateOAuthURL());
        }
    };

    return (
        <div className='ce-landing'>
            {/* Loading overlay */}
            <div className={`ce-loading${loading ? '' : ' ce-loading--hidden'}`}>
                <div className='ce-loading__logo'>
                    {LOGO_SVG}
                    <span className='ce-loading__brand'>Capital Edge</span>
                </div>
                <p className='ce-loading__text'>Loading Trading Engine...</p>
                <div className='ce-loading__bar'>
                    <div className='ce-loading__bar-fill' />
                </div>
                <div className='ce-loading__features'>
                    {FEATURES.map(f => (
                        <div className='ce-loading__feat' key={f.label}>
                            <div className='ce-loading__feat-icon'>{f.icon}</div>
                            <span>{f.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navbar */}
            <nav className='ce-nav'>
                <div className='ce-nav__logo'>
                    {LOGO_SVG}
                    <div className='ce-nav__logo-text'>
                        <span className='ce-nav__brand'>Capital Edge</span>
                        <span className='ce-nav__tagline'>built for traders</span>
                    </div>
                </div>
                <div className='ce-nav__actions'>
                    <button className='ce-btn-primary' onClick={handleLogin} disabled={loggingIn}>
                        {loggingIn ? <span className='ce-spinner' /> : 'Log In'}
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className='ce-hero'>
                <div className='ce-hero__grid' />
                <div className='ce-hero__badge'>
                    <span className='ce-hero__badge-dot' />
                    Trusted by 50,000+ Traders Worldwide
                </div>
                <h1 className='ce-hero__headline'>
                    Trade Smarter.{' '}
                    <span className='ce-hero__headline-gold'>Execute Faster.</span>
                </h1>
                <p className='ce-hero__sub'>
                    Harness the power of AI-driven bots, real-time analytics, and copy trading to
                    maximise your profits. Join the revolution today.
                </p>
                <div className='ce-hero__ctas'>
                    <button
                        className='ce-hero__cta-primary'
                        onClick={handleLogin}
                        disabled={loggingIn}
                    >
                        {loggingIn ? <span className='ce-spinner' /> : '▶ Start Trading Now'}
                    </button>
                    <button className='ce-hero__cta-secondary' onClick={handleLogin}>
                        View Demo Account
                    </button>
                </div>
                <p className='ce-hero__note'>No Credit Card Required &nbsp;·&nbsp; $10,000 Virtual Account</p>
                <div className='ce-hero__features-row'>
                    {FEATURES.map(f => (
                        <div className='ce-hero__feat-pill' key={f.label}>
                            <span className='feat-icon'>{f.icon}</span>
                            <span>
                                <strong style={{ color: '#fff', marginRight: 4 }}>{f.label}</strong>
                                {f.desc}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <div className='ce-stats'>
                <div className='ce-stats__inner'>
                    <div className='ce-stat'>
                        <span className='ce-stat__num'>50K+</span>
                        <span className='ce-stat__label'>Active Traders</span>
                    </div>
                    <div className='ce-stat'>
                        <span className='ce-stat__num'>$2.5B+</span>
                        <span className='ce-stat__label'>Trading Volume</span>
                    </div>
                    <div className='ce-stat'>
                        <span className='ce-stat__num'>99.9%</span>
                        <span className='ce-stat__label'>Uptime</span>
                    </div>
                    <div className='ce-stat'>
                        <span className='ce-stat__num'>150+</span>
                        <span className='ce-stat__label'>Trading Pairs</span>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className='ce-section'>
                <div className='ce-section__header'>
                    <span className='ce-section__tag'>Platform Features</span>
                    <h2>Powerful Features for Modern Traders</h2>
                    <p>Everything you need to succeed in today's fast-paced markets</p>
                </div>
                <div className='ce-features-grid'>
                    {FEATURE_CARDS.map(f => (
                        <div className='ce-feat-card' key={f.title}>
                            <div className='ce-feat-card__icon'>{f.icon}</div>
                            <div className='ce-feat-card__subtitle'>{f.subtitle}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className='ce-section ce-testimonials'>
                <div className='ce-section__header'>
                    <span className='ce-section__tag'>Testimonials</span>
                    <h2>Trusted by Traders Worldwide</h2>
                    <p>Join thousands of successful traders who have transformed their trading with Capital Edge</p>
                </div>
                <div className='ce-testimonials-grid'>
                    {TESTIMONIALS.map(t => (
                        <div className='ce-testi-card' key={t.name}>
                            <div className='ce-testi-card__stars'>★★★★★</div>
                            <p className='ce-testi-card__quote'>"{t.quote}"</p>
                            <div className='ce-testi-card__author'>
                                <img
                                    className='ce-testi-card__avatar'
                                    src={t.avatar}
                                    alt={t.name}
                                    onError={e => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <div>
                                    <div className='ce-testi-card__name'>{t.name}</div>
                                    <div className='ce-testi-card__role'>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Choose */}
            <section className='ce-section ce-why'>
                <div className='ce-why__inner'>
                    <div className='ce-why__left'>
                        <h2>
                            Why Choose <span>Capital Edge</span>?
                        </h2>
                        <p>
                            We've built the platform that professional traders wish they always had —
                            fast, intelligent, and completely under your control.
                        </p>
                        <button className='ce-why__cta' onClick={handleLogin} disabled={loggingIn}>
                            {loggingIn ? <span className='ce-spinner' /> : 'Get Started Free →'}
                        </button>
                    </div>
                    <div className='ce-why__benefits'>
                        {BENEFITS.map(b => (
                            <div className='ce-why__benefit' key={b.title}>
                                <span className='ce-why__benefit-icon'>{b.icon}</span>
                                <div className='ce-why__benefit-text'>
                                    <strong>{b.title}</strong>
                                    {b.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <div className='ce-cta-banner'>
                <div className='ce-cta-banner__inner'>
                    <h2>Ready to Transform Your Trading?</h2>
                    <p>
                        Join 50,000+ traders who are already profiting with Capital Edge. Start
                        with a free virtual account today.
                    </p>
                    <div className='ce-cta-banner__btns'>
                        <button className='ce-hero__cta-primary' onClick={handleLogin} disabled={loggingIn}>
                            {loggingIn ? <span className='ce-spinner' /> : 'Start Free Trial'}
                        </button>
                    </div>
                    <div className='ce-cta-banner__trust'>
                        <span>✓ No Credit Card</span>
                        <span>✓ $10K Virtual Money</span>
                        <span>✓ Full Platform Access</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className='ce-footer'>
                <span>© {new Date().getFullYear()} Capital Edge. All rights reserved.</span>
                <span>·</span>
                <span>Powered by Deriv</span>
            </footer>
        </div>
    );
};

export default LandingPage;
