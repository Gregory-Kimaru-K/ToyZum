import React, { useContext, useState } from 'react';
import AuthContext from '../Context/Authcontext';

function CreateCategory() {
    const { user } = useContext(AuthContext);
    const [FormData, setFormData] = useState({
        name: '',
        image: null,
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    image: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        console.log('Formdata: ', FormData);
    };

    if (user?.role === 'SUPERUSER') {
        return (
            <div>
                <div className="display_image">
                    {FormData.image && (
                        <img
                            src={FormData.image}
                            alt="Preview"
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                    )}
                </div>
                <div className="input-div">
                    <input
                        type="file"
                        className="input"
                        name="images"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="icon"
                    >
                        <polyline points="16 16 12 12 8 16"></polyline>
                        <line y2="21" x2="12" y1="12" x1="12"></line>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                        <polyline points="16 16 12 12 8 16"></polyline>
                    </svg>
                </div>
                <div className="inputBox input_add_prod">
                    <input
                        type="text"
                        required
                        name="name"
                        onChange={handleInputChange}
                    />
                    <span>Name</span>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        );
    } else {
        return <p>Unauthorized Endpoint</p>;
    }
}

export default CreateCategory;
