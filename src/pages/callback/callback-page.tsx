import React from 'react';
import Cookies from 'js-cookie';
import { crypto_currencies_display_order, fiat_currencies_display_order } from '@/components/shared';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { observer as globalObserver } from '@/external/bot-skeleton/utils/observer';
import useTMB from '@/hooks/useTMB';
import { clearAuthData } from '@/utils/auth-utils';
import { Callback } from '@deriv-com/auth-client';
import { Button } from '@deriv-com/ui';

const validCurrencies = [...fiat_currencies_display_order, ...crypto_currencies_display_order];

const getSelectedCurrency = (
    tokens: Record<string, string>,
    clientAccounts: Record<string, { loginid: string; token: string; currency: string }>,
    state: { account?: string } | null
): string => {
    const queryParams = new URLSearchParams(window.location.search);
    const currency =
        state?.account ||
        queryParams.get('account') ||
        sessionStorage.getItem('query_param_currency') ||
        '';
    if (tokens.acct1?.startsWith('VR') || currency === 'demo') return 'demo';
    if (currency && validCurrencies.includes(currency.toUpperCase())) return currency;
    return clientAccounts[tokens.acct1]?.currency || 'USD';
};

const buildAccountMaps = (tokens: Record<string, string>) => {
    const accountsList: Record<string, string> = {};
    const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

    for (const [key, value] of Object.entries(tokens)) {
        if (key.startsWith('acct')) {
            const tokenKey = key.replace('acct', 'token');
            const curKey = key.replace('acct', 'cur');
            if (tokens[tokenKey]) {
                accountsList[value] = tokens[tokenKey];
                clientAccounts[value] = {
                    loginid: value,
                    token: tokens[tokenKey],
                    currency: tokens[curKey] || '',
                };
            }
        }
    }
    return { accountsList, clientAccounts };
};

const authorizeAndStore = async (
    tokens: Record<string, string>,
    clientAccounts: Record<string, { loginid: string; token: string; currency: string }>,
    is_tmb_enabled: boolean
) => {
    let is_token_set = false;
    try {
        const api = await generateDerivApiInstance();
        if (api) {
            const { authorize, error } = await api.authorize(tokens.token1);
            api.disconnect();
            if (error) {
                if (error.code === 'InvalidToken') {
                    is_token_set = true;
                    if (Cookies.get('logged_state') === 'true' && !is_tmb_enabled) {
                        globalObserver.emit('InvalidToken', { error });
                    }
                    if (Cookies.get('logged_state') === 'false') {
                        clearAuthData();
                    }
                }
            } else {
                localStorage.setItem('callback_token', authorize.toString());
                const firstId = authorize?.account_list[0]?.loginid;
                const matched = Object.values(clientAccounts).find(a => a.loginid === firstId);
                if (matched) {
                    localStorage.setItem('authToken', matched.token);
                    localStorage.setItem('active_loginid', matched.loginid);
                    is_token_set = true;
                }
            }
        }
    } catch (e) {
        console.error('[Capital Edge] API authorize failed:', e);
    }
    if (!is_token_set) {
        localStorage.setItem('authToken', tokens.token1);
        localStorage.setItem('active_loginid', tokens.acct1);
    }
};

const LegacyOAuthCallback = ({ is_tmb_enabled }: { is_tmb_enabled: boolean }) => {
    const [status, setStatus] = React.useState<'loading' | 'error'>('loading');

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokens: Record<string, string> = {};
        params.forEach((value, key) => { tokens[key] = value; });

        const { accountsList, clientAccounts } = buildAccountMaps(tokens);
        localStorage.setItem('accountsList', JSON.stringify(accountsList));
        localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

        authorizeAndStore(tokens, clientAccounts, is_tmb_enabled)
            .then(() => {
                Cookies.set('logged_state', 'true', { expires: 30, path: '/' });
                const currency = getSelectedCurrency(tokens, clientAccounts, null);
                window.location.replace(window.location.origin + `/?account=${currency}`);
            })
            .catch(err => {
                console.error('[Capital Edge] Legacy OAuth processing failed:', err);
                setStatus('error');
            });
    }, [is_tmb_enabled]);

    if (status === 'error') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
                <p style={{ fontSize: '18px', color: '#e02020' }}>Login failed. Please try again.</p>
                <Button onClick={() => { window.location.href = '/'; }}>Return to Capital Edge</Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', flexDirection: 'column' }}>
            <p style={{ fontSize: '24px', color: '#d4af37', fontWeight: 'bold' }}>Capital Edge</p>
            <p style={{ fontSize: '16px', color: '#ffffff' }}>Logging you in…</p>
        </div>
    );
};

const CallbackPage = () => {
    const { is_tmb_enabled = false } = useTMB();

    const handleSignInError = React.useCallback((error: Error) => {
        console.error('[Capital Edge] OIDC callback error:', error?.message, error);
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error');
        const oauthDesc = params.get('error_description');
        if (oauthError) {
            console.error('[Capital Edge] OAuth error from Deriv:', oauthError, oauthDesc);
        }
        Object.keys(sessionStorage)
            .filter(k => k.startsWith('oidc.'))
            .forEach(k => sessionStorage.removeItem(k));
    }, []);

    const handleSignInSuccess = React.useCallback(async (tokens: Record<string, string>, rawState: unknown) => {
        const state = rawState as { account?: string } | null;
        const { accountsList, clientAccounts } = buildAccountMaps(tokens);
        localStorage.setItem('accountsList', JSON.stringify(accountsList));
        localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));
        await authorizeAndStore(tokens, clientAccounts, is_tmb_enabled);
        const currency = getSelectedCurrency(tokens, clientAccounts, state);
        window.location.replace(window.location.origin + `/?account=${currency}`);
    }, [is_tmb_enabled]);

    const params = new URLSearchParams(window.location.search);
    const isLegacyOAuth = params.has('acct1') && params.has('token1');

    if (isLegacyOAuth) {
        return <LegacyOAuthCallback is_tmb_enabled={is_tmb_enabled} />;
    }

    return (
        <Callback
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
            renderReturnButton={() => (
                <Button
                    className='callback-return-button'
                    onClick={() => {
                        Object.keys(sessionStorage)
                            .filter(k => k.startsWith('oidc.'))
                            .forEach(k => sessionStorage.removeItem(k));
                        localStorage.removeItem('config.oidc_endpoints');
                        window.location.href = '/';
                    }}
                >
                    Return to Capital Edge
                </Button>
            )}
        />
    );
};

export default CallbackPage;
