import { Link } from "react-router-dom"
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg'
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg'
import HomeSlider from "../components/HomeSlider"

function Explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>
      <main>
        <HomeSlider />
        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">
          <Link to='/category/rent'>
            <div className="exploreCategoryBox">
              <img src={rentCategoryImage} alt="rent" className="exploreCategoryImg"/>
              <p className="exploreCategoryName">For Rent</p>
            </div>
          </Link>
          <Link to='/category/sell'>
            <div className="exploreCategoryBox">
              <img src={sellCategoryImage} alt="sell" className="exploreCategoryImg" />
              <p className="exploreCategoryName">For Sell</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Explore
