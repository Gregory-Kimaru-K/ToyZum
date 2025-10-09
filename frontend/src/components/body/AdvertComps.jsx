import React, { useEffect, useRef, useState } from 'react'
import backendurl from '../../constants/constants'

function AdvertComps() {
    const fileInput = useRef(null)
    const [formData, setFormData] = useState({})

    useEffect(() => {
        console.log(formData)
    }, [formData])

    const handleFileInput = () => {
        fileInput.current.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData((prev) => ({...prev, file_type: file.type}))
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData((prev) => ({...prev, [e.target.name]: reader.result}))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async() => {
        try{
            const response = await fetch(`${backendurl}advert/new/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (response.status === 201){
                const res = await response.json()
                const data = JSON.stringify(res)
                alert(`success: ${data}`)
            } else {
                const res = await response.json()
                const data = JSON.stringify(res)
                alert(`Failure: ${data}`)
            }
        } catch (error) {
            alert(error instanceof Error ? JSON.stringify(error) : "Network error")
        }
    }

  return (
    <div className='advert'>
        <h1>CREATE ADVERT</h1>
        <div className='advert_add' onClick={handleFileInput}>
            {formData.image ? (
                (formData.file_type?.startsWith('image/') && !formData.file_type?.includes('gif') && (
                    <img
                        src={formData.image}
                        alt="Preview"
                        className='img'
                    />
                )) ||
                (formData.file_type?.includes('gif') && (
                    <img
                        src={formData.image}
                        alt="GIF Preview"
                        className='img'
                    />
                )) ||
                (formData.file_type?.startsWith('video/') && (
                    <video
                        src={formData.image}
                        autoPlay loop muted
                        className='img'
                    />
                ))
            ) : (
                <ion-icon id="img_outline" name="image-outline"></ion-icon>
            )}
            <input
                type='file'
                accept="image/*,video/*,.gif"
                ref={fileInput}
                name='image'
                style={{display: "none"}}
                onChange={handleFileChange}
            />
        </div>
        <div className="inputBox1">
            <input
                type="text"
                required
                name='url'
                onChange={(e) => setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))}
            />
            <span className="user">Url To Point To</span>
        </div>
        <div className='position_choices'>
            <p
                onClick={() => setFormData((prev) => ({...prev, place: "SIDE"}))}
                className={formData?.place === "SIDE" ? "active" : ""}
            >Side</p>
            <p
                onClick={() => setFormData((prev) => ({...prev, place: "MAIN"}))}
                className={formData?.place === "MAIN" ? "active" : ""}
            >Main</p>
        </div>
        <button
            className="enter"
            onClick={handleSubmit}
            >CREATE</button>
    </div>
  )
}

export default AdvertComps