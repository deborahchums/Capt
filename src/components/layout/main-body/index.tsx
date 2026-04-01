import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
    // Capital Edge always defaults to dark theme — set it on first load if not already stored
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'dark');
    }
    const current_theme = localStorage.getItem('theme') ?? 'dark';
    const { ui } = useStore() ?? {
        ui: {
            setDevice: () => {},
        },
    };
    const { setDevice } = ui;
    const { isDesktop, isMobile, isTablet } = useDevice();

    useEffect(() => {
        const body = document.querySelector('body');
        if (!body) return;
        if (current_theme === 'light') {
            body.classList.remove('theme--dark');
            body.classList.add('theme--light');
        } else {
            body.classList.remove('theme--light');
            body.classList.add('theme--dark');
        }
    }, [current_theme]);

    useEffect(() => {
        if (isMobile) {
            setDevice('mobile');
        } else if (isTablet) {
            setDevice('tablet');
        } else {
            setDevice('desktop');
        }
    }, [isDesktop, isMobile, isTablet, setDevice]);

    return <div className='main-body'>{children}</div>;
};

export default MainBody;
