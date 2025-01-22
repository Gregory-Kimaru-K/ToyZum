import React, { useContext } from 'react'
import AuthContext from '../../Context/Authcontext'

function AddProdComp() {
    const {user} = useContext(AuthContext)
    if (localStorage.getItem("authTokens") && ['SELLER', 'SUPERUSER'].includes(user?.role)){
        return (
            <>
                <div className='add-form'>
                    <div className="input-div">
                        <input type="file" className='input' name="images" accept="image/*" multiple />
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" class="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                    </div>
                </div>
                <div className='add_prod'>
                    <div class="inputBox input_add_prod">
                        <input type="text" required name='name' />
                        <span>Name</span>
                    </div>
                    
                    <div class="inputBox input_add_prod">
                        <textarea required name='description' rows={10} cols={100}></textarea>
                        <span className='desc'>Description</span>
                    </div>

                    <div className='radio'>
                        <input type='radio' name='gender' value={'BOY'} />
                        <label>Boy</label><br/><br/>
                        <input type="radio" name='gender' value={'GIRL'} />
                        <label>Girl</label><br/><br/>
                        <input type='radio' name='gender' value={'UNISEX'} />
                        <label>Unisex</label><br/><br/>
                    </div>
                    <div className='radio'>
                    </div>
                    <button>Create Item</button>
                </div>
            </>
        )
    }

    else{
        return(<p>Unauthorized</p>)
    }
}

export default AddProdComp
