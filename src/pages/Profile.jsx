import React, {useState, useEffect} from 'react'
import {getAuth, updateProfile} from 'firebase/auth'
import {doc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import { useNavigate, Link} from 'react-router-dom'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const {name, email} = formData
  const navigate = useNavigate()

  useEffect(() => {
    // fetch listings from db by:
    const fetchUserListings = async() => {

      // 1: createing query for collection of listings that matches current user id
      const listingsRef = collection(db, 'listings')
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'),        
      )
      // 2: getting data based on created query
      const querySnap = await getDocs(q)

      // 3: init listing array
      const listings = []

      // 4: push to listing each (matching)fetched data as object{id, data}
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      })

      // 5: setListings with created array of listings
      setListings(listings)
      setLoading(false)
    }
    fetchUserListings()
    // auth.currentUser.uid have to be in dependecy as I am using it in fetchUserListings()
  }, [auth.currentUser.uid])


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

        // Get current user data from db
        // and update user info in firestore
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
      // get all prev data and update e.target.id data
      // np. name: 'new name'
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const onDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete?')) {
      // if confirm to delete listing:
      // call deleteDoc with passed id of listing to be removed to firebase
      // then update all user listings on UI by creating updatedListings which will be without removed one
      await deleteDoc(doc(db, 'listings', id))
      const updatedListings = listings.filter((listing) => listing.id !== id)
      setListings(updatedListings)
      toast.success('Listing removed')
    }
  }

  if(loading) {
    return <Spinner />
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
            <input onChange={onChange} type="email" id='email' value={email} className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails}/>
          </form>
        </div>
        <Link to='/listing' className='createListing'>
          <img src={homeIcon} alt="home" />
          <p>Sell or Rent your home</p>
          <img src={arrowRight} alt="go to" />
        </Link>

          {/* Current user listings */}
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings:</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} onDelete={() => onDelete(listing.id)} />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
