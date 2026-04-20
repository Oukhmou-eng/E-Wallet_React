
import Header from './header'
import Footer from './footer'
import { finduserbymail } from '../db/database';
import { useState } from 'react';
import eWalletGif from '../assets/e-Wallet6.gif';


function Login({ setIsLoggedIn }) {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
   
    e.preventDefault();
    const user = finduserbymail(mail, password);
    if (user) {
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      setIsLoggedIn(true);
    } else {
      alert("Email ou mot de passe incorrect. ");
    }
  };

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Connexion</h1>
            <p>Accédez à votre E-Wallet en toute sécurité et gérez vos transactions en toute confiance.</p>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  id="mail"
                  type="email"
                  placeholder="Adresse e-mail"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  id="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
             
              <button id="submitbtn" type="submit" className="btn btn-primary">Se connecter</button>
            </form>
            <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
              Vous n'avez pas encore de compte ?
              <a href="#" style={{ color: '#3b66f6', fontWeight: '600' }}>S'inscrire</a>
            </p>
          </div>
          <div className="hero-image">
            
            <img src={eWalletGif} alt="Illustration de connexion" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Login