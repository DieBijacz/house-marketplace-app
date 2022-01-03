import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import {FaEye} from 'react-icons/fa'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const {email, password} = formData

  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className='pageHeader'>
            Welcome Back!
          </p>
        </header>
        <main>
          <form>
            <input onChange={onChange} type="email" className='emailInput' placeholder='Email' id='email' value={email}/>
            <div className="passwordInputDiv">
              <input onChange={onChange} type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password}/>
              <FaEye onClick={() => setShowPassword((prev) => !prev)} className="showPassword" />
            </div>
            <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password?</Link>
            <div className="signInBar">
              <p className="signInText">
                Sign In
              </p>
              <button className='signInButton'>
                <ArrowRightIcon fill='#fff' width='34px' height='34px' />
              </button>
            </div>
          </form>

          {/* Google OAuth */}
          <Link to='/sign-up' className='registerLink'>Sign Up Instead</Link>
        </main>
      </div>
    </>
  )
}

export default SignIn
