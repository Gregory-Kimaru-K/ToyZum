import React from 'react'
import Navbar from '../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Mobilebar from '../components/navbar/Mobilebar'
import '../styles/mainlayout.css'
import { AuthProvider } from '../Context/Authcontext'

function MainLayout() {
    return (
        <div>
            <AuthProvider>
                <Navbar />
            </AuthProvider>
            <div className='layout'>
                <AuthProvider>
                    <Outlet />
                </AuthProvider>
            </div>
            <Mobilebar />
        </div>
    )
}

export default MainLayout
