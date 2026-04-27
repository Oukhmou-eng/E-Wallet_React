import { useState, useEffect } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import './App.css'
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ useEffect pour vérifier sessionStorage au démarrage
  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      {isLoggedIn
        ? <Dashboard setIsLoggedIn={setIsLoggedIn} />
        : <Login setIsLoggedIn={setIsLoggedIn} />
      }
    </>
  )
}

export default App