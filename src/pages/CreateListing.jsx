import React, {useState, useEffect, useRef} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {useNavigate} from 'react-router-dom'
import Spinner from '../components/Spinner'
import {toast} from 'react-toastify'
import {v4 as uuidv4} from 'uuid'

const apiKey = process.env.REACT_APP_API_KEY

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
    images: {},
    latitude: 0,
    longitude: 0,
  })

  const {type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude} = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

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
      // need to be return inside func 
      isMounted.current = false
    }
  }, [isMounted])

  // on form submit
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // validate form inputs
    if(discountedPrice >= regularPrice){
      setLoading(false)
      toast.error('Discounted Price expected to be lower then Regular Price')
      return
    }

    if(images.length > 6){
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    // create var to be added to firebase based on geolocation
    let geolocation = {}
    let location

    if(geolocationEnabled) {
      // if geolocation is enabled
      // fetch lat, lng from google based on address passed in form
      const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
      const data = await resp.json()
      
      // sets geolocation to be added to listing in firebase
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

      // validate location data 
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
    // if geolocation is disabled
    // user can pass coords manually in form
    geolocation.lat = latitude
    geolocation.lng = longitude
    }

    // store image in firebase function
    // DOCS https://firebase.google.com/docs/storage/web/upload-files?hl=en
    const storeImage = async (image) => {
      // when promise completed call resolve // if there was error call reject
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        // create a reference name
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
        const storageRef = ref(storage, 'images/' + fileName)

        // create upload task with created reference and passed image
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed', 
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          }, 
          (error) => {
            reject(error)
          }, 
          () => {
            // successful 
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      })

    }

    const imageUrls = await Promise.all(
      // loop through urls passed in form and call storeImage
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    // create obj to be added to firebase
    const formDataCopy = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp()
    }

    // clear
    // imageUrls as I want to have imgUrls instead
    // address => location
    // if offer === false then delete discountedPrice
    delete formDataCopy.images
    delete formDataCopy.address
    formDataCopy.location = address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    // set listing to firebase
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')

    // <Route path="/category/:categoryName/:listingId" element={<Listing />} /> from App.js
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }
  
  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }

  if (loading) {
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
              <input onChange={onMutate} type='number' id='bedrooms' value={bedrooms} className="formInputSmall" min='1' max='50' required/>
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input onChange={onMutate} type='number' id='bathrooms' value={bathrooms} className="formInputSmall" min='1' max='50' required/>
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