import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthContext from '../../Context/AuthContext'
import CategoryContext from '../../Context/CategoryContext'
import ProductContext from '../../Context/ProductContext'
import { SwiperSlide, Swiper } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

function AddProdComp() {
    const {user} = useContext(AuthContext)
    const {getCategories, categories, industries, getIndustries} = useContext(CategoryContext)
    const [formData, setFormData] = useState({})
    const {createProduct} = useContext(ProductContext)
    const [selectedIndustry, setSelectedIndustry] = useState(null)
    const imageInput = useRef(null)

    useEffect(() => {
        if (categories.length === 0){
            getCategories()
        }
        if (industries.length === 0){
            getIndustries()
        }
    }, [])

    useEffect(() => {
        console.log(formData)
    }, [formData])

    const handleFileChange = (event) => {
        const files = event.target.files;
        const base64Images = []

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                base64Images.push(reader.result)

                if (base64Images.length === files.length) {
                    setFormData((prev) => ({...prev, images: base64Images}))
                }
            }
        })
    }
    
    const handleInputChange = (event) => {
        const {name, value} = event.target
        setFormData((prev) => ({...prev, [name]: value}))
    }

    const handleFileInput = () => {
        imageInput.current.click()
    }

    const handleSubmit = () => {
        createProduct(formData)
    }

    if (localStorage.getItem("authTokens") && ['SELLER', 'SUPERUSER'].includes(user?.role)){
        return (
            <div id='add_prod'>
                {formData.images ?
                    <Swiper
                        modules={[Navigation, Pagination]}
                        pagination={{clickable: true}}
                        navigation
                        loop={true}
                        className='add_imgs'
                        slidesPerView={1}
                        spaceBetween={3}
                    >
                        {formData.images &&
                            formData.images.map((img, idx) => (
                                <SwiperSlide
                                    className='img_cont'
                                    onClick={handleFileInput}
                                    >
                                    <img src={img} key={idx} />
                                </SwiperSlide>
                            ))}
                    </Swiper>
                    :
                    <div className='img_select' onClick={handleFileInput}>
                        <ion-icon name="image-outline" id="img_out"></ion-icon>
                        <p>Select Image</p>
                    </div>
                }
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={imageInput}
                    style={{display: "none"}}
                    onChange={handleFileChange}  />
                <div className='inputs'>
                    <h1>PRODUCT DETAILS</h1>
                    <div class="inputBox1">
                        <input type="text" required name='text' />
                        <span class="user">Product Name</span>
                    </div>
                    <div className='add_desc'>
                        <textarea
                            rows={5}
                            required
                        ></textarea>
                        <span className='desc'>Description</span>
                    </div>
                    <div class="inputBox1">
                        <input type="number" required name='number' />
                        <span class="user">price</span>
                    </div>
                    <div class="inputBox1">
                        <input type="number" required name='number' />
                        <span class="user">discount</span>
                    </div>
                    <div className='ind_category'>
                        <h2>GENDER</h2>
                        <div>
                            <p 
                                className={formData.gender === "BOY" && "active"}
                                onClick={() => setFormData((prev) => ({...prev, gender: "BOY"}))}>
                                BOY
                            </p>
                            <p 
                                className={formData.gender === "GIRL" && "active"}
                                onClick={() => setFormData((prev) => ({...prev, gender: "GIRL"}))}
                            >
                                GIRL
                            </p>
                            <p 
                                className={formData.gender === "UNISEX" && "active"}
                                onClick={() => setFormData((prev) => ({...prev, gender: "UNISEX"}))}
                            >
                                UNISEX
                            </p>
                        </div>
                    </div>
                    <div className='ind_category'>
                        <h2>PRODUCT INDUSTRY</h2>
                        <div>
                            {industries.map((ind, idx) => (
                                <p 
                                    key={idx}
                                    className={selectedIndustry === ind.id && "active"}
                                    onClick={() => setSelectedIndustry(ind.id)}>
                                    {ind.name}
                                </p>
                            ))}
                        </div>
                    </div>
                    {selectedIndustry && (
                        <div className='ind_category'>
                            <h2>PRODUCT CATEGORY</h2>
                            <div>
                                {categories.filter(cat => cat.industry.id === selectedIndustry)
                                .map((cat, idx) => (
                                    <p
                                        key={idx}
                                        className={formData.category === cat.id && "active"}
                                        onClick={() => setFormData((prev) => ({...prev, category: cat.id}))}>
                                        {cat.name}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                    <button className='create'>
                        CREATE
                    </button>
                </div>
            </div>
        )
    }

    else{
        return(<p>Unauthorized</p>)
    }
}

export default AddProdComp
