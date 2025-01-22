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

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Navigate to={'/home'} />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/purchases"  element={<Purchases />} />
          <Route path="/:slug" element={<ProductDets />} />
          <Route path="/product" element={<ProductAdd />} />
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
