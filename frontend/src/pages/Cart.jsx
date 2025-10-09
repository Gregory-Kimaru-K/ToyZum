import React, { useEffect, useState } from 'react'

function Cart() {
  const [cart, setCart] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || []
    setCart(savedCart)
  }, [])

  // Remove item from cart
  const handleRemove = (id) => {
    const updatedCart = cart.filter(item => item.id !== id)
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  // Increase quantity
  const handleIncrease = (id) => {
    const updatedCart = cart.map(item => {
      if(item.id === id){
        const clamp = Math.min(item.cartQuantity + 1, item.quantity)
        return { ...item, cartQuantity: clamp }
      }
      return item
    })
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  // Decrease quantity
  const handleDecrease = (id) => {
    const updatedCart = cart
      .map(item => {
        if(item.id === id) {
          const clamp = Math.max(1, item.cartQuantity - 1)
          return { ...item, cartQuantity: clamp }
        }
        return item
      })
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const handleOnchange = (id, val) => {
    const num = parseInt(val, 10);

    if (!isNaN(num)) {
      const updatedCart = cart.map(item => {
        if (item.id === id) {
          // Clamp between 1 and product.quantity
          const clamped = Math.max(1, Math.min(num, item.quantity));
          return { ...item, cartQuantity: clamped };
        }
        return item;
      });

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  return (
    <div className='order_cart_cont'>
      {cart.length === 0 ? (
        <p>Nothing here</p>
      ) : (
        cart.map((item) => (
          <div className='contain'>
            <div className='top'>
              <img src={item.images[0]} alt='img' />
              <p>{item.name}</p>
              <div className='quantity'>
                  <button className='quantity_btn' onClick={() => handleDecrease(item.id)}>-</button>
                  <input className='quantity_display'
                  type='number'
                  onChange={(e) => handleOnchange(item.id, e.target.value)}
                  value={item.cartQuantity} />
                  <button className='quantity_btn'onClick={() => handleIncrease(item.id)}>+</button>
                </div>
                <button className='delete_btn'>Delete from cart</button>
            </div>
            <div className='price'>
              <p>Ksh. {item.cartQuantity * item.price}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Cart