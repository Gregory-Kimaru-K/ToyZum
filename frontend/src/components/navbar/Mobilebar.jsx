import React, { useContext, useEffect, useState } from 'react'
import OrdersImage from '../../assets/orders.svg?react';
import SellProduct from "../../assets/sell_product.svg?react"
import '../../styles/mobilenav.css'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import IsMobileContext from '../../Context/IsMobileContext';
import AuthContext from '../../Context/AuthContext';

function Mobilebar() {
    const {isMobile} = useContext(IsMobileContext)
    const location = useLocation()
    const path = location.pathname.toLowerCase()
    const {user} = useContext(AuthContext)
    const searchParams = new URLSearchParams(location.search)

    const getActive = () => {
        

        if (path.startsWith("/home/products") && searchParams.has("sellerEmail")) return "STOCK"
        if (path.includes("/cart")) return "CART"
        if (path.includes("/orders") && !path.includes("/myorders")) return "ORDERED"
        if (path.includes("/home")) return "HOME"
        if (path.includes("/myorders")) return "ORDERS"
        return ""
    }
    const [navSample, setNavSample] = useState(getActive())
    useEffect(() => {
        setNavSample(getActive())
    }, [location])

    return (
        <>
            {isMobile ? (
                <div className='botnav'>
                    <Link
                        className={navSample === "CART" ? "icon active" : "icon"}
                        onClick={() => setNavSample("CART")}
                        to="/cart"
                    >
                        <div className="mob_cart">
                            <ion-icon name="cart-outline"></ion-icon>
                        </div>
                        <p>Cart</p> 
                    </Link>
                    <Link
                        className={navSample === "ORDERED" ? "icon active" : "icon"}
                        onClick={() => setNavSample("ORDERED")}
                        to="/orders"
                    >
                        <SellProduct className="mob_icon" />
                        <p>Ordered</p>
                    </Link>
                    <Link
                        className={navSample === "HOME" ? "icon active" : "icon"}
                        onClick={() => setNavSample("HOME")}
                        to="/home"
                    >
                        <div className='mob_cart'>
                            <ion-icon name="home-outline"></ion-icon>
                        </div>
                        <p>Home</p>
                    </Link>
                    <Link
                        className={navSample === "ORDERS" ? "icon active" : "icon"}
                        onClick={() => setNavSample("ORDERS")}
                        to="/myorders"
                    >
                        <OrdersImage className="mob_icon" />
                        <p>Orders</p>
                    </Link>
                    {user && (
                        <Link
                            className={navSample === "STOCK" ? "icon active" : "icon"}
                            onClick={() => setNavSample("STOCK")}
                            to={`/home/products?sellerEmail=${encodeURIComponent(user.email)}`}
                        >
                            <div className="mob_cart">
                                <ion-icon name="albums-outline"></ion-icon>
                            </div>
                            <p>My Stock</p>
                        </Link>
                    )}
                </div>
            ): (<></>)}
        </>
    )
}

export default Mobilebar
