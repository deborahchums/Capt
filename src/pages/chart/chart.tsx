import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';
import { useStore } from '@/hooks/useStore';
import {
    ActiveSymbolsRequest,
    ServerTimeRequest,
    TicksHistoryResponse,
    TicksStreamRequest,
    TradingTimesRequest,
} from '@deriv/api-types';
import { ChartTitle, SmartChart } from '@deriv/deriv-charts';
import { useDevice } from '@deriv-com/ui';
import ToolbarWidgets from './toolbar-widgets';
import '@deriv/deriv-charts/dist/smartcharts.css';

type TSubscription = {
    [key: string]: null | {
        unsubscribe?: () => void;
    };
};

type TError = null | {
    error?: {
        code?: string;
        message?: string;
    };
};

const subscriptions: TSubscription = {};

const Chart = observer(({ show_digits_stats }: { show_digits_stats: boolean }) => {
    const barriers: [] = [];
    const { common, ui } = useStore();
    const { chart_store, run_panel, dashboard } = useStore();
    const [isSafari, setIsSafari] = useState(false);
    const [isApiReady, setIsApiReady] = useState(!!chart_api.api);

    const {
        chart_type,
        getMarketsOrder,
        granularity,
        onSymbolChange,
        setChartStatus,
        symbol,
        updateChartType,
        updateGranularity,
        updateSymbol,
        setChartSubscriptionId,
        chart_subscription_id,
    } = chart_store;
    const chartSubscriptionIdRef = useRef(chart_subscription_id);
    const { isDesktop, isMobile } = useDevice();
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;
    const settings = {
        assetInformation: false,
        countdown: true,
        isHighestLowestMarkerEnabled: false,
        language: common.current_language.toLowerCase(),
        position: ui.is_chart_layout_default ? 'bottom' : 'left',
        theme: ui.is_dark_mode_on ? 'dark' : 'light',
    };

    useEffect(() => {
        const isSafariBrowser = () => {
            const ua = navigator.userAgent.toLowerCase();
            return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('android') === -1;
        };
        setIsSafari(isSafariBrowser());

        return () => {
            chart_api.api?.forgetAll('ticks');
        };
    }, []);

    // Poll until chart_api.api is initialised (created by api_base.init → chart_api.init)
    useEffect(() => {
        if (chart_api.api) {
            setIsApiReady(true);
            return;
        }
        const interval = setInterval(() => {
            if (chart_api.api) {
                setIsApiReady(true);
                clearInterval(interval);
            }
        }, 200);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chartSubscriptionIdRef.current = chart_subscription_id;
    }, [chart_subscription_id]);

    useEffect(() => {
        if (!symbol) {
            updateSymbol();
            const retryInterval = setInterval(() => {
                updateSymbol();
            }, 500);
            return () => clearInterval(retryInterval);
        }
    }, [symbol, updateSymbol]);

    const requestAPI = (req: ServerTimeRequest | ActiveSymbolsRequest | TradingTimesRequest) => {
        return chart_api.api?.send(req);
    };
    const requestForgetStream = (subscription_id: string) => {
        subscription_id && chart_api.api?.forget(subscription_id);
    };

    const requestSubscribe = async (req: TicksStreamRequest, callback: (data: any) => void) => {
        try {
            if (!chart_api.api) return;
            requestForgetStream(chartSubscriptionIdRef.current);
            const history = await chart_api.api.send(req);
            setChartSubscriptionId(history?.subscription.id);
            if (history) callback(history);
            if (req.subscribe === 1) {
                subscriptions[history?.subscription.id] = chart_api.api
                    .onMessage()
                    ?.subscribe(({ data }: { data: TicksHistoryResponse }) => {
                        callback(data);
                    });
            }
        } catch (e) {
            (e as TError)?.error?.code === 'MarketIsClosed' && callback([]);
            console.log((e as TError)?.error?.message);
        }
    };

    // Show a styled loading state while the chart WebSocket is connecting
    if (!isApiReady) {
        return (
            <div
                className={classNames('dashboard__chart-wrapper', {
                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.2rem', color: '#94a3b8' }}
            >
                <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
                    <circle cx='20' cy='20' r='16' stroke='rgba(61,186,126,0.2)' strokeWidth='4' />
                    <circle cx='20' cy='20' r='16' stroke='#3dba7e' strokeWidth='4' strokeLinecap='round'
                        strokeDasharray='25 75' transform='rotate(-90 20 20)'>
                        <animateTransform attributeName='transform' type='rotate' from='0 20 20' to='360 20 20' dur='1s' repeatCount='indefinite' />
                    </circle>
                </svg>
                <span style={{ fontSize: '1.3rem' }}>Connecting to chart server…</span>
            </div>
        );
    }

    if (!symbol) return null;

    return (
        <div
            className={classNames('dashboard__chart-wrapper', {
                'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                'dashboard__chart-wrapper--safari': isSafari,
            })}
            dir='ltr'
        >
            <SmartChart
                id='dbot'
                barriers={barriers}
                showLastDigitStats={show_digits_stats}
                chartControlsWidgets={null}
                enabledChartFooter={false}
                chartStatusListener={(v: boolean) => setChartStatus(!v)}
                toolbarWidget={() => (
                    <ToolbarWidgets
                        updateChartType={updateChartType}
                        updateGranularity={updateGranularity}
                        position={!isDesktop ? 'bottom' : 'top'}
                        isDesktop={isDesktop}
                    />
                )}
                chartType={chart_type}
                isMobile={isMobile}
                enabledNavigationWidget={isDesktop}
                granularity={granularity}
                requestAPI={requestAPI}
                requestForget={() => {}}
                requestForgetStream={() => {}}
                requestSubscribe={requestSubscribe}
                settings={settings}
                symbol={symbol}
                topWidgets={() => <ChartTitle onChange={onSymbolChange} />}
                isConnectionOpened={true}
                getMarketsOrder={getMarketsOrder}
                isLive
                leftMargin={80}
            />
        </div>
    );
});

export default Chart;
