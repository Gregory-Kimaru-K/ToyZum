import React, { useContext, useEffect, useState } from 'react'
import 'react-phone-input-2/lib/style.css'
import "../../styles/login.css"
import { Link } from 'react-router-dom'
import AuthContext from '../../Context/AuthContext'
import PhoneInput from 'react-phone-input-2'

function FormCreate() {
    const [formData, setFormData] = useState({})
    const { createUser } = useContext(AuthContext)
    const [error, setError] = useState("")

    useEffect(() => {
        console.log(JSON.stringify(formData))
    }, [formData])
    const handleSubmit = () => {
        setError({})

        // Name check
        if (!formData.first_name || !formData.last_name){
            setError("Please enter Your Name")
            return
        }

        // Email check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.")
            return
        }

        // Phone number check (basic: at least 9–15 digits)
        const phoneRegex = /^[0-9]{9,15}$/;
        if (!formData.phone_number || !phoneRegex.test(formData.phone_number)) {
            setError("Please enter a valid phone number.")
            return
        }

        // Password checks
        if (!formData.password || !formData.cpassword) {
            setError("Please enter and confirm your password.")
            return
        }

        if (formData.password !== formData.cpassword) {
            setError("Passwords do not match.")
            return
        }

        const strongPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
        if (!strongPassword.test(formData.password)) {
            setError("Password must be at least 6 characters long, contain a number and a special character.")
            return
        }

        // If all validations pass
        setError("")
        createUser(formData)
    }


    const handleOnChange = (event) => {
        setError("")
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className='absol'>
            <div className="container">
                <div className="card">
                    <a className="singup">create account</a>
                    {error && <p style={{position: "absolute", top: "0px", paddingTop: "32px", fontSize: "1.2rem", paddingBottom: "16px", textAlign: "center", backgroundColor: "rgba(255, 0, 0, 0.4)", width: "100%"}}>{error}</p>}
                    <div className='name'>
                        <div className="inputBox name-in">
                            <input type="text" required name='first_name' onChange={handleOnChange} value={formData.first_name || ""} />
                            <span className="user">First Name</span>
                        </div>
                        <div className="inputBox name-in">
                            <input type="text" required name='last_name' onChange={handleOnChange} value={formData.last_name || ""} />
                            <span className="user">Last Name</span>
                        </div>
                    </div>
                    <div className="inputBox1">
                        <input type="email" required name='email' onChange={handleOnChange} value={formData.email || ""} />
                        <span className="user">Email</span>
                    </div>
                    <div className="inputBox1">
                        <PhoneInput
                            country={"ke"}
                            value={formData.phone_number}
                            onChange={(phone) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    phone_number: phone
                                }))
                            }}
                            placeholder=''
                            inputProps={{
                                name: "phone_number",
                                required: true
                            }}
                            inputStyle={{
                                width: "100%",
                                height: "48px",
                                fontSize: "1em",
                            }}
                            buttonStyle={{
                                border: "none",
                                background: "none"
                            }}
                         />
                        {/* <input type="tel" required name='phone_number' onChange={handleOnChange} value={formData.phone_number || ""} />
                        <span className="user">Phone Number</span> */}
                    </div>

                    <div className="inputBox">
                        <input type="password" required name='password' onChange={handleOnChange} />
                        <span>Password</span>
                    </div>
                    <div className="inputBox1">
                        <input type="password" required name='cpassword' onChange={handleOnChange} />
                        <span className="user">Confirm Password</span>
                    </div>
                    <button className="enter" onClick={handleSubmit}>Enter</button>
                    <p>
                        Have an account?{" "}
                        <Link style={{ fontWeight: "bold", textDecoration: "none", color: "#000000" }} to={"/auth/login"}>
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FormCreate
