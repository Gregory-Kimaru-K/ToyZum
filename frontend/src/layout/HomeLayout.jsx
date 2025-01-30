import React from 'react'
import { Outlet } from 'react-router-dom'
import { CategoryProvider } from '../Context/CategoryContext'
import { ProductProvider } from '../Context/ProductContext'

function HomeLayout() {
  return (
    <div>
      <CategoryProvider>
        <ProductProvider>
          <Outlet />
        </ProductProvider>
      </CategoryProvider>
    </div>
  )
}

export default HomeLayout
