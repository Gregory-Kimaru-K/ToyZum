import React, { useEffect, useState } from 'react';
import Logo from '../../assets/toy7_edit2.png';
import '../../styles/navbar.css';
import PersonIcon from '../../assets/person-outline.svg?react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSignIn = () => {
        navigate('/auth/login');
    };

    return (
        <div className="navbar">
            {isMobile ? (
                <>
                    <Link to={'/home'}>
                        <img src={Logo} alt="Toy_Zum Logo" />
                    </Link>
                    {authTokens ? (
                        <Link to={'/profile'} className="aprofile">
                            <PersonIcon className="profile" />
                        </Link>
                    ) : (
                        <button className="authbtn" onClick={handleSignIn}>
                            Sign in
                        </button>
                    )}
                </>
            ) : (
                <>
                    <NavLink to={'/home'}>
                        <img src={Logo} alt="Toy_Zum Logo" />
                    </NavLink>
                    <div className="mininav">
                        <NavLink to={'/home'}>Home</NavLink>
                        <NavLink to={'/cart'}>Cart</NavLink>
                        <NavLink to={'/purchases'}>My Purchases</NavLink>
                        <NavLink to={'/settings'}>Settings</NavLink>
                    </div>
                    {localStorage.getItem('authTokens') ? (
                        <Link to={'/profile'} className="aprofile">
                            <PersonIcon className="profile" />
                        </Link>
                    ) : (
                        <button className="authbtn" onClick={handleSignIn}>
                            Sign in
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default Navbar;