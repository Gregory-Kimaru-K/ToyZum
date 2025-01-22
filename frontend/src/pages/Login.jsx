import React, { useContext, useEffect, useRef, useState } from 'react';
import '../styles/login.css';
import EyeClose from '../assets/eyeclose.svg?react';
import EyeOpen from '../assets/eyeopen.svg?react';
import AuthContext from '../Context/Authcontext';
import FormLogin from '../components/body/FormLogin';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState('email');
    const [loginData, setLoginData] = useState({});
    let {loginUser} = useContext(AuthContext)

    const emailref = useRef(null)
    const phoneref = useRef(null)
    const passref = useRef(null)


    const togglePasswordInput = () => {
        setShowPassword((prevState) => !prevState);
    };

    const handleLoginType = (type) => {
        setLoginData({})
        setLoginType(type);

        if (emailref.current) emailref.current.value = '';
        if (phoneref.current) phoneref.current.value = '';
        if (passref.current) passref.current.value = '';
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setLoginData((prev) => ({...prev, [name]: value}))
    }

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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateLoginData()) {
            loginUser(loginData)
        }
    }

    return (
        <>
            <FormLogin />
        </>
    );
}

export default Login;