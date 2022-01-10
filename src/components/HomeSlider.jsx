import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import {getDocs, collection, query, orderBy, limit} from 'firebase/firestore'
import {db} from '../firebase.config'
import Spinner from '../components/Spinner'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css'

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function HomeSlider() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchListings = async() => {
      // create listingRef to get specific data from db
      // use it to fetch limit(5) last items
      // and keep it in querySnap
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
      const querySnap = await getDocs(q)
  
      let listings = []
      // loop through 5 items from querySnap
      // and push them to array as objs with id and data
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      })
      setListings(listings)
      setLoading(false)
    }
    fetchListings()
  }, [])

  if(loading) {
    <Spinner />
  }

  return (
    // if there are fetched data
    // create slide for each with onClick navigate to that listing function
    // and first image of that listing as front img
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>
        <Swiper slidesPerView={1} pagination={{clickable: true}} >
          {listings.map(({data, id}) => (
            <SwiperSlide key={id} onClick={() => navigate(`/category/${data.type}/${id}`)}>
              <div style={
                {
                background: `url(${data.imageUrls[0]}) center no-repeat`, 
                backgroundSize: 'cover'
              }} 
                className="swiperSlideDiv">
                  <p className="swiperSlideText">{data.name}</p>
                  {/* if there is discountedPrice show it else show regularPrice */}
                  <p className="swiperSlidePrice">${data.discountedPrice ?? data.regularPrice}
                  {/* if type if for rent then show price per month */}
                  {data.type === 'rent' && ' / month'}
                  </p>
                </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default HomeSlider
