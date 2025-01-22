import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../../Context/Authcontext'

function FormLogin() {
    const [loginWith, setLoginWith] = useState('email')
    const [loginData, setLoginData] = useState({})
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

    const validateLoginData = () => {
        const { email, phone_number, password } = loginData;

        // Check if password is present
        if (!password || password.length < 3) {
            alert("Password must be at least 3 characters long.");
            return false;
        }

        // Validate email or phone based on loginType
        if (loginType === "email") {
            if (!email) {
                alert("Email is required.");
                return false;
            }
            // Check if email matches a basic email regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return false;
            }
        } else if (loginType === "phone") {
            if (!phone_number) {
                alert("Phone number is required.");
                return false;
            }
            // Check if phone number matches a basic phone regex
            const phoneRegex = /^[0-9]{9,15}$/; // Accepts numbers between 10 to 15 digits
            if (!phoneRegex.test(phone_number)) {
                alert("Please enter a valid phone number.");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateLoginData) {
            loginUser(loginData)
        }
    }
    return (
        <div>
             <div className="toggleLogin">
                <button
                    onClick={() => handleLoginType('email')}
                    className={loginWith === 'email' ? 'active' : ''}
                >
                    Email
                </button>
                <button
                    onClick={() => handleLoginType('phone')}
                    className={loginWith === 'phone' ? 'active' : ''}
                >
                    Phone
                </button>
            </div>
            <div class="container">
                <div class="card">
                    <a class="singup">Login</a>
                    <div class="inputBox1">
                        {loginWith === 'email' ? 
                                        <input type="email" required name='email' onChange={(e) => handleOnChange(e)} ref={EmailRef} /> :
                                        <input type="tel" required name='phone_number' onChange={(e) => handleOnChange(e)} ref={PhoneRef}/>}
                        <span class="user">{loginWith === 'email' ? 'Email' : 'Phone Number'}</span>
                    </div>

                    <div class="inputBox">
                        <input type="password" required name='password' onChange={(e) => handleOnChange(e)} ref={PwrdRef} />
                        <span>Password</span>
                        <Link className='fpass'>Forgot Password</Link>
                    </div>

            <button class="enter" onClick={handleSubmit}>Enter</button>

            </div>
            </div>
        </div>
    )
}

export default FormLogin
