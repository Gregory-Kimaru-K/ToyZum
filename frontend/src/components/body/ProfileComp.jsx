import React, { useContext } from 'react'
import AuthContext from '../../Context/Authcontext'

function ProfileComp() {
    const {user, logoutUser} = useContext(AuthContext)

    const handleLogoutUser = () => {
        logoutUser();
    };

    if (!user) {
        return <p>User information is not available. Please log in.</p>;
    }

    return (
        <div>
            <p><strong>First Name: </strong>{user.first_name}</p>
            <p><strong>Last Name: </strong>{user.last_name}</p>
            <p><strong>Email: </strong>{user.email}</p>
            <p><strong>Phone Number: </strong>{user.phone_number}</p>
            <button onClick={handleLogoutUser}>Log Out</button>
        </div>
    )
}

export default ProfileComp