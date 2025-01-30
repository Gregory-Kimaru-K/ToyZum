import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryContext from '../Context/CategoryContext'

function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const {getCategory} = useContext(CategoryContext)

  useEffect(() => {
    async function fetchCategories () {
      const data = await getCategory()
      setCategories(data)
      console.log(categories)
    }

    fetchCategories()
  }, [getCategory])

  return (
    <div>
        <div>
          {categories.map((category, index) => (
            <div key={index} onClick={() => navigate(`/home/category/${category.id}`)}>
              <img src={category.image} alt='category_image' style={{width: '200px'}} />
              <p>{category.name}</p>
            </div>
          ))}
          <h1 onClick={() => navigate('/home/category/create_category')}>+++</h1>
        </div>
    </div>
  )
}

export default Home