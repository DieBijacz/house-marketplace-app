import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {db} from '../firebase.config'
import {getDoc, doc} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

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
      <Swiper slidesPerView={1} pagination={{clickable: true}}>
        {listing.imageUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div style={{background: `url(${listing.imageUrls[index]}) center no-repeat`, backgroundSize: 'cover'}} className="swiperSlideDiv">

            </div>
          </SwiperSlide>
        ))}

      </Swiper>
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
{/* https://leafletjs.com/reference.html#latlng */}
{/* https://react-leaflet.js.org/docs/start-setup/ */}
        <div className="leafletContainer">
          <MapContainer style={{height: '100%', width: '100%', maxWidth:'600px'}} center={[listing.geolocation.lat, listing.geolocation.lng]} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>
                {listing.name}. <br />
                {listing.location}
                </Popup>
            </Marker>
          </MapContainer>
        </div>

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
