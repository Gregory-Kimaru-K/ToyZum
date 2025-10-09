import { createContext, useEffect, useState } from "react"
import backendurl from "../constants/constants";

const CategoryContext = createContext()

export default CategoryContext;

export const CategoryProvider = ({ children }) => {
    const [token, setToken] = useState(null)
    const [categories, setCategories] = useState([])
    const [industries, setIndustries] = useState([])

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

    const getCategories = async() => {
        try {
            const response = await fetch(`${backendurl}toyzum/graphql/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query:
                        `
                        query {
                            allCategories {
                                id
                                name
                                slug
                                image
                                industry {
                                    id
                                    name
                                    slug
                                }
                            }
                        }
                        `
                })
            })
            if (response.status === 200){
                const result = await response.json()
                setCategories(result.data.allCategories)
            }
        }

        catch(error){
            alert(error instanceof Error? error.message : "Network Error")
        }
    }

     const getIndustries = async() => {
        try {
            const response = await fetch(`${backendurl}toyzum/graphql/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query:
                        `
                        query {
                            allIndustries {
                                id
                                name
                                image
                                slug
                            }
                        }
                        `
                })
            })
            if (response.status === 200){
                const result = await response.json()
                setIndustries(result.data.allIndustries)
            }
        }

        catch(error){
            alert(error instanceof Error? error.message : "Network Error")
        }
    }

    const createCategory = async (FormData) => {
        try{
            const response = await fetch(`${backendurl}category/new/`, {
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
    const updateCategory = (id, FormData) => {}
    const deleteCategory = (id) => {}

    const contextData = {
        createCategory: createCategory,
        updateCategory: updateCategory,
        deleteCategory: deleteCategory,
        getCategories,
        categories,
        getIndustries,
        industries
    }

    return(
        <CategoryContext.Provider value={contextData}>
            {children}
        </CategoryContext.Provider>
    )
}