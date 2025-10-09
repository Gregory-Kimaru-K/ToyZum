import React, { useContext, useEffect, useState } from 'react'
import Toy7 from "../assets/toy7.png"
import OrderContext from '../Context/OrderContext'

function MyOrders() {
  const [quantity, setQuantity] = useState(1)
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
        <div className='contain'>
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