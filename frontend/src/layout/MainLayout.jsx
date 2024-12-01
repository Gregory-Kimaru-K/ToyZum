import React from 'react'
import Navbar from '../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Mobilebar from '../components/navbar/Mobilebar'
import '../styles/mainlayout.css'

function MainLayout() {
    return (
        <div>
            <Navbar />
            <div className='layout'>
                <Outlet />
            </div>
            <Mobilebar />
        </div>
    )
}

export default MainLayout
