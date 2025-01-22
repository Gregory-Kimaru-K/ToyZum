import React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../Context/Authcontext'

function AuthLayout() {
  return (
    <div className='auth-layout'>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </div>
  )
}

export default AuthLayout
