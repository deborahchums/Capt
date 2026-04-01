import './app-logo.scss';

export const AppLogo = () => {
    return (
        <a href='/' className='app-header__logo capital-edge-logo'>
            <img
                src='/capital-edge-logo.png'
                alt='Capital Edge'
                className='capital-edge-logo__img'
            />
            <span className='capital-edge-logo__wordmark'>
                <span className='capital-edge-logo__name'>CAPITAL EDGE</span>
                <span className='capital-edge-logo__tagline'>built for traders</span>
            </span>
        </a>
    );
};
