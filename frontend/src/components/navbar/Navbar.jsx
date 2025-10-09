import React, { useContext, useEffect, useState } from 'react';
import Logo from '../../assets/toy7_edit2.png';
import '../../styles/navbar.css';
import OrdersImage from '../../assets/orders.svg?react';
import SellProduct from "../../assets/sell_product.svg?react"
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import IsMobileContext from '../../Context/IsMobileContext';

function Navbar({dropdown, setDropdown}) {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext)
    const {isMobile} = useContext(IsMobileContext)

    const handleDropdown = () => {
        if (user === null){
            setDropdown((prev) => !prev)
        }
        else {
            navigate("/profile")
        }
    }
    return (
        <div className='navbar'>
            <Link to="/home">
                <img src={Logo} alt="Logo" />
            </Link>

            <div className='search'>
                <div>
                    <ion-icon name="search-outline" id="search_icon"></ion-icon>
                    <input type='text' id='input' required />
                </div>
                <button onClick={() => alert("hi")}>
                    Search
                </button>
            </div>
            <div className='account' 
                style={( !user || user?.role === "END_USER") ? { width: "24%" } : {}}>
                <div className='account-set'>
                    <span onClick={handleDropdown}>
                        <ion-icon name="person-outline" id="icon"></ion-icon> Account <ion-icon name="chevron-down-outline" id="chev"></ion-icon>
                    </span>
                    {dropdown && (
                        <div className='dropdown'>
                            <Link to={"/auth/login"}>Login</Link>
                            <Link to={"/auth/signup"}>Sign Up</Link>
                        </div>
                    )}
                </div>
                {isMobile === false && (
                    <>
                        <div style={{ cursor: "pointer" }} onClick={() => navigate("/myorders")}><OrdersImage className="ordersvg" /> Orders</div>
                        <div style={{ cursor: "pointer" }} onClick={() => navigate("/cart")}><ion-icon name="cart-outline" id="cart"></ion-icon> Cart</div>
                        {user !== null && (user?.role === "SELLER" ||user?.role === "SUPERUSER") && (
                        <>
                            <div style={{ cursor: "pointer" }} onClick={() => navigate("/orders")}><SellProduct className="productsvg" /> Ordered Products</div>
                            <div style={{cursor: "pointer"}} onClick={() => navigate(`/home/products?sellerEmail=${user.email}`)}><ion-icon name="albums-outline" id="cart"></ion-icon> My Stock</div>
                        </>
                        )}
                    </>
                )}
            </div> 
        </div>
    )
}

export default Navbar;