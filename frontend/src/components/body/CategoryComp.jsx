import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryContext from '../../Context/CategoryContext.jsx'

function CategoryComp() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const {getCategory} = useContext(CategoryContext)

    useEffect(() => {
        async function fetchCategories () {
            const data = await getCategory()
            setCategories(data || [])
            console.log(categories)
        }

        fetchCategories()
    }, [])

    return (
        <div className='featured-cats-sec'>
            <h2>Featured Categories</h2>
            <div className='featured-cats'>
                {categories?.map?.((category, index) => (
                    <div className='cat' key={index} onClick={() => navigate(`/home/category/${category.id}`)}>
                        <img src={category.image} alt='category_image' />
                        <p>{category.name}</p>
                    </div>
                ))}
                <h1 className='add-cat' onClick={() => navigate('/home/category/create_category')}>+</h1>
            </div>
        </div>
    )
}

export default CategoryComp
