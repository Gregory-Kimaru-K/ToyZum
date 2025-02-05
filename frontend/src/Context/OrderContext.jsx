import { createContext, useCallback, useEffect, useState } from "react"

const OrderContext = createContext()

export default OrderContext

export const OrderProvider = ({children}) => {
    const [token, setToken] = useState(null)

    useEffect(() => {
        try{
            const tokenData = localStorage.getItem('authTokens');

            if (tokenData){
                const parsedData = JSON.parse(tokenData)
                setToken(parsedData.access)
            }
            else {
                console.log("No tokens found")
            }
        }
        catch (error) {
            console.log("Error", error)
        }

    }, [])

    const createOrders = useCallback(async (product_id) => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`http://127.0.0.1:8000/api/orders/${product_id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })

            if (response.status === 201){
                const data = await response.json()
                console.log(`SUCCESS DATA: ${data}`)
            }
            else {
                const data = await response.json()
                console.log(`ERROR DATA: ${data}`)
            }
        }
        catch (error){
            console.log("ERROR", error)
        }
    }, [token])
    const getOrders =useCallback(async () => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch("http://127.0.0.1:8000/api/orders/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })

            if (response === 200){
                const data = await response.json()
                console.log(`SUCCESS DATA: ${data}`)
            }
            else{
                const data = await response.json()
                console.log(`ERROR DATA: ${data}`)
            }
        }
        catch (error){
            console.log(`ERROR: ${error}`)
        }
    }, [token])

    const getOrder =useCallback(async (id) => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`http://127.0.0.1:8000/api/orders/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })
            if (response === 200){
                const data = await response.json()
                console.log(`SUCCESS DATA: ${data}`)
            }
            else{
                const data = await response.json()
                console.log(`ERROR DATA: ${data}`)
            }
        }
        catch (error){
            console.log(`ERROR ${error}`)
        }

        
    }, [token])

    const updateStatus = useCallback(async (id) => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`http://127.0.0.1:8000/api/orders/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })
            if (response === 200){
                const data = await response.json()
                console.log(`SUCCESS DATA: ${data}`)
            }
            else{
                const data = await response.json()
                console.log(`ERROR DATA: ${data}`)
            }
        }
        catch(error){
            console.log(`ERROR: ${error}`)
        }
    }, [token])

    const ContextData = {
        createOrders: createOrders,
        getOrders: getOrders,
        getOrder: getOrder,
        updateStatus: updateStatus
    }

    return(
        <OrderContext.Provider value={ContextData}>
            {children}
        </OrderContext.Provider>
    )
}