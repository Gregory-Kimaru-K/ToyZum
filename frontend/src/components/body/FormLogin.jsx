import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthContext from "../../Context/AuthContext"

function FormLogin() {
    const [loginData, setLoginData] = useState({})
    const navigate = useNavigate()
    const EmailRef = useRef(null)
    const PhoneRef = useRef(null)
    const PwrdRef = useRef(null)
    const {loginUser} = useContext(AuthContext)

    const handleOnChange = (e) => {
        const {name, value} = e.target
        setLoginData((prev) => ({...prev, [name]: value}))
    }

    const handleLoginType = (type) => {
        setLoginData({})
        setLoginWith(type)

        if (EmailRef.current) EmailRef.current.value = "";
        if (PhoneRef.current) PhoneRef.current.value = "";
        if (PwrdRef.current) PwrdRef.current.value = "";
    }
    useEffect(() => {
        console.log(loginData)
    })

    const handleSubmit = () => {
        loginUser(loginData)
        navigate("/home")
    }
    return (
        <div className='login'>
            <div class="container">
                <div class="card">
                    <a class="singup">Login</a>
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
                        Don't have an account? <Link style={{ fontWeight: "bold", textDecoration: "none", color: "#000000" }} to={"/auth/signup"}>Signup</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FormLogin
