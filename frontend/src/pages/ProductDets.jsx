import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import LocationOrder from '../components/body/LocationOrder';
import backendurl from '../constants/constants';
import AuthContext from '../Context/AuthContext';

function ProductDets() {
  const {productid} = useParams()
  const {user} = useContext(AuthContext)
  const navigate = useNavigate()
  const [product, setProduct] = useState({})
  const [inCart, setInCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [myLocation, setMyLocation] = useState({
    latitude: -1.2921,
    longitude: 36.8219
  })
  const [orderLocation, setOrderLocation] = useState(false)

  useEffect(() => {
  if (orderLocation) {
    // Disable scrolling
    document.body.style.overflow = 'hidden'
  } else {
    // Enable scrolling again
    document.body.style.overflow = 'auto'
  }

  // Cleanup when component unmounts
  return () => {
    document.body.style.overflow = 'auto'
  }
}, [orderLocation])


  useEffect(() => {
    const getProduct = async() => {
      try{
        const response = await fetch(`${backendurl}product/view/${productid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (response.status === 200){
          const data = await response.json()
          setProduct(data)
          // ✅ check if product is already in cart
          const cart = JSON.parse(localStorage.getItem("cart")) || []
          const exists = cart.find(item => item.id === data.id)
          if (exists) setInCart(true)
        } else {
          const data = await response.json()
          alert(JSON.stringify(data))
        }
      } catch (error){
        alert(error instanceof Error ? error.message : "Network error")
      }
    }
    getProduct()
  }, [productid])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get("quantity");

    if (q) {
      const qty = parseInt(q);
      if (!isNaN(qty) && qty > 0) {
        setQuantity(qty);
        setOrderLocation(true);
      }
    }
  }, []);


  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    if (!product || inCart) return

    const cart = JSON.parse(localStorage.getItem("cart")) || []

    // Add new product only once
    cart.push({...product, cartQuantity: quantity})

    localStorage.setItem("cart", JSON.stringify(cart))
    setInCart(true) // ✅ mark as added
    alert(`${product.name} added to cart!`)
  }

  const onChangeQuantity = (value) => {
    let num = parseInt(value)
    if (isNaN(value)){
      num=1
    } else if(num < 1){
      num = 1
    } else if(product && num > product.quantity){
      num = product.quantity
    }
    setQuantity(num)
  }

  const onIncrease = () => {
    setQuantity((prev)=> Math.min(prev + 1, product.quantity))
  }

  const onDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleLocation = () => {
    if (user) {
      setOrderLocation(true)
      return
    }
    const nextUrl = encodeURIComponent(`/home/${productid}?quantity=${quantity}`)
    navigate(`/auth/login?next=${nextUrl}`)
  }

  return (
    <>
      <div className='prod-dets'>
        <div className='image-pagenation'>
          <Swiper
            key={product?.id}
            modules={[Navigation, Pagination]}
            navigation
            slidesPerView={1}
            spaceBetween={0}
            pagination={{
              el: ".pagination",
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
            loopedSlides={product?.images?.length || 1}
            observer={true}
            observeParents={true}
          >
            {product ? 
              product.images && product.images.length > 0 ? 
                product.images.map((image, index) => (
                  <SwiperSlide className='img-div' key={index}>
                    <img src={image} alt={product.name} />
                  </SwiperSlide>
                ))
                : <p>No images</p>
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
              <div className='quantity'>
                <button className='quantity_btn' onClick={onDecrease}>-</button>
                <input 
                  className='quantity_display'
                  type='number'
                  onChange={(e) => onChangeQuantity(e.target.value)}
                  value={quantity} />

                <button className='quantity_btn' onClick={onIncrease}>+</button>
              </div>
              <div className='final'>
                <button 
                  onClick={handleAddToCart} 
                  disabled={inCart}
                  style={inCart ? { background: "grey", cursor: "default" } : {}}
                >
                  {inCart ? "Already in Cart" : "Add To Cart"}
                </button>
                <button onClick={handleLocation}>
                  Order Product
                </button>
              </div>

            </div>
            : <p>No Product</p>}
        </div>
      </div>
      {orderLocation &&
        <div className='order_location'>
          <LocationOrder setOrderLocation={setOrderLocation} quantity={quantity} setMyLocation={setMyLocation} myLocation={myLocation} />
        </div>
      }
    </>
  )
}

export default ProductDets