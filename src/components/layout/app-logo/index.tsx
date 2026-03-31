import './app-logo.scss';

export const AppLogo = () => {
    return (
        <a href='/' className='app-header__logo capital-edge-logo'>
            <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect width='32' height='32' rx='6' fill='#0a0f1e' />
                <path d='M8 16L14 10L20 16L14 22L8 16Z' fill='#d4af37' />
                <path d='M16 8L24 16L16 24' stroke='#d4af37' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' fill='none' />
            </svg>
            <span className='capital-edge-logo__name'>Capital Edge</span>
        </a>
    );
};
