import { useEffect, useState } from 'react';
import './chunk-loader.scss';

const FEATURES = [
    { icon: '🤖', title: 'AI Bots', sub: 'Smart automation' },
    { icon: '📊', title: 'Analysis Tool', sub: 'Deep insights' },
    { icon: '🔗', title: 'Copy Trading', sub: 'Follow experts' },
    { icon: '⚡', title: 'Speed Bot', sub: 'Lightning fast' },
];

const STARS = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    opacity: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 3,
}));

export default function ChunkLoader({ message }: { message: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Count to 99 in ~1.2s, then hold while the app finishes connecting
        let current = 0;
        const t = setInterval(() => {
            // Fast ramp up to 80, then slow down as it approaches 99
            const remaining = 99 - current;
            const increment = current < 80 ? 4 : remaining > 2 ? 1 : 0;
            current = Math.min(current + increment, 99);
            setCount(current);
        }, 40);
        return () => clearInterval(t);
    }, []);

    const circumference = 2 * Math.PI * 54;
    const progress = (count / 100) * circumference;

    return (
        <div className='ce-loader'>
            {STARS.map(s => (
                <div
                    key={s.id}
                    className='ce-loader__star'
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        opacity: s.opacity,
                        animationDelay: `${s.delay}s`,
                    }}
                />
            ))}

            <div className='ce-loader__ring-wrap'>
                <svg width='130' height='130' viewBox='0 0 130 130'>
                    <circle cx='65' cy='65' r='54' fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='8' />
                    <circle
                        cx='65'
                        cy='65'
                        r='54'
                        fill='none'
                        stroke='url(#ringGrad)'
                        strokeWidth='8'
                        strokeLinecap='round'
                        strokeDasharray={`${progress} ${circumference}`}
                        transform='rotate(-90 65 65)'
                    />
                    <defs>
                        <linearGradient id='ringGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                            <stop offset='0%' stopColor='#ff3cac' />
                            <stop offset='40%' stopColor='#784ba0' />
                            <stop offset='80%' stopColor='#2b86c5' />
                            <stop offset='100%' stopColor='#00e5b0' />
                        </linearGradient>
                    </defs>
                </svg>
                <div className='ce-loader__count-wrap'>
                    <span className='ce-loader__count'>{count}</span>
                    <span className='ce-loader__loading-label'>LOADING</span>
                </div>
            </div>

            <div className='ce-loader__brand'>
                <span className='ce-loader__brand-main'>Capital</span>
                <span className='ce-loader__brand-accent'>Edge</span>
            </div>

            <div className='ce-loader__tagline'>
                <span className='ce-loader__tag-white'>TRADE SMARTER.</span>
                <span className='ce-loader__tag-cyan'>&nbsp;EXECUTE FASTER.</span>
            </div>

            <div className='ce-loader__status'>
                <span className='ce-loader__bolt'>⚡</span>
                <span>{message || 'Connecting to Volatility Markets...'}</span>
                <span className='ce-loader__dots'>
                    <span />
                    <span />
                    <span />
                </span>
            </div>

            <div className='ce-loader__pills'>
                {FEATURES.map(f => (
                    <div key={f.title} className='ce-loader__pill'>
                        <span className='ce-loader__pill-icon'>{f.icon}</span>
                        <div className='ce-loader__pill-text'>
                            <span className='ce-loader__pill-title'>{f.title}</span>
                            <span className='ce-loader__pill-sub'>{f.sub}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
