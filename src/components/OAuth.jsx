import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

function OAuth() {
  const navigate = useNavigate()
  const location = useLocation()

  const onGoogleClick = async () => {
    try {
    // GET THE USER FROM GOOGLE SIGN IN => GIVES user
      const auth = getAuth()
      const provider = new GoogleAuthProvider()   
      // this will be promise and will give result with user  
      const result = await signInWithPopup(auth, provider)
      const user = result.user

    // CHECK IF user IS IN DB
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)

      if(!docSnap.exists()) {
        // if user doesnt exist -> create user
        // setDoc(doc(database, name of cellection, id), data to be added to DB )
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp()
        })
      }
      // once sign in go to home
      navigate('/')
    } catch (error) {
      toast.error('Could not authorize with Google')
    }

  }
  return (
    <div className='socialLogin'>
      <p>Sign {location.pathname === '/sign-up' ? 'Up' : 'In'} with</p>
      <button onClick={onGoogleClick} className='socialIconDiv'>
        <img src={googleIcon} alt="google" className='socialIconImg' />
      </button>
    </div>
  )
}

export default OAuth
