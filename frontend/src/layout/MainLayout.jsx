import React, { useState } from 'react'
import Navbar from '../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Mobilebar from '../components/navbar/Mobilebar'
import '../styles/mainlayout.css'
import { AuthProvider } from '../Context/AuthContext'
import { OrderProvider } from '../Context/OrderContext'
import { IsMobileProvider } from '../Context/IsMobileContext'

function MainLayout() {
    const [dropdown, setDropdown] = useState(false)
    return (
        <div>
            <IsMobileProvider>
                <AuthProvider>
                    <OrderProvider>
                        <Navbar dropdown={dropdown} setDropdown={setDropdown}/>
                        <div onClick={() => setDropdown(false)} className='layout'>
                            <Outlet />
                        </div>
                        <Mobilebar />
                    </OrderProvider>
                </AuthProvider>
            </IsMobileProvider>
        </div>
    )
}

export default MainLayout
