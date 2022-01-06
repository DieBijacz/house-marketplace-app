import React, { useState, useEffect } from 'react'
// useParam to get info about htpps: /rent
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit, startAfter, getDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'

function Category() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)

  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingsRef = collection(db, 'listings')

        // create a query
        //from App.js <Route path='/category/:categoryName' => /rent or /sell
        const q = query(
          listingsRef, 
          // check type ('rent' or 'sell')
          where('type', '==', params.categoryName), 
          orderBy('timestamp', 'desc'), 
          limit(10)
        )

        // execute query
        const querySnap = await getDocs(q)

        const listings = []

        querySnap.forEach((doc) => {
          console.log(doc.data());
          return listings.push({
            // id will be id of user who added offer
            // on Firestore Database collection => 'listings => id
            id: doc.id,
            data: doc.data()
          })
        })

        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }
    fetchListings()
  }, [])

  return (
    <div className='category'>
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent' ? 'Places For Rent' : 'Places For Sell'}
        </p>
      </header>
      {loading ? <Spinner /> : listings && listings.length > 0 ? 
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <h3 key={listing.id}>{listing.data.name}</h3>
              ))}
            </ul>
          </main>
        </> 
        : <h4>No Listings for {params.categoryName}</h4>}
    </div>
  )
}

export default Category
