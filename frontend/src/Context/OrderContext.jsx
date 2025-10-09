import { createContext, useCallback, useEffect, useState } from "react"
import backendurl from "../constants/constants"

const OrderContext = createContext()

export default OrderContext

export const OrderProvider = ({children}) => {
    const [token, setToken] = useState(null)
    const [isReady, setIsReady] = useState(false)
    const [orders, setOrders] = useState([])
    const [myOrders, setMyOrders] = useState([])
    const [order, setOrder] = useState()

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
        } finally {
            setIsReady(true)
        }

    }, [])

    const createOrders = useCallback(async (data, product) => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`${backendurl}orders/create/${product}/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(data)
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
            const response = await fetch(`${backendurl}orders/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })

            if (response.status === 200){
                const data = await response.json()
                if(data.length === 0){
                    setOrders("NONE")
                }
                setOrders(data)
                console.log(`SUCCESS DATA: ${JSON.stringify(data)}`)
            }
            else{
                const data = await response.json()
                alert(json.stringify(data))
                console.log(`ERROR DATA: ${json.stringify(data)}`)
            }
        }
        catch (error){
            alert(json.stringify(data))
            console.log(`ERROR: ${error}`)
        }
    }, [token])

    const getMyOrders =useCallback(async () => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`${backendurl}my_orders/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })

            if (response.status === 200){
                const data = await response.json()
                if(data.length === 0){
                    setMyOrders("NONE")
                }
                setMyOrders(data)
                console.log(`SUCCESS DATA: ${JSON.stringify(data)}`)
            }
            else{
                const data = await response.json()
                alert(json.stringify(data))
                console.log(`ERROR DATA: ${json.stringify(data)}`)
            }
        }
        catch (error){
            alert(json.stringify(data))
            console.log(`ERROR: ${error}`)
        }
    }, [token])

    const getOrder =useCallback(async (id) => {
        if (!token){
            console.error("NO TOKEN")
            return;
        }
        try{
            const response = await fetch(`${backendurl}orders/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })
            if (response.status === 200){
                const data = await response.json()
                setOrder(data)
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
            const response = await fetch(`${backendurl}orders/${id}/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                }
            })
            if (response.status === 200){
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
        createOrders,
        getOrders,
        getMyOrders,
        getOrder,
        updateStatus,
        orders,
        isReady,
        myOrders,
        order
    }

    return(
        <OrderContext.Provider value={ContextData}>
            {children}
        </OrderContext.Provider>
    )
}