import React from 'react';

type State = { hasError: boolean };

class HeaderWidgetBoundary extends React.Component<React.PropsWithChildren, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.warn('[Capital Edge] Header widget error (silenced):', error?.message);
    }

    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

export default HeaderWidgetBoundary;
