import './app-logo.scss';

export const AppLogo = () => {
    return (
        <a href='/' className='app-header__logo capital-edge-logo'>
            <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect width='36' height='36' rx='7' fill='#0a0f1e' />
                <polygon points='18,7 29,18 18,29 7,18' fill='none' stroke='#d4af37' strokeWidth='2.2' />
                <polygon points='18,12 25,18 18,24 11,18' fill='#d4af37' />
            </svg>
            <span className='capital-edge-logo__wordmark'>
                <span className='capital-edge-logo__name'>CAPITAL EDGE</span>
                <span className='capital-edge-logo__tagline'>built for traders</span>
            </span>
        </a>
    );
};
