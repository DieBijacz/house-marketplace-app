import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {db} from '../firebase.config'
import {getDoc, doc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import { toast } from 'react-toastify'

function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setSharedLinkCopied] = useState(false)

  const navigate = useNavigate()
  const auth = getAuth()
  const params = useParams()

  useEffect(() => {
    const fetchListing = async() => {
      // create docRef with database, collection name, and id comming from url
      const docRef = doc(db, 'listings', params.listingId)  
      // use that docRef to get docSnap
      const docSnap = await getDoc(docRef)

      if(docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data())
        setLoading(false)
      }
    }

    fetchListing()
  }, [navigate, params.listingId])

  return (
    <div>
      <h1>listing</h1>
    </div>
  )
}

export default Listing
