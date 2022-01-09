import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 
import {db} from '../firebase.config'
import { toast } from 'react-toastify';
import {FaEye} from 'react-icons/fa'
import OAuth from '../components/OAuth';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const {name, email, password} = formData

  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState, 
      [e.target.id]: e.target.value,
    }))
  }
  
  // DOCS  https://firebase.google.com/docs/auth/web/start?hl=en
  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      // get auth value
      const auth = getAuth()
      console.log(auth);

      // create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // update displayed name
      updateProfile(auth.currentUser, {
        displayName: name,
      })

      // copy data and removes password so its not in db
      const formDataCopy = {...formData}
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      // update and adds user to db
      await setDoc(doc(db, 'users', user.uid), formDataCopy)

      // redirect to home page
      navigate('/')
    } catch (error) {
      toast.error('Wrong Input', {
        autoClose: 3000,
        theme: 'dark',
        hideProgressBar: true,
      })
    }
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className='pageHeader'>
            Register
          </p>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <input onChange={onChange} type="text" className='nameInput' placeholder='Name' id='name' value={name}/>
            <input onChange={onChange} type="email" className='emailInput' placeholder='Email' id='email' value={email}/>
            <div className="passwordInputDiv">
              <input onChange={onChange} type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password}/>
              <FaEye onClick={() => setShowPassword((prev) => !prev)} className="showPassword" />
            </div>
            <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password?</Link>
            <div className="signUpBar">
              <p className="signUpText">
                Sign Up
              </p>
              <button className='signUpButton'>
                <ArrowRightIcon fill='#fff' width='34px' height='34px' />
              </button>
            </div>
          </form>

          {/* sign in with google */}
          <OAuth />
          <Link to='/sign-in' className='registerLink'>Sign In Instead</Link>
        </main>
      </div>
    </>
  )
}

export default SignUp
