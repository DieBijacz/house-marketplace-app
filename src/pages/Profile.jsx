import React, {useState} from 'react'
import {getAuth, updateProfile} from 'firebase/auth'
import {doc, updateDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import { useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })
  const {name, email} = formData

  const navigate = useNavigate()

  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }
  const onSubmit = async () => {
    try {
      if(auth.currentUser.displayName !== name){
        // Update displayName in firebase
        await updateProfile(auth.currentUser, {
          displayName: name
        })

        // Update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name: name
        })
      }
    } catch (error) {
      toast.error('Could not update profile details', {
        autoClose: 3000,
        theme: 'dark',
        hideProgressBar: true,
      })
    }
  }

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <div className="profile">
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button onClick={onLogout} type='button' className="logOut">
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p onClick={() => {
            changeDetails && onSubmit()
            setChangeDetails(prev => !prev)
          }} className="changePersonalDetails">{changeDetails ? 'done' : 'change'}</p>
        </div>
        <div className="profileCard">
          <form>
            <input onChange={onChange} type="text" id='name' value={name} className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails}/>
            {/* <input onChange={onChange} type="email" id='email' value={email} className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails}/> */}
          </form>
        </div>
      </main>
    </div>
  )
}

export default Profile
