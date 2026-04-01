import './app-logo.scss';

export const AppLogo = () => {
    return (
        <a href='/' className='app-header__logo capital-edge-logo'>
            {/* Dark theme: white-on-black version */}
            <img
                src='/capital-edge-logo-dark.png'
                alt='Capital Edge'
                className='capital-edge-logo__img capital-edge-logo__img--dark'
            />
            {/* Light theme: dark-on-transparent version */}
            <img
                src='/capital-edge-logo.png'
                alt='Capital Edge'
                className='capital-edge-logo__img capital-edge-logo__img--light'
            />
        </a>
    );
};
