import React, {useState, useEffect, useRef} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {useNavigate} from 'react-router-dom'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'

function CreateListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    imageUrls: [],
    latitude: 0,
    longitude: 0,
  })

  const {type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, imageUrls, latitude, longitude} = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  const onSubmit = (e) => {
    e.preventDefault()
  }
  
  const onMutate = (e) => {
    // boolean
    let boolean = null
    if(e.target.value === 'true') {
      boolean = true
    }
    if(e.target.value === 'false') {
      boolean = false
    }
    // files
    if(e.target.files) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: e.target.files
      }))
    }
    if(!e.target.files) {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
    // text
  }

  useEffect(() => {
    if(isMounted) {
      onAuthStateChanged(auth, (user) => {
        if(user) {
          // add user to formData as userRef with value of user.uid
          setFormData({...formData, userRef: user.uid})
        } else {
          // if there is no user logged in then navigate to sign in page
          navigate('/sign-in')
        }
      })
    }

    return () => {
      // need to return in func 
      isMounted.current = false
    }
  }, [isMounted])

  if(loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>

          <label className='formLabel'>Sell / Rent</label>
          <div className="formButtons">
            <button onClick={onMutate} type='button' className={type === 'sell' ? 'formButtonActive' : 'formButton'} id='type' value='sell'>Sell</button>
            <button onClick={onMutate} type='button' className={type === 'rent' ? 'formButtonActive' : 'formButton'} id='type' value='rent'>Rent</button>
          </div>

          <label className='formLabel'>Name</label>
          <input onChange={onMutate} type="text" className='formInputName' id='name' value={name} maxLength='32' minLength='10' required/>

          <div className="formRooms flex">
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input onChange={onMutate} type="text" type='number' id='bedrooms' value={bedrooms} className="formInputSmall" min='1' max='50' required/>
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input onChange={onMutate} type="text" type='number' id='bathrooms' value={bathrooms} className="formInputSmall" min='1' max='50' required/>
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className="formButtons">
            <button onClick={onMutate} className={parking ? 'formButtonActive' : 'formButton'} type='button' id='parking' value={true} min='1' max='50'>Yes</button>
            <button onClick={onMutate} className={!parking && parking !== null ? 'formButtonActive' : 'formButton'} type='button' id='parking' value={false}>No</button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className="formButtons">
            <button onClick={onMutate} className={furnished ? 'formButtonActive' : 'formButton'} type='button' id='furnished' value={true}>Yes</button>
            <button onClick={onMutate} className={!furnished && furnished !== null ? 'formButtonActive' : 'formButton'} type='button' id='furnished' value={false}>No</button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea onChange={onMutate} className='formInputAddress' type='text' value={address} id="address" required></textarea>

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className='formLabel'>Latitude</label>
                <input onChange={onMutate} type="number" className='formInputSmall' id='latitude' value={latitude} required/>
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input onChange={onMutate} type="number" className='formInputSmall' id='longitude' value={longitude} required/>
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className="formButtons">
            <button onClick={onMutate} className={offer ? 'formButtonActive' : 'formButton'} type='button' id='offer' value={true}>Yes</button>
            <button onClick={onMutate} className={!offer && offer !== null ? 'formButtonActive' : 'formButton'} type='button' id='offer' value={false}>No</button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className="formPriceDiv">
            <input onChange={onMutate} type="number" className='formInputSmall' id='regularPrice' value={regularPrice} min='50' max='750000000' required/>
            {type === 'rent' && (
              <p className='formPriceText'>$ / Month</p>
              )}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input onChange={onMutate} type="number" className='formInputSmall' id='discountedPrice' value={discountedPrice} min='50' max='750000000' required={offer}/>
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>This first image will be the cover</p>
          <input onChange={onMutate} type="file" className='formInputFile' id='images' max={6} accept='.jpg,.png,.jpeg' multiple required />

          <button className='primaryButton createListingButton' type='submit'>Create Listing</button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing