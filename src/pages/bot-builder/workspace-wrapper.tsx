import React from 'react';
import { observer } from 'mobx-react-lite';
import Flyout from '@/components/flyout';
import { useStore } from '@/hooks/useStore';
import StopBotModal from '../dashboard/stop-bot-modal';
import Toolbar from './toolbar';
import Toolbox from './toolbox';
import './workspace.scss';

const WorkspaceWrapper = observer(() => {
    const { blockly_store } = useStore();
    const { onMount, onUnmount, is_loading } = blockly_store;
    const [workspace_ready, setWorkspaceReady] = React.useState(false);
    const retry_count_ref = React.useRef(0);
    const interval_ref = React.useRef<ReturnType<typeof setInterval> | null>(null);

    // Call onMount once on mount
    React.useEffect(() => {
        onMount();
        return () => {
            onUnmount();
            if (interval_ref.current) clearInterval(interval_ref.current);
        };
    }, []);

    // Poll for workspace readiness. If it takes too long, retry onMount.
    React.useEffect(() => {
        if (interval_ref.current) clearInterval(interval_ref.current);
        if (window.Blockly?.derivWorkspace) {
            setWorkspaceReady(true);
            return;
        }

        let ticks = 0;
        interval_ref.current = setInterval(() => {
            ticks++;
            if (window.Blockly?.derivWorkspace) {
                setWorkspaceReady(true);
                if (interval_ref.current) clearInterval(interval_ref.current);
                return;
            }
            // Every 5 s (50 × 100ms) retry onMount up to 3 times
            if (ticks % 50 === 0 && retry_count_ref.current < 3) {
                retry_count_ref.current += 1;
                onMount();
            }
            // Give up after 20 s
            if (ticks >= 200) {
                if (interval_ref.current) clearInterval(interval_ref.current);
            }
        }, 100);

        return () => {
            if (interval_ref.current) clearInterval(interval_ref.current);
        };
    }, [is_loading]);

    if (is_loading || !workspace_ready) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '1.6rem',
                    color: '#94a3b8',
                }}
            >
                <svg width='44' height='44' viewBox='0 0 44 44' fill='none'>
                    <circle cx='22' cy='22' r='18' stroke='rgba(61,186,126,0.2)' strokeWidth='4' />
                    <circle
                        cx='22'
                        cy='22'
                        r='18'
                        stroke='#3dba7e'
                        strokeWidth='4'
                        strokeLinecap='round'
                        strokeDasharray='28 84'
                        transform='rotate(-90 22 22)'
                    >
                        <animateTransform
                            attributeName='transform'
                            type='rotate'
                            from='0 22 22'
                            to='360 22 22'
                            dur='0.9s'
                            repeatCount='indefinite'
                        />
                    </circle>
                </svg>
                <span style={{ fontSize: '1.3rem', letterSpacing: '0.04em' }}>Loading Bot Builder…</span>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Toolbox />
            <Toolbar />
            <Flyout />
            <StopBotModal />
        </React.Fragment>
    );
});

export default WorkspaceWrapper;
