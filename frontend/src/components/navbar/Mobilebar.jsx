import React, { useEffect, useState } from 'react'
import Home from '../../assets/home-outline.svg?react'
import Cart from '../../assets/cart-outline.svg?react'
import Card from '../../assets/card-outline.svg?react'
import Info from '../../assets/info-outline.svg?react'
import '../../styles/mobilenav.css'

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
        <div className='botnav'>
            {isMobile ? (
                <div className='icons'>
                    <Home className='icon'/>
                    <Cart className='icon'/>
                    <Card className='icon'/>
                    <Info className='icon'/>

                </div>
            ): (<></>)}
        </div>
    )
}

export default Mobilebar
