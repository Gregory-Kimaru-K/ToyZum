import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem("authTokens") ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [user, setUser] = useState(() => {
        const tokens = localStorage.getItem("authTokens")
        if (tokens) {
            const parsedTokens = JSON.parse(tokens)
            const now = Date.now() / 1000
            if (now > parsedTokens.exp) {
                localStorage.removeItem("authTokens");
                authTokens(null);
                return null
            }
            return jwtDecode(parsedTokens.access)
        }
        return null;
    });

    const navigate = useNavigate()

    const loginUser = async (loginData) => {
        try {
            let response = await fetch("http://127.0.0.1:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            })

            if (response.status === 200) {
                let data = await response.json()
                setAuthTokens(data)
                setUser(jwtDecode(data.access));
                localStorage.setItem("authTokens", JSON.stringify(data));
                navigate('/home');
            }
            else {
                alert(`Something went wrong ${response.status}`)
            }
        }
        catch (error) {
            alert(`Error: ${error.message}`)
        }
    }

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/home')
    }

    const refreshTokens = async () => {
        try {
            let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({refresh: authTokens?.refresh})
            })

            if (response === 200) {
                let data = response.json()
                setAuthTokens(data)
                setUser(jwtDecode(data.access))
                localStorage.setItem('authTokens', JSON.stringify(data))
            } else {
                logoutUser();
            }
        } catch (error) {
            logoutUser();
        }
    }


    useEffect(() => {
        const checkTokenExpiration = () => {
            if (authTokens) {
                const decoded = jwtDecode(authTokens.access)
                const now = Date.now() /1000

                if (decoded.exp - now < 300) {
                    refreshTokens()
                }
            }
        };
        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval)
    }, [authTokens])


    let contextData = {
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
        authTokens: authTokens
    }

    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}