import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import MainLayout from "./layout/MainLayout"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import Purchases from "./pages/Purchases"
import ProductDets from "./pages/ProductDets"
import Login from "./pages/Login"

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<Navigate to={'/home'} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/purchases"  element={<Purchases />}/>
        <Route path="/:slug" element={<ProductDets />} />
      </Route>
    )
  )
  return (
    <RouterProvider router={routes} />
  )
}
export default App
