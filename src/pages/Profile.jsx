import React, {useState, useEffect} from 'react'
import {getAuth} from 'firebase/auth'

function Profile() {
  const [user, setUser] = useState(null)
  const auth = getAuth()

  useEffect(() => {
    console.log(auth.currentUser);
    setUser(auth.currentUser)
    console.log(user);
  },[])

  return (
    <div>
      {user ? <h1>{user.displayName}</h1> : <h1>Not Logged In</h1>}
    </div>
  )
}

export default Profile
