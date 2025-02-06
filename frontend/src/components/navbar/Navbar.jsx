import React, { useEffect, useState } from 'react';
import Logo from '../../assets/toy7_edit2.png';
import '../../styles/navbar.css';
import OrdersImage from '../../assets/orders.svg?react';

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
        <div className='navbar'>
            <Link to="/home">
                <img src={Logo} alt="Logo" />
            </Link>

            <div className='search'>
                <div>
                    <ion-icon name="search-outline" id="search_icon"></ion-icon>
                    <input type='text' id='input' required />
                </div>
                <button onClick={() => alert("hi")}>
                    Search
                </button>
            </div>
            <div className='account'>
                <div><ion-icon name="person-outline" id="icon"></ion-icon> Account <ion-icon name="chevron-down-outline" id="chev"></ion-icon></div>
                <div><OrdersImage className="ordersvg" /> Orders</div>
                <div><ion-icon name="cart-outline" id="cart"></ion-icon> Cart</div>
            </div> 
        </div>
    )
}

export default Navbar;