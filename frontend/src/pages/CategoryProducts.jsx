import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function CategoryProducts() {
    const {categoryid} = useParams()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])

    useEffect(() => {
        async function fetchProducts(){
            try{
                const response = await fetch(`http://127.0.0.1:8000/api/product/?category=${categoryid}`)
                if (!response.ok){
                    const error =await response.json()
                    throw new Error(error.error || 'Failed to fetch!')
                }

                const data = await response.json()
                setProducts(data)
            }

            catch (error) {
                console.log("ERROR", error)
                setProducts([])
            }
        }

        fetchProducts()
    }, [categoryid])
    return (
        <div>
            {products.length > 0 ?
                products.map((product, index) => {
                    const fimage = product.images && product.images.length > 0 ? product.images[0] : null;
                    return(
                        <div key={index} onClick={() => navigate(`/home/${product.id}`)}>
                            {fimage ? (
                                <img src={fimage} alt={product.name} style={{width: "200px"}} />
                            ):
                            <p>no image found</p>}
                            <h4>{product.name}</h4>
                            <p>{product.description}</p>
                        </div>
                    )
                })
            :   <p>Nothing to see here</p>}
        </div>
    )
}

export default CategoryProducts