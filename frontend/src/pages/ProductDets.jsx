import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function ProductDets() {
  const {productid} = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try{
        const response = await fetch(`http://127.0.0.1:8000/api/product/${productid}/`)
        if (!response.ok){
          const error = await response.json()
          console.log(error)
        }

        const data = await response.json()
        setProduct(data)

      }

      catch (error) {
        console.log(error)
      }
    }

    fetchProduct()
  },[productid])
  return (
    <div>
      {product !== null ?
      <div>
        {product.images && product.images.length > 0 ? (
          product.images.map((image, index) => (
            <img src={image} alt={product.name} key={index} style={{width: '200px'}} />
          ))
        ) : 
            <p>No images to see here</p>}
        <h4>{product.name}</h4>
        <p>{product.description}</p>
      </div>
      : <p>No Product to see</p>}
    </div>
  )
}

export default ProductDets
