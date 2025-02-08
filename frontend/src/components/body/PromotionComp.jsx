import React, { useContext } from 'react';
import CategoryContext from '../../Context/CategoryContext';
import { useNavigate } from 'react-router-dom';

function PromotionComp() {
    const {categories} = useContext(CategoryContext)
    const navigate = useNavigate()
    return (
        <div className='prom'>
            <div className='prom-cat'>
                {categories.map((category, index) => (
                    <div className='cat' key={index} onClick={() => navigate(`/home/category/${category.id}`)}>
                        <p>{category.name}</p>
                    </div>
                ))}
            </div>
            <div className='trending-prod'>
            </div>
            <div className='quick-sale'></div>
       </div>
    )
}

export default PromotionComp