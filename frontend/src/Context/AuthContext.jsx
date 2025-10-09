import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backendurl from "../constants/constants";

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
                setAuthTokens(null);
                return null;
            }
            return jwtDecode(parsedTokens.access)
        }
        return null;
    });

    const navigate = useNavigate()

    const createUser = async (createData) => {
        try {
            const response = await fetch(`${backendurl}token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(createData)
            })

            if (response.status === 201) {
                const data = await response.json()
                setAuthTokens(data)
                setUser(jwtDecode(data.access))
                console.log(user)
                localStorage.setItem("authTokens", JSON.stringify(data))
                return({success: true})
            }
            else {
                const data = await response.json()
                alert(`${JSON.stringify(data)}`)
                return({success: false, errors: "Something went wrong"})
            }
        }
        catch (error) {
            return({success: false, errors: error instanceof Error ? JSON.stringify(error.message) : "Network Error"})
        }
    }

const loginUser = async (loginData) => {
    try {
        const response = await fetch(`${backendurl}token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok) {
            // Successful login
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));

            return { success: true };
        } else {
            return { success: false, errors: "Invalid Credentials" };
        }
    } catch (error) {
        return { success: false, errors: error instanceof Error ? error.message : "Network Error" };
    }
};

    const logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/home')
    }

    const refreshTokens = async () => {
        try {
            let response = await fetch(`${backendurl}token/refresh/`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({refresh: authTokens?.refresh})
            })

            if (response.status === 200) {
                let data = await response.json()
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

                if (decoded.exp - now < 10*60) {
                    refreshTokens()
                }
            }
        };
        const interval = setInterval(checkTokenExpiration, 5000);
        return () => clearInterval(interval)
    }, [authTokens])


    let contextData = {
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
        authTokens: authTokens,
        createUser
    }

    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}