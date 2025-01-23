import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  return (
    <div>
        <div onClick={() => navigate('/home/category/create_category')}>
          <h1>+++</h1>
        </div>
    </div>
  )
}

export default Home