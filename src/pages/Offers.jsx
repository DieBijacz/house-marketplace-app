import React, { useState, useEffect } from 'react'
// useParam to get info about htpps: /rent
import {collection, getDocs, query, where, orderBy, limit, startAfter, getDoc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

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
          where('offer', '==', true), 
          orderBy('timestamp', 'desc'), 
          limit(5)
        )

        // execute query
        const querySnap = await getDocs(q)

        // get last fetched listing querySnap.docs[last element]
        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        const listings = []

        querySnap.forEach((doc) => {
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

  // PAGINATION / LOAD MORE
  const onFetchMoreListings = async () => {
    try {
      const listingsRef = collection(db, 'listings')

      const q = query(
        listingsRef, 
        where('offer', '==', true), 
        orderBy('timestamp', 'desc'), 
        // here is a starting point for fetching more data
        startAfter(lastFetchedListing),
        limit(5)
      )
      const querySnap = await getDocs(q)
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)

      const moreListings = []
      
      querySnap.forEach((doc) => {
        return moreListings.push({
          id: doc.id,
          data: doc.data()
        })
      })
      
      // add more listings to listings :D
      setListings((listings) => [...listings, ...moreListings] )
      setLoading(false)
    } catch (error) {
      toast.error('Could not fetch listings')
    }
  }

  return (
    <div className='category'>
      <header>
        <p className="pageHeader">
          Offers
        </p>
      </header>
      {loading ? <Spinner /> : listings && listings.length > 0 ? 
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p onClick={onFetchMoreListings} className="loadMore">Load More...</p>
          )}
        </> 
        : <h4>There are no current offers</h4>}
    </div>
  )
}

export default Offers
