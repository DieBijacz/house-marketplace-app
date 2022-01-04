import { Navigate, Outlet } from 'react-router-dom'
import { UseAuthStatus } from '../hooks/UseAuthStatus'
import Spinner from '../components/Spinner'

const PrivateRoute = () => {
  const {loggedIn, checkingStatus} = UseAuthStatus()

  // when UseAuthStatus is checking logged in status show Loading...
  if(checkingStatus) {
    return <Spinner />
  }

  // if loggedIn return child element else navigate to sign in
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' /> 
}

export default PrivateRoute
