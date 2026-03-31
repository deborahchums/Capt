import { useEffect, useState } from 'react';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';

const CallbackPage = () => {
    const [status, setStatus] = useState('Processing login...');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const params = new URLSearchParams(window.location.search);

            const accountsList: Record<string, string> = {};
            const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

            let i = 1;
            while (params.get(`acct${i}`) && params.get(`token${i}`)) {
                const loginid = params.get(`acct${i}`) as string;
                const token = params.get(`token${i}`) as string;
                const currency = params.get(`cur${i}`) || '';
                accountsList[loginid] = token;
                clientAccounts[loginid] = { loginid, token, currency };
                i++;
            }

            if (Object.keys(accountsList).length === 0) {
                setError('No account tokens received. Please try logging in again.');
                return;
            }

            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

            const firstLoginId = Object.keys(accountsList)[0];
            const firstToken = accountsList[firstLoginId];

            setStatus('Authorizing account...');

            try {
                const api = await generateDerivApiInstance();
                if (api) {
                    const { authorize, error: authError } = await api.authorize(firstToken);
                    api.disconnect();

                    if (authError) {
                        localStorage.setItem('authToken', firstToken);
                        localStorage.setItem('active_loginid', firstLoginId);
                    } else {
                        const accountList = authorize?.account_list || [];
                        const firstAccount = accountList[0];
                        if (firstAccount) {
                            const matchedId = firstAccount.loginid;
                            const matchedToken = accountsList[matchedId] || firstToken;
                            localStorage.setItem('authToken', matchedToken);
                            localStorage.setItem('active_loginid', matchedId);
                        } else {
                            localStorage.setItem('authToken', firstToken);
                            localStorage.setItem('active_loginid', firstLoginId);
                        }
                    }
                } else {
                    localStorage.setItem('authToken', firstToken);
                    localStorage.setItem('active_loginid', firstLoginId);
                }
            } catch {
                localStorage.setItem('authToken', firstToken);
                localStorage.setItem('active_loginid', firstLoginId);
            }

            const isDemo = firstLoginId.startsWith('VR') || firstLoginId.startsWith('VRW');
            const account = isDemo ? 'demo' : (clientAccounts[firstLoginId]?.currency || 'USD');

            setStatus('Login successful! Redirecting...');
            window.location.replace(`${window.location.origin}/?account=${account}`);
        };

        handleOAuthCallback();
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
