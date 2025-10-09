import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CategoryContext from '../Context/CategoryContext'
import FilterComp from '../components/body/FilterComp'
import backendurl from '../constants/constants'
import IsMobileContext from '../Context/IsMobileContext'

function CategoryProducts() {
    const {isMobile} = useContext(IsMobileContext)
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const [products, setProducts] = useState([])
    const {industries, categories, getIndustries, getCategories} = useContext(CategoryContext)

    const [filters, setFilters] = useState({
        categoryId: params.get("categoryId") || null,
        industryId: params.get("industryId") || null,
        price_Lt: params.get("price_Lt") || null,
        price_Gt: params.get("price_Gt") || null,
        gender: params.get("gender") || null,
        sellerEmail: params.get("sellerEmail") || null
    })

    useEffect(() => {
        setFilters({
            categoryId: params.get("categoryId") || null,
            industryId: params.get("industryId") || null,
            price_Lt: params.get("price_Lt") || null,
            price_Gt: params.get("price_Gt") || null,
            gender: params.get("gender") || null,
            sellerEmail: params.get("sellerEmail") || null
        })
    }, [location.search])

    const [filterDisplay, setFilterDisplay] = useState(false)

    useEffect(() => {
        const qs = new URLSearchParams()
        Object.entries(filters).forEach(([key, val]) => {
            if (val) qs.set(key, val)
        })
        navigate(`/home/products?${qs.toString()}`, {replace: true})
    }, [filters])
    useEffect(() => {
        async function fetchProducts(){
            try{
                const query = `
                    query getProducts(
                        $categoryId: String
                        $industryId: String
                        $sellerEmail: String
                        $price_Lt: Decimal
                        $price_Gt: Decimal
                        $gender: ApiToyzumAppProductGenderChoices
                    ) {
                        allProducts(
                            category_Slug: $categoryId
                            category_Industry_Slug: $industryId
                            price_Lt: $price_Lt
                            price_Gt: $price_Gt
                            gender: $gender
                            seller_Email: $sellerEmail
                        ) {
                            edges {
                                node {
                                    id
                                    name
                                    price
                                    slug
                                    images
                                    quantity
                                    gender
                                    description
                                    category {
                                        id
                                        name
                                    }
                                }
                            }
                        }
                    }
                `
                const response = await fetch(`${backendurl}toyzum/graphql/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query, variables: filters })
                })
                const result = await response.json()

                if (result.errors) {
                    console.log("GraphQL errors: ", result.errors)
                    setProducts([])
                    return
                }
                const fetchedProducts = result.data.allProducts.edges.map(edge => edge.node)
                setProducts(fetchedProducts)
            } catch (error) {
                console.log("ERROR", error)
                setProducts([])
            }
        }

        if (categories.length === 0){
            getCategories()
        }
        if (industries.length === 0){
            getIndustries()
        }
        fetchProducts()
    }, [filters])

    return (
        <div style={{ width: "100%"}}>
            {isMobile && 
                <button
                    className='filter_btn'
                    onClick={() => setFilterDisplay(true)}>
                        <ion-icon name="funnel-outline"></ion-icon> Funnel
                </button>
            }
            {/* PRODUCTS */}
            <div className='cat-products'>
                {!isMobile ?(
                    <FilterComp filters={filters} setFilters={setFilters} categories={categories} industries={industries} setFilterDisplay = {setFilterDisplay} />
                ):(
                    filterDisplay === true && (
                        <FilterComp filters={filters} setFilters={setFilters} categories={categories} industries={industries} setFilterDisplay = {setFilterDisplay} />
                    )
                )}
                <div className='products_cont'>
                    {products.length > 0 ?
                        products.map((product, index) => {
                            const fimage = product.images && product.images.length > 0 ? product.images[0] : null;
                            return(
                                <div className='product' key={index} onClick={() => navigate(`/home/${product.slug}`, {state: {product}})}>
                                    {fimage ? (
                                        <img src={fimage} alt={product.name} />
                                    ):
                                    <p>No image found</p>
                                    }
                                    <p className='pname'>{product.name}</p>
                                    <div className='price_cont'>
                                        <p className='cart'>Ksh. {product.price}</p>
                                    </div>
                                </div>
                            )
                        })
                    :   <p>Nothing to see here</p>}
                </div>
            </div>
        </div>
    )
}

export default CategoryProducts