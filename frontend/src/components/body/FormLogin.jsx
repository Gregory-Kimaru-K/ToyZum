import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthContext from "../../Context/AuthContext"

function FormLogin() {
    const [loginData, setLoginData] = useState({})
    const navigate = useNavigate()
    const location = useLocation()
    const {loginUser} = useContext(AuthContext)
    const [errors, setErrors] = useState()
    const queryParams = new URLSearchParams(location.search)
    const nextParam = queryParams.get("next")

    const handleOnChange = (e) => {
        const {name, value} = e.target
        setLoginData((prev) => ({...prev, [name]: value}))
    }

    const handleSubmit = async() => {
        const response = await loginUser(loginData)
        if (response.success === true){
            navigate(nextParam ? decodeURIComponent(nextParam) :"/home")
        } else {
            setErrors(response.errors)
        }
    }

    return (
        <div className='login'>
            <div class="container">
                <div class="card">
                    <a class="singup">Login</a>
                    {errors && <p style={{position: "absolute", top: "0px", paddingTop: "32px", fontSize: "1.2rem", paddingBottom: "16px", textAlign: "center", backgroundColor: "rgba(255, 0, 0, 0.4)", width: "100%"}}>{errors}</p>}
                    <div class="inputBox1">
                        <input type="text" required name='email' onChange={(e) => handleOnChange(e)} />
                        <span class="user">Email or Phone Number</span>
                    </div>

                    <div class="inputBox">
                        <input type="password" required name='password' onChange={(e) => handleOnChange(e)} />
                        <span>Password</span>
                        <Link className='fpass'>Forgot Password</Link>
                    </div>
                    <button class="enter" onClick={handleSubmit}>Enter</button>
                    <p>
                        Don't have an account? {" "}
                        <Link 
                            style={{ fontWeight: "bold", textDecoration: "none", color: "#000000" }}
                            to={nextParam ? `/auth/signup?next=${encodeURIComponent(nextParam)}` :"/auth/signup"}>
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FormLogin
