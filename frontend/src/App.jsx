import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import MainLayout from "./layout/MainLayout"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import Purchases from "./pages/Purchases"
import ProductDets from "./pages/ProductDets"
import Login from "./pages/Login"
import AuthLayout from "./layout/AuthLayout"
import ProductAdd from "./pages/ProductAdd"
import HomeLayout from "./layout/HomeLayout"
import CreateCategory from "./pages/CreateCategory"
import CategoryLayout from "./layout/CategoryLayout"
import CategoryProducts from "./pages/CategoryProducts"

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Navigate to={'/home'} />} />
          <Route path="/home" element={<HomeLayout />}>
            <Route index element={<Home />} />
            <Route path="product" element={<ProductAdd />} />
            <Route path="category" element={<CategoryLayout />}>
              <Route path="create_category" element={<CreateCategory />} />
              <Route path=":categoryid" element={<CategoryProducts />} />
            </Route>
            <Route path=":productid" element={<ProductDets />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/purchases"  element={<Purchases />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
      </>
    )
  )

  return (
      <RouterProvider router={routes} />
  )
}
export default App
