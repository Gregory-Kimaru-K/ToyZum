import React, { useState } from 'react'

function FilterComp({industries, categories, filters, setFilters, setFilterDisplay}) {
    const [selectedFilters, setSelectedFilters] = useState(filters)

    const handleSelectedFilters = (key, value) => {
        setSelectedFilters((prev) => {
            if (prev[key] === value){
                const update = {...prev}
                delete update[key]
                return update
            }
            return {...prev, [key]: value}
        })

    }
    const handleSaveFilter = () => {
        setFilters(selectedFilters)
        console.log(filters)
    }
  return (
    <div className='filters'>
        <div className='filt_cat'>
            <h3>GENDER</h3>
            <div>
                <p>BOY</p>
                <p>GIRL</p>
                <p>UNISEX</p>
            </div>
        </div>
        <div className='filt_cat'>
            <h3>INDUSTRY</h3>
            <div>
                {industries.map((ind, idx) => (
                    <p key={idx}>
                        {ind.name}
                    </p>
                ))}
            </div>
        </div>
        <div className='filt_cat'>
            <h3>CATEGORIES</h3>
            <div>
                {categories.map((cat, idx) => (
                    <p key={idx}>
                        {cat.name}
                    </p>
                ))}
            </div>
        </div>
        <div className='prices_input'>
            <h3>PRICES</h3>
            <div className='prices'>
                <div>
                    <label>Ksh.</label>
                    <input type='number' placeholder='Min Prices' />
                </div>
                <p>-</p>
                <div>
                    <label>Ksh.</label>
                    <input type='number' placeholder='Max Prices' />
                </div>
            </div>
        </div>
        <button className='create'>
            SAVE
        </button>
    </div>
  )
}

export default FilterComp