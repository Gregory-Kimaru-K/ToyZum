import React, { useEffect, useState } from 'react'
import Logo from '../../assets/toy7_edit2.png'
import '../../styles/navbar.css'
import PersonIcon from '../../assets/person-outline.svg?react'
import { NavLink, Link } from 'react-router-dom';

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
                    <Link to={'/home'}><img src={Logo} alt='Toy_Zum Logo' /></Link>
                    <Link to={'/profile'}><PersonIcon className='profile' /></Link>
                </>
                
            ):(
                <>
                    <NavLink to={'/home'}><img src={Logo} alt='Toy_Zum Logo' /></NavLink>
                    <div className='mininav'>
                        <NavLink to={'/home'}>Home</NavLink>
                        <NavLink to={'/cart'}>Cart</NavLink>
                        <NavLink to={'/purchases'}>My Purchases</NavLink>
                        <NavLink to={'/settings'}>Settings</NavLink>
                    </div>
                    <Link to={'/profile'}><PersonIcon className='profile' /></Link>
                </>
            )}
        </div>
    )
}

export default Navbar