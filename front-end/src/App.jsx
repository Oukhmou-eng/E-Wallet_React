import { useState } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import './App.css'
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
 
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
   
      {isLoggedIn
        ? <Dashboard setIsLoggedIn={setIsLoggedIn} />  : <Login setIsLoggedIn={setIsLoggedIn} />
      }
    </>
  )
}

export default App