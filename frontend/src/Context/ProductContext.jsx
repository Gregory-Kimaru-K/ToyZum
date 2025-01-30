import { createContext, useEffect, useState } from "react";

const ProductContext = createContext()

export default ProductContext;

export const ProductProvider = ({children}) => {
    const [tokens, setTokens] = useState(null)
    useEffect(() => {
        try {
            const tokenData = localStorage.getItem('authTokens')

            if (tokenData !== null) {
                const parsedTokens = JSON.parse(tokenData)
                setTokens(parsedTokens.access)
                console.log(tokens)
            }
            else {
                console.log('Token not found')
            }
        }

        catch (error) {
            console.log(error)
        }
    }, [])


    const createProduct = async (formData) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/product/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokens}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.status === 201) {
                const data = await response.json()
                console.log("Success", data)
            }

            else {
                const data = await response.json()
                console.log("Fail", data)
            }
        }
        catch (error) {
            console.log("ERROR", error)
        }
    }


    const getProducts = async () => {}
    const updateProduct = async (id, FormData) => {}
    const deleteProduct = async (id, FormData) => {}
    const contextData = {
        createProduct: createProduct,
        getProducts: getProducts,
        updateProduct: updateProduct,
        deleteProduct: deleteProduct
    }
    return(
        <ProductContext.Provider value={contextData}>
            {children}
        </ProductContext.Provider>
    )
}