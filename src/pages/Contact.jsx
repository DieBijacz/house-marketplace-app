import React, {useState, useEffect} from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import {toast} from 'react-toastify'

function Contact() {
  const [message, setMessage] = useState('')
  const [landLord, setLandLord] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useParams()

  useEffect(() => {
    const getLandLord = async() => {
      // create docRef with database, collection name, and id comming from url
      const docRef = doc(db, 'users', params.landLordId)
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()) {
        setLandLord(docSnap.data())
      } else {
        toast.error('Could not get Landlord contact')
      }
    }
    getLandLord()
  }, [params.landLordId])

  const onChange = (e) => {
    setMessage(e.target.value)
  }

  return (
    <div className='pageContainer'>
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>

      {landLord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">
              {landLord?.name}
            </p>
          </div>

{/* FORM */}
          <form className='messageForm'>
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message:
              </label>
              <textarea onChange={onChange} className='textarea' value={message} name="message" id="message">

              </textarea>
            </div>
            {/* <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className='primaryButton'> from Listing.jsx*/}
            <a href={`mailto:${landLord.email}?Subject=${searchParams.get('listingName')}&body=${message}`}>
              <button type='button' className='primaryButton'>Send Message</button>
            </a>
          </form>
        </main>
      )}
    </div>
  )
}

export default Contact
