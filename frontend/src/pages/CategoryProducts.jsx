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

    const handleAddToCart = (event) => {
        event.stopPropagation()
        alert("added to cart")
    }
    return (
        <div className='cat-products'>
            {products.length > 0 ?
                products.map((product, index) => {
                    const fimage = product.images && product.images.length > 0 ? product.images[0] : null;
                    return(
                        <div className='product' key={index} onClick={() => navigate(`/home/${product.id}`)}>
                            {fimage ? (
                                <img src={fimage} alt={product.name} />
                            ):
                            <p>no image found</p>
                            }
                            <p className='pname'>{product.name}</p>
                            <div onClick={(event) => handleAddToCart(event)}>
                                <ion-icon id="price-tag" name="pricetags-outline"></ion-icon>
                                <p className='cart'>Ksh. {product.price}</p>
                            </div>
                        </div>
                    )
                })
            :   <p>Nothing to see here</p>}
        </div>
    )
}

export default CategoryProducts