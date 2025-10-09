import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryContext from '../../Context/CategoryContext'

function CategoryComp() {
    const navigate = useNavigate()
    const {categories, getCategories} = useContext(CategoryContext)

    useEffect(() => {
        if (categories.length === 0){
            getCategories()
        }
    }, [])

    return (
        <div className='featured-cats-sec'>
            <h2>Featured Categories</h2>
            <div className='featured-cats'>
                {categories?.map?.((category, index) => (
                    <div className='cat' key={index} onClick={() => navigate(`/home/products?categoryId=${category.slug}`)}>
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