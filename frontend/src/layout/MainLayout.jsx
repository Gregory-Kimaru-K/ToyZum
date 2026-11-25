import { useEffect, useState } from 'react'
import Navbar from '../components/navbar/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import Mobilebar from '../components/navbar/Mobilebar'
import { AuthProvider } from '../Context/AuthContext'
import { OrderProvider } from '../Context/OrderContext'
import { IsMobileProvider } from '../Context/IsMobileContext'
import '../styles/storefront.css'
import '../styles/app-ui.css'

function MainLayout() {
    const [dropdown, setDropdown] = useState(false)
    const { pathname, hash } = useLocation()
    useEffect(() => {
        if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
        else window.scrollTo(0, 0)
    }, [pathname, hash])
    return (
        <div>
            <IsMobileProvider>
                <AuthProvider>
                    <OrderProvider>
                        <Navbar dropdown={dropdown} setDropdown={setDropdown}/>
                        <main id="main-content" tabIndex={-1} onClick={() => setDropdown(false)} className='layout'>
                            <Outlet />
                        </main>
                        <Mobilebar />
                    </OrderProvider>
                </AuthProvider>
            </IsMobileProvider>
        </div>
    )
}

export default MainLayout
