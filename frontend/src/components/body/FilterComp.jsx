import React, { useContext, useEffect, useState } from 'react'
import IsMobileContext from '../../Context/IsMobileContext'

function FilterComp({industries, categories, filters, setFilters, setFilterDisplay}) {
    const [selectedFilters, setSelectedFilters] = useState(filters)
    const {isMobile} = useContext(IsMobileContext)

    useEffect(() => {
        console.log(selectedFilters)
    }, [selectedFilters])

    const handleSelectedFilters = (key, value) => {
        console.log(`${key}: ${value}`)
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
        if(isMobile){
            setFilterDisplay(false)
        }
        console.log(filters)
    }
  return (
    <div className='filters'>
        {isMobile && (
            <>
              <div className='cancel'>
                    <div></div>
                    <div></div>
                </div>
                <h1 style={{textAlign: "center"}}>PRODUCT FILTERS</h1>
            </>
        )}
        <div className='filt_cat'>
            <h3>GENDER</h3>
            <div>
                <p
                    className={selectedFilters.gender === "BOY" && "active"}
                    onClick={() => handleSelectedFilters("gender", "BOY")}
                >
                    BOY
                </p>
                <p
                    className={selectedFilters.gender === "GIRL" && "active"}
                    onClick={() => handleSelectedFilters("gender", "GIRL")}
                >
                    GIRL
                </p>
                <p
                    className={selectedFilters.gender === "UNISEX" && "active"}
                    onClick={() => handleSelectedFilters("gender", "UNISEX")}
                >
                    UNISEX
                </p>
            </div>
        </div>
        <div className='filt_cat'>
            <h3>INDUSTRY</h3>
            <div>
                {industries.map((ind, idx) => (
                    <p key={idx}
                        className={selectedFilters.industryId === ind.slug && "active"}
                        onClick={() => handleSelectedFilters("industryId", ind.slug)}
                    >
                        {ind.name}
                    </p>
                ))}
            </div>
        </div>
        <div className='filt_cat'>
            <h3>CATEGORIES</h3>
            <div>
                {categories.map((cat, idx) => (
                    <p key={idx}
                        className={selectedFilters.categoryId === cat.slug && "active"}
                        onClick={() => handleSelectedFilters("categoryId", cat.slug)}
                    >
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
                    <input type='number' placeholder='Min Prices' name='price_Gt'
                        onChange={(e) => setSelectedFilters((prev) => ({...prev, [e.target.name]: e.target.value}))}
                        value={selectedFilters.price_Gt} />
                </div>
                <p>-</p>
                <div>
                    <label>Ksh.</label>
                    <input type='number' placeholder='Max Prices' name='price_Lt'
                        onChange={(e) => setSelectedFilters((prev) => ({...prev, [e.target.name]: e.target.value}))}
                        value={selectedFilters.price_Lt}/>
                </div>
            </div>
        </div>
        <button className='create'
            onClick={handleSaveFilter}
        >
            SAVE
        </button>
    </div>
  )
}

export default FilterComp