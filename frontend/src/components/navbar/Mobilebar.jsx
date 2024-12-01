import React, { useEffect, useState } from 'react'
import Home from '../../assets/home-outline.svg?react'
import Cart from '../../assets/cart-outline.svg?react'
import Card from '../../assets/card-outline.svg?react'
import Info from '../../assets/info-outline.svg?react'
import '../../styles/mobilenav.css'
import { NavLink } from 'react-router-dom'

function Mobilebar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

    useEffect(() => {
        const handleResize = () => {setIsMobile(window.innerWidth <= 600)};

        window.addEventListener('resize', handleResize)

        return(() => {
            window.removeEventListener('resize', handleResize);
        })
    }, [])
    return (
        <>
            {isMobile ? (
                <div className='botnav'>
                    <div className='icons'>
                        <NavLink to={'/'}><Home className='icon'/></NavLink>
                        <NavLink to={'/cart'}><Cart className='icon'/></NavLink>
                        <NavLink to={'/purchases'}><Card className='icon card'/></NavLink>
                        <NavLink to={'/about'}><Info className='icon'/></NavLink>
                    </div>
                </div>
            ): (<></>)}
        </>
    )
}

export default Mobilebar
