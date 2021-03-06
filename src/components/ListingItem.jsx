import React from 'react'
import { Link } from 'react-router-dom'
import {ReactComponent as DeleteIcon} from '../assets/svg/deleteIcon.svg' 
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'

function ListingItem({listing, id, onDelete}) {
  return (
    <li className='categoryListing'>
      <Link to={`/category/${listing.type}/${id}`} className='categoryListingLink' >
        <img src={listing.imageUrls[0]} alt={listing.name} className='categoryListingImg' />
        <div className="categoryListingDetails">
          <p className="categoryListingName">
            {listing.name}
          </p>
          <p className="categoryListingLocation">
            {listing.location}
          </p>
          <p className="categoryListingPrice">
            {/* format price */}
            ${listing.offer 
              ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
              : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            {listing.type === 'rent' && ' / Month'} 
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt='bed' />
            <p className='categoryListingInfoText'>
              {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms` : '1 bedroom'}
            </p>
            <img src={bathtubIcon} alt="bathrooms" />
            <p className='categoryListingInfoText'>
              {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : '1 bathroom'}
            </p>
          </div>
        </div>
      </Link>
      {/* if passed onDelete then onClick call onDelete and pass id to Profile.jsx*/}
      {onDelete && (
        <DeleteIcon onClick={() => onDelete(listing.id)} className='removeIcon' fill='rgb(231, 76, 60)'/>
      )}
    </li>
  )
}

export default ListingItem
