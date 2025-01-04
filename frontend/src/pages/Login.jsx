import React, { useState } from 'react'
import '../styles/login.css'
import EyeClose from '../assets/eyeclose.svg?react'
import EyeOpen from '../assets/eyeopen.svg?react'

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordInput = () => {
        setShowPassword((prevState) => !prevState)
    }
    return (
        <div className="login-box">
            <p>Login</p>
            <form>
                <div className="user-box">
                    <input className='input' required name="username" type="text"/>
                    <label>Username</label>
                </div>
                <div className="user-box">
                    <input className='input' required name="password" type={showPassword ? "text" : "password"} />
                    <label>Password</label>
                    <span onClick={togglePasswordInput} className='eye-icon'>
                        {showPassword ? <EyeClose className='eye' /> : <EyeOpen className='eye' />}
                    </span>
                </div>
                <a href="#">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Submit
                </a>
            </form>
            <p>Don't have an account? <a href="" class="a2">Sign up!</a></p>
        </div>
    )
}

export default Login