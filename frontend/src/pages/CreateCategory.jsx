import React, { useContext } from 'react'
import AuthContext from '../Context/Authcontext'

function CreateCategory() {
    const {user} = useContext(AuthContext)

    if (user?.role === "SUPERUSER"){
        return (
            <div>
                <div className="input-div">
                    <input type="file" className='input' name="images" accept="image/*" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" class="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                </div>
                <div class="inputBox input_add_prod">
                    <input type="text" required name='name' />
                    <span>Name</span>
                <button>Submit</button>
                </div>
            </div>
        )
    }
    else {
        return <p>Unauthorized Endpoint</p>
    }
}

export default CreateCategory
