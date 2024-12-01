import React, { useEffect, useState } from 'react'
import Logo from '../../assets/toy7_edit2.png'
import '../../styles/navbar.css'
import PersonIcon from '../../assets/person-outline.svg?react'

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
                    <img src={Logo} alt='Toy_Zum Logo' />
                    <PersonIcon className='profile' />
                </>
                
            ):(
                <>
                    <img src={Logo} alt='Toy_Zum Logo' />
                    <div className='mininav'>
                        <p>Home</p>
                        <p>About Us</p>
                        <p>My Purchases</p>
                    </div>
                    <PersonIcon className='profile' />
                </>
            )}
        </div>
    )
}

export default Navbar
