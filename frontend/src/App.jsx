import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import Inventory from "./pages/Inventory"
import MainLayout from "./layout/MainLayout"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import ProductDets from "./pages/ProductDets"
import Login from "./pages/Login"
import AuthLayout from "./layout/AuthLayout"
import ProductAdd from "./pages/ProductAdd"
import HomeLayout from "./layout/HomeLayout"
import CreateCategory from "./pages/CreateCategory"
import CreateDepartment from "./pages/CreateDepartment"
import CategoryLayout from "./layout/CategoryLayout"
import CategoryProducts from "./pages/CategoryProducts"
import OrderProducts from "./pages/OrderProducts"
import MyOrders from "./pages/MyOrders"
import OrderDets from "./pages/OrderDets"
import SignUp from "./pages/SignUp"
import CreateAdverts from "./pages/CreateAdverts"
import UpdateAdverts from "./pages/UpdateAdverts"

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Navigate to={'/home'} />} />
          <Route path="/home" element={<HomeLayout />}>
            <Route index element={<Home />} />
            <Route path="product" element={<ProductAdd />} />
            <Route path="products" element={<CategoryProducts />}/>
            <Route path="department/create" element={<CreateDepartment />} />
            <Route path="category" element={<CategoryLayout />}>
              <Route path="create_category" element={<CreateCategory />} />
            </Route>
            <Route path=":productid" element={<ProductDets />} />
          </Route>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/adverts" element={<CreateAdverts />} />
          <Route path="/adverts/:advertid" element={<UpdateAdverts />} />
          <Route path="/orders" element={<OrderProducts />} />
          <Route path="/orders/:orderid" element={<OrderDets />}/>
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </>
    )
  )

  return (
      <RouterProvider router={routes} />
  )
}
export default App
