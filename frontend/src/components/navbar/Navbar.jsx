import React, { useEffect, useState } from 'react'
import Logo from '../../assets/toy7_edit2.png'
import '../../styles/navbar.css'
import PersonIcon from '../../assets/person-outline.svg?react'
import { NavLink } from 'react-router-dom';

function Navbar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    useEffect(() => {
        const handleResize = () => {setIsMobile(window.innerWidth <= 600)};
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize);
        };    }, [])
    return (
        <div className='navbar'>
            {isMobile ? (
                <>
                    <NavLink to={'/'}><img src={Logo} alt='Toy_Zum Logo' /></NavLink>
                    <NavLink to={'/profile'}><PersonIcon className='profile' /></NavLink>
                </>
                
            ):(
                <>
                    <img src={Logo} alt='Toy_Zum Logo' />
                    <div className='mininav'>
                        <NavLink to={'/'}>Home</NavLink>
                        <NavLink to={'/cart'}>Cart</NavLink>
                        <NavLink to={'/purchases'}>My Purchases</NavLink>
                        <NavLink to={'/about'}>About Us</NavLink>
                    </div>
                    <NavLink to={'/profile'}><PersonIcon className='profile' /></NavLink>
                </>
            )}
        </div>
    )
}

export default Navbar
