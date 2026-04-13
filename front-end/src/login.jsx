
import Header from './header'
import Footer from './footer'

function login() {
  return (
    <>
      <Header />

    <main>
    <section className="hero">

      <div className="hero-content">
        <h1>Connexion</h1>
        <p>Accédez à votre E-Wallet en toute sécurité et gérez vos transactions en toute confiance.</p>
        <div id="error"></div>
        <form className="login-form">
          <div className="input-group">
            <input id="mail" type="email" placeholder="Adresse e-mail" required/>
          </div>
          <div className="input-group">
            <input id="password" type="password" placeholder="Mot de passe" required/>
            <span id="display" className="toggle-password">👁</span>
          </div>
          <p id="result"></p>
          <button id="submitbtn" type="button" className="btn btn-primary">Se connecter</button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>
          Vous n'avez pas encore de compte ?
          <a href="#" style={{ color: '#3b66f6', fontWeight: '600' }}>S'inscrire</a>
        </p>
      </div>

      <div className="hero-image">
        <img src="../src/assets/e-Wallet6.gif" alt="Illustration de connexion"/>
      </div>

    </section>
  </main>
    
    <Footer />
    
    </>
  )
}

export default login