import { lazy, Suspense, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import ErrorBoundary from '@/components/error-component/error-boundary';
import ErrorComponent from '@/components/error-component/error-component';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import useTMB from '@/hooks/useTMB';
import './app-root.scss';

const AppContent = lazy(() => import('./app-content'));

const AppRootLoader = () => null;

const ErrorComponentWrapper = observer(() => {
    const { common } = useStore();

    if (!common.error) return null;

    return (
        <ErrorComponent
            header={common.error?.header}
            message={common.error?.message}
            redirect_label={common.error?.redirect_label}
            redirectOnClick={common.error?.redirectOnClick}
            should_clear_error_on_click={common.error?.should_clear_error_on_click}
            setError={common.setError}
            redirect_to={common.error?.redirect_to}
            should_redirect={common.error?.should_redirect}
        />
    );
});

const AppRoot = () => {
    const store = useStore();
    const api_base_initialized = useRef(false);
    const { isTmbEnabled } = useTMB();

    // Fire-and-forget: initialize API immediately, don't block rendering.
    // TMB check and API init happen in parallel; the app is already visible.
    useEffect(() => {
        if (api_base_initialized.current) return;
        api_base_initialized.current = true;

        const run = async () => {
            // TMB check — non-blocking, just sets window flag
            try {
                const tmb_status = await isTmbEnabled();
                window.is_tmb_enabled = tmb_status || window.is_tmb_enabled === true;
            } catch {
                // ignore — TMB is optional
            }

            // API init
            try {
                await api_base.init();
            } catch (err) {
                console.error('[Capital Edge] API init failed:', err);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!store) return <AppRootLoader />;

    return (
        <Suspense fallback={<AppRootLoader />}>
            <ErrorBoundary root_store={store}>
                <ErrorComponentWrapper />
                <AppContent />
            </ErrorBoundary>
        </Suspense>
    );
};

export default AppRoot;
