import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

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

  const handleAddToCart = () => {
  }
  return (
    <div className='prod-dets'>
      <div className='image-pagenation'>
        <Swiper
          key={product?.id} // Ensures reinitialization when product changes
          modules={[Navigation, Pagination]}
          navigation
          slidesPerView={1}
          spaceBetween={0}
          pagination = {{el: ".pagination",
            clickable: true,
            renderBullet: (index, classname) => {
              if (!product || !product.images) {
                return `<span class="${classname}">•</span>`;
              }
              return `<img class="${classname}" src="${product.images[index]}" style="width:40px; height:40px; border-radius:5px;" />`;
            }
            }}
          className='image-sec'
          loop={true}
          loopedSlides={product?.images?.length || 1} // Ensures Swiper properly loops through images
          observer={true} // Watches for DOM changes
          observeParents={true} // Ensures parent changes are observ
        >
          {product ? 
            product.images && product.images.length > 0 ? 
              product.images.map((image, index) => (
                <SwiperSlide className='img-div' key={index}>
                  <img src={image} alt={product.name} />
                </SwiperSlide>
              ))
              :<p>No images</p>
          : <p>No Product</p>}
        </Swiper>
        <div className='pagination'></div>
      </div>
      <div className='details'>
        {product ?
          <div className='dets'>
            <div className='dets-1'>
              <p className='name'>{product.name}</p>
              <p className='desc'>{product.description}</p>
            </div>
            <div className='dets-2'>
              <span>
                <label>Price</label>
                <p>Ksh. {product.price}</p>
              </span>
              <span>
                <label>Quantity</label>
                <p>{product.quantity}</p>
              </span>
              <span>
                <label>Gender</label>
                <p>{product.gender}</p>
              </span>
            </div>
            <button>
              Add To Cart
            </button>
          </div>
          : <p>No Product</p>}
      </div>
    </div>
  )
}

export default ProductDets
