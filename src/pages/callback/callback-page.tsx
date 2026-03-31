import { useEffect, useState } from 'react';

const CallbackPage = () => {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // Collect all acct/token/cur params from the URL
        const pairs: string[] = [];
        let i = 1;
        while (params.get(`acct${i}`) && params.get(`token${i}`)) {
            pairs.push(`acct${i}=${encodeURIComponent(params.get(`acct${i}`) as string)}`);
            pairs.push(`token${i}=${encodeURIComponent(params.get(`token${i}`) as string)}`);
            const cur = params.get(`cur${i}`);
            if (cur) pairs.push(`cur${i}=${encodeURIComponent(cur)}`);
            i++;
        }

        if (pairs.length === 0) {
            setError('No login tokens found. Please try again.');
            return;
        }

        setStatus('Login successful! Redirecting...');

        // Redirect to root with the OAuth params so AuthWrapper processes them normally
        window.location.replace(`${window.location.origin}/?${pairs.join('&')}`);
    }, []);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '16px',
                fontFamily: 'sans-serif',
                background: '#0a0f1e',
                color: '#fff',
            }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <h2>Login Error</h2>
                <p style={{ color: '#aaa', textAlign: 'center', maxWidth: '320px' }}>{error}</p>
                <button
                    onClick={() => { window.location.href = '/'; }}
                    style={{
                        background: '#d4af37',
                        color: '#0a0f1e',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Return to Capital Edge
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '16px',
            fontFamily: 'sans-serif',
            background: '#0a0f1e',
            color: '#fff',
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #1a2340',
                borderTop: '4px solid #d4af37',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#aaa' }}>{status}</p>
        </div>
    );
};

export default CallbackPage;
