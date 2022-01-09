import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {db} from '../firebase.config'
import {getDoc, doc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'

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
        setListing(docSnap.data())
        setLoading(false)
      }
    }
    
    fetchListing()
  }, [navigate, params.listingId])

  if(loading) {
    return <Spinner />
  }
  
  return (
    <main>
{/* SLIDER */}

{/* SHARE ICON */}
      <div className="shareIconDiv" onClick={() => {
        // copies href
        navigator.clipboard.writeText(window.location.href)
        setSharedLinkCopied(true)
        setTimeout(() => {
          // timer for msg
          setSharedLinkCopied(false)
        }, 2000)
        }}>
        <img src={shareIcon} alt="share" />
      </div>
      {/* msg showed when link copied */}
      {shareLinkCopied && <p className='linkCopied'>Link Copied</p>}

{/* LISTING DETAILS */}
      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - ${listing.offer 
              ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
              : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <div className="listingLocation">{listing.location}</div>
        <div className='listingBadges'>
          <p className="listingType">For {listing.type === 'rent' ? 'Rent' : 'Sell'}</p>
          {listing.offer && (
            <p className="discountPrice">
              ${listing.regularPrice - listing.discountedPrice} discount
            </p>
          )}
        </div>

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms` : '1 bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : '1 bathroom'}
          </li>
          <li>
            {listing.parking && 'parking available'}
          </li>
          <li>
            {listing.furnished && 'furnished'}
          </li>
        </ul>

        <p className="listingLocationTitle">
          Location
        </p>
          
{/* MAP */}

{/* CONTACT LANDLORD */}
        {auth.currentUser?.uid !== listing.userRef && (
          // <Route path="/contact/:landLordId" element={<Contact />} />
          <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className='primaryButton'>
            Contact LandLord
          </Link>
        )}

      </div>
    </main>
  )
}

export default Listing
