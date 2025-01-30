import React, { useEffect, useState } from 'react'
import Home from '../../assets/home-outline.svg?react'
import Cart from '../../assets/cart-outline.svg?react'
import Card from '../../assets/card-outline.svg?react'
import Settings from '../../assets/settings-sharp.svg?react'
import '../../styles/mobilenav.css'
import { Link } from 'react-router-dom'

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
                        <Link to={'/home'}><Home className='icon'/></Link>
                        <Link to={'/cart'}><Cart className='icon'/></Link>
                        <Link to={'/purchases'}><Card className='icon cardi'/></Link>
                        <Link to={'/settings'}><Settings className='icon set'/></Link>
                    </div>
                </div>
            ): (<></>)}
        </>
    )
}

export default Mobilebar
