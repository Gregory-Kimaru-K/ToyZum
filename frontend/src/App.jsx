import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import MainLayout from "./layout/MainLayout"
import About from "./pages/About"
import Profile from "./pages/Profile"
import Purchases from "./pages/Purchases"
import ProductDets from "./pages/ProductDets"

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout />}>
        <Route index element={<Navigate to={'/home'} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
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
