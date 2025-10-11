import React, { useContext, useEffect } from 'react'
import OrderContext from '../Context/OrderContext'
import { useNavigate } from 'react-router-dom'

function MyOrders() {
  const navigate = useNavigate()
  const {orders, getOrders, isReady} = useContext(OrderContext)
  useEffect(() => {
    if (isReady){
      if (orders === "NONE") return
      if (orders.length === 0){
        getOrders()
      }
    }
  }, [isReady])
  return (
    <div className='order_cart_cont'>
      {orders.map(item => (
        <div className='contain' onClick={() => navigate(`/orders/${item.slug}`)}>
          <div className='top'>
            <img src={item.product.images[0]} alt='img' />
            <p>{item.product.name}</p>
            <div className='quantity'>
              <p>Quantity: {item.ordered_quantity}</p>
            </div>
            <button className='delete_btn'>{item.status}</button>
          </div>
          <p className='price'>ksh. {item.ordered_quantity * item.product.price}</p>
        </div>
      ))}
      
    </div>
  )
}

export default MyOrders