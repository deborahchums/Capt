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

    React.useEffect(() => {
        onMount();
        return () => {
            onUnmount();
        };
    }, []);

    React.useEffect(() => {
        if (window.Blockly?.derivWorkspace) {
            setWorkspaceReady(true);
            return;
        }
        const interval = setInterval(() => {
            if (window.Blockly?.derivWorkspace) {
                setWorkspaceReady(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [is_loading]);

    if (is_loading || !workspace_ready) return null;

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
