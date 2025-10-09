import React, { useContext, useEffect, useState } from 'react'
import OrderContext from '../Context/OrderContext'
import { useNavigate } from 'react-router-dom'
function OrderProducts() {
  const {isReady, getMyOrders, myOrders} = useContext(OrderContext)
  const navigate = useNavigate()
  useEffect(() => {
    if (myOrders === "NONE") return
    if(isReady){
      getMyOrders()
    }
  }, [isReady])
  return (
    <div className='order_cart_cont'>
      {myOrders.map(item => (
        <div className='contain' onClick={() => navigate(`/orders/${item.slug}`)}>
          <div className='top'>
            <img src={item.product.images[0]} alt='img' />
            <p>{item.client.phone_number}</p>
            <div className='quantity'>
              <p>Quantity: {item.ordered_quantity}</p>
            </div>
            <button className='delete_btn'>{item.status}</button>
          </div>
          <p className='price'>ksh. {item.product.price * item.ordered_quantity}</p>
        </div>
      ))}
    </div>
  )
}

export default OrderProducts