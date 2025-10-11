import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import OrderContext from '../Context/OrderContext';
import AuthContext from '../Context/AuthContext';

function OrderDets() {
  const { orderid } = useParams()
  const {user} = useContext(AuthContext)
  const { getOrder, isReady, order } = useContext(OrderContext)

  useEffect(() => {
    if (isReady) {
      getOrder(orderid)   // 👈 pass orderid to fetch the right order
    }
  }, [orderid, isReady])

  if (!order) {
    return <p>Loading order...</p>
  }

  return (
    <div className='prod-dets'>
      <div className='image-pagenation'>
        <Swiper
          key={order.id}
          modules={[Navigation, Pagination]}
          navigation
          slidesPerView={1}
          spaceBetween={0}
          pagination={{
            el: ".pagination",
            clickable: true,
            renderBullet: (index, classname) => {
              if (!order.product?.images) {
                return `<span class="${classname}">•</span>`;
              }
              return `<img class="${classname}" src="${order.product.images[index]}" style="width:40px; height:40px; border-radius:5px;" />`;
            }
          }}
          className='image-sec'
          loop={true}
          loopedSlides={order.product?.images?.length || 1}
          observer={true}
          observeParents={true}
        >
          {order.product?.images && order.product.images.length > 0 ? (
            order.product.images.map((image, index) => (
              <SwiperSlide className='img-div' key={index}>
                <img src={image} alt={order.product.name} />
              </SwiperSlide>
            ))
          ) : (
            <p>No images</p>
          )}
        </Swiper>
        <div className='pagination'></div>
      </div>
      <div className='details'>
        <div className='dets'>
          <div className='dets-1'>
            <p className='name'>{order.client.phone_number}</p>
            <p className='desc'>{order.product.description}</p>
          </div>
          <div className='dets-2'>
            <span>
              <label>Price</label>
              <p>Ksh. {order.product.price * order.ordered_quantity}</p>
            </span>
            <span>
              <label>Quantity</label>
              <p>{order.ordered_quantity}</p>
            </span>
            <span>
              <label>Gender</label>
              <p>{order.product.gender}</p>
            </span>
          </div>
          <iframe
            title="Google Maps"
            src={`https://www.google.com/maps?q=${order.latitude},${order.longitude}&hl=es;z=14&output=embed`}
            width="100%"
            height="400px"
            style={{
              border: "none",
              filter: "invert(90%) hue-rotate(180deg)",
              padding: "20px 0"
            }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
          <div className='final'>
            <button>
              Cancel Order
            </button>
            <button>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDets
