import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../../Context/Authcontext'
import CategoryContext from '../../Context/CategoryContext'
import ProductContext from '../../Context/ProductContext'

function AddProdComp() {
    const {user} = useContext(AuthContext)
    const {getCategory} = useContext(CategoryContext)
    const [categories, setCategories] = useState([])
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({})
    const {createProduct} = useContext(ProductContext)

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategory()
            setCategories(data)
            console.log(categories)
        }
        fetchCategories()
    }, [getCategory])

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

    const handleSubmit = () => {
        createProduct(formData)
    }

    if (localStorage.getItem("authTokens") && ['SELLER', 'SUPERUSER'].includes(user?.role)){
        return (
            <div className='add-product'>
                {step === 1 && (
                    <div className='step-container'>
                        <div className='preview image'>
                            {formData.images?.map((image, key) => <img src={image} alt='preview' key={key} style={{width: '200px'}} />)}
                        </div>

                        <div className="input-div">
                            <input type="file" className='input' name="images" accept="image/*" multiple onChange={handleFileChange} />
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" class="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                        </div>
                        <div>
                            <button onClick={() => setStep(2)}>Next</button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="step-container">
                        <div className="inputBox input_add_prod">
                            <input type="text" required name='name' onChange={handleInputChange} />
                            <span>Name</span>
                        </div>

                        <div className="inputBox input_add_prod">
                            <textarea required name='description' rows={10} cols={100} onChange={handleInputChange}></textarea>
                            <span className='desc'>Description</span>
                        </div>
                        <button onClick={() => setStep(1)}>Previous</button>
                        <button onClick={() => setStep(3)}>Next</button>
                    </div>
                )}
                {step === 3 && (
                    <div className="step-container">
                        <div className='radio'>
                            <input type='radio' name='gender' value={'BOY'} onChange={handleInputChange} />
                            <label>Boy</label><br/><br/>
                            <input type="radio" name='gender' value={'GIRL'} onChange={handleInputChange} />
                            <label>Girl</label><br/><br/>
                            <input type='radio' name='gender' value={'UNISEX'} onChange={handleInputChange} />
                            <label>Unisex</label><br/><br/>
                        </div>

                        <div className='radio'>
                            {categories.map((category) => (
                                <div key={category.id}>
                                    <input type='radio' name='category' value={category.id} onChange={handleInputChange} />
                                    <label>{category.name}</label>
                                </div>
                            ))}
                        </div>

                        <div className="inputBox input_add_prod">
                            <input type="number" required name='quantity' onChange={handleInputChange} />
                            <span>Quantity</span>
                        </div>

                        <div className="inputBox input_add_prod">
                            <input type="number" required name='price' onChange={handleInputChange} step='0.01' />
                            <span>Price</span>
                        </div>
                        <button onClick={() => setStep(2)}>Previous</button>
                        <button onClick={handleSubmit}>Create Item</button>
                    </div>
                )}
                <div className='add_prod'>                    
                   
                </div>
            </div>
        )
    }

    else{
        return(<p>Unauthorized</p>)
    }
}

export default AddProdComp
