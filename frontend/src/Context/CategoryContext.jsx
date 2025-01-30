import { createContext, useEffect, useState } from "react"

const CategoryContext = createContext()

export default CategoryContext;

export const CategoryProvider = ({ children }) => {
    const [token, setToken] = useState(null)

    useEffect(() => {
        try {
            const tokenData = localStorage.getItem('authTokens')

            if (tokenData !== null){
                const parsedToken = JSON.parse(tokenData)
                setToken(parsedToken.access)
            }

            else {
                console.log('Token not found')
            }
        }

        catch (error) {
            console.log(error)
        }
    }, [])

    const createCategory = async (FormData) => {
        try{
            const response = await fetch('http://127.0.0.1:8000/api/category/new_category/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(FormData)
            })

            if (response.status === 200) {
                const data = await response.json()
                console.log(data)
            }
            else {
                const data = await response.json()
                console.log("Errror else",data)
            }
        }
        catch (error) {
            console.log(error)
        }
    }
    const getCategory = async () => {
        try{
            const response = await fetch('http://127.0.0.1:8000/api/category/')
            if (response.ok){
                const data = await response.json()
                console.log(data)
                return data
            }

            else {
                const data = await response.json()
                console.log(data)
                return data
            }
        }

        catch (error) {
            console.log(error);
        }
    }
    const updateCategory = (id, FormData) => {}
    const deleteCategory = (id) => {}

    const contextData = {
        createCategory: createCategory,
        updateCategory: updateCategory,
        deleteCategory: deleteCategory,
        getCategory: getCategory
    }

    return(
        <CategoryContext.Provider value={contextData}>
            {children}
        </CategoryContext.Provider>
    )
}