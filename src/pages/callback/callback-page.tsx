import React from 'react';
import Cookies from 'js-cookie';
import { crypto_currencies_display_order, fiat_currencies_display_order } from '@/components/shared';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { observer as globalObserver } from '@/external/bot-skeleton/utils/observer';
import useTMB from '@/hooks/useTMB';
import { clearAuthData } from '@/utils/auth-utils';
import { Callback } from '@deriv-com/auth-client';
import { Button } from '@deriv-com/ui';

const getSelectedCurrency = (
    tokens: Record<string, string>,
    clientAccounts: Record<string, any>,
    state: any
): string => {
    const getQueryParams = new URLSearchParams(window.location.search);
    const currency =
        (state && state?.account) ||
        getQueryParams.get('account') ||
        sessionStorage.getItem('query_param_currency') ||
        '';
    const firstAccountKey = tokens.acct1;
    const firstAccountCurrency = clientAccounts[firstAccountKey]?.currency;

    const validCurrencies = [...fiat_currencies_display_order, ...crypto_currencies_display_order];
    if (tokens.acct1?.startsWith('VR') || currency === 'demo') return 'demo';
    if (currency && validCurrencies.includes(currency.toUpperCase())) return currency;
    return firstAccountCurrency || 'USD';
};

const CallbackPage = () => {
    const { is_tmb_enabled = false } = useTMB();

    const handleSignInError = React.useCallback((error: Error) => {
        // Log the real error for debugging
        console.error('[Capital Edge] OIDC callback error:', error?.message, error);

        // Check URL for OAuth error params Deriv may have sent back
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('error');
        const oauthDesc  = params.get('error_description');
        if (oauthError) {
            console.error('[Capital Edge] OAuth error from Deriv:', oauthError, oauthDesc);
        }

        // Clear any stale OIDC session storage so the next login attempt starts fresh
        Object.keys(sessionStorage)
            .filter(k => k.startsWith('oidc.'))
            .forEach(k => sessionStorage.removeItem(k));
    }, []);

    return (
        <Callback
            onSignInSuccess={async (tokens: Record<string, string>, rawState: unknown) => {
                const state = rawState as { account?: string } | null;
                const accountsList: Record<string, string> = {};
                const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

                for (const [key, value] of Object.entries(tokens)) {
                    if (key.startsWith('acct')) {
                        const tokenKey = key.replace('acct', 'token');
                        if (tokens[tokenKey]) {
                            accountsList[value] = tokens[tokenKey];
                            clientAccounts[value] = {
                                loginid: value,
                                token: tokens[tokenKey],
                                currency: '',
                            };
                        }
                    } else if (key.startsWith('cur')) {
                        const accKey = key.replace('cur', 'acct');
                        if (tokens[accKey]) {
                            clientAccounts[tokens[accKey]].currency = value;
                        }
                    }
                }

                localStorage.setItem('accountsList', JSON.stringify(accountsList));
                localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

                let is_token_set = false;

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
                        const clientAccountsArray = Object.values(clientAccounts);
                        const firstId = authorize?.account_list[0]?.loginid;
                        const filteredTokens = clientAccountsArray.filter(account => account.loginid === firstId);
                        if (filteredTokens.length) {
                            localStorage.setItem('authToken', filteredTokens[0].token);
                            localStorage.setItem('active_loginid', filteredTokens[0].loginid);
                            is_token_set = true;
                        }
                    }
                }
                if (!is_token_set) {
                    localStorage.setItem('authToken', tokens.token1);
                    localStorage.setItem('active_loginid', tokens.acct1);
                }
                const selected_currency = getSelectedCurrency(tokens, clientAccounts, state);
                window.location.replace(window.location.origin + `/?account=${selected_currency}`);
            }}
            onSignInError={handleSignInError}
            renderReturnButton={() => {
                return (
                    <Button
                        className='callback-return-button'
                        onClick={() => {
                            // Clear stale OIDC state before going back so next login is clean
                            Object.keys(sessionStorage)
                                .filter(k => k.startsWith('oidc.'))
                                .forEach(k => sessionStorage.removeItem(k));
                            localStorage.removeItem('config.oidc_endpoints');
                            window.location.href = '/';
                        }}
                    >
                        {'Return to Capital Edge'}
                    </Button>
                );
            }}
        />
    );
};

export default CallbackPage;
