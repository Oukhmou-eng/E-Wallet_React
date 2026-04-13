import Header from './header'
import Footer from './footer'


function dashboard() {
    return (
        <>
            <Header />


                  <main className="dashboard-main">
    <div className="dashboard-container">
      
      <aside className="dashboard-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li className="active"> 
              <a href="#overview"> 
                <i className="fas fa-home"></i>
                <span>Vue d'ensemble</span>
              </a>
            </li>
            <li>
              <a href="#transactions">
                <i className="fas fa-exchange-alt"></i>
                <span>Transactions</span>
              </a>
            </li>
            <li>
              <a href="#cards">
                <i className="fas fa-credit-card"></i>
                <span>Mes cartes</span>
              </a>
            </li>
            <li>
              <a href="#transfers">
                <i className="fas fa-paper-plane"></i>
                <span>Transferts</span>
              </a>
            </li>
            <li className="separator"></li>
            <li>
              <a href="#support">
                <i className="fas fa-headset"></i>
                <span>Aide & Support</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="dashboard-content">
        
        <section id="overview" className="dashboard-section active">
          <div className="section-header">
            <h2>Bonjour, <span id="greetingName">?</span> !</h2>
            <p className="date-display" id="currentDate"></p>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon blue">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="card-details">
                <span className="card-label">Solde disponible</span>
                <span className="card-value" id="availableBalance">?</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon green">
                <i className="fas fa-arrow-up"></i>
              </div>
              <div className="card-details">
                <span className="card-label">Revenus</span>
                <span className="card-value" id="monthlyIncome">?</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon red">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="card-details">
                <span className="card-label">Dépenses</span>
                <span className="card-value" id="monthlyExpenses">?</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon purple">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="card-details">
                <span className="card-label">Cartes actives</span>
                <span className="card-value" id="activeCards">?</span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Actions rapides</h3>
            <div className="action-buttons">
              <button className="action-btn" id="quickTransfer" type="button">
                <i className="fas fa-paper-plane"></i>
                <span>Transférer</span>
              </button>
              <button className="action-btn" id="quickTopup" type="button">
                <i className="fas fa-plus-circle"></i>
                <span>Recharger</span>
              </button>
              <button className="action-btn" id="quickRequest" type="button">
                <i className="fas fa-hand-holding-usd"></i>
                <span>Demander</span>
              </button>
            </div>
          </div>
          
          <div className="recent-transactions">
            <div className="section-header">
              <h3>Transactions récentes</h3>
            </div>
            <div className="transactions-list" id="recentTransactionsList"></div>
          </div>
        </section>

        <section id="cards" className="dashboard-section">
          <div className="section-header">
            <h2>Mes cartes</h2>
            <button className="btn btn-secondary" id="addCardBtn" type="button">
              <i className="fas fa-plus"></i> Ajouter une carte
            </button>
          </div>
          
          <div className="cards-grid" id="cardsGrid">
            <div className="card-item">
              <div className="card-preview visa">
                <div className="card-chip"></div>
                <div className="card-number">?</div>
                <div className="card-holder">?</div>
                <div className="card-expiry">?</div>
                <div class="card-type">?</div>
              </div>
              <div className="card-actions">
                <button className="card-action" title="Définir par défaut" type="button">
                  <i className="fas fa-star"></i>
                </button>
                <button className="card-action" title="Geler la carte" type="button">
                  <i className="fas fa-snowflake"></i>
                </button>
                <button className="card-action" title="Supprimer" type="button">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>

  {/*-- Popup transfert */}
  <div className="popup-overlay" id="transferPopup">
    <div className="popup-content">
      <div className="popup-header">
        <h2>Effectuer un transfert</h2>
        <button className="btn-close" id="closeTransferBtn" type="button">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="popup-body">
        <form id="transferForm" className="transfer-form">
          <div className="form-group">
            <label for="beneficiary">
              <i className="fas fa-user"></i> Bénéficiaire
            </label>
            <select id="beneficiary" name="beneficiary" required>
              <option value="" disabled selected>Choisir un bénéficiaire</option>
            </select>
          </div>

          <div className="form-group">
            <label for="sourceCard">
              <i className="fas fa-credit-card"></i> Depuis ma carte
            </label>
            <select id="sourceCard" name="sourceCard" required>
              <option value="" disabled selected>Sélectionner une carte</option>
            </select>
          </div>

          <div className="form-group">
            <label for="amount">
              <i className="fas fa-money-bill"></i> Montant
            </label>
            <div className="amount-input">
              <input type="number" id="amount" name="amount" min="1" step="0.01" placeholder="0.00" required/>
              <span className="currency">MAD</span>
            </div>
          </div>

          <div className="form-options">
            <div className="checkbox-group">
              <input type="checkbox" id="saveBeneficiary" name="saveBeneficiary"/>
              <label for="saveBeneficiary">Enregistrer ce bénéficiaire</label>
            </div>
            
            <div className="checkbox-group">
              <input type="checkbox" id="instantTransfer" name="instantTransfer"/>
              <label for="instantTransfer">Transfert instantané <span className="fee-badge">+13.4 MAD</span></label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" id="cancelTransferBtn">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" id="submitTransferBtn">
              <i className="fas fa-paper-plane"></i> Transférer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>



  <div className="popup-overlay" id="RechargerPopup">
    <div className="popup-content">
      <div className="popup-header">
        <h2>Effectuer un rechargement</h2>
        <button className="btn-close" id="closeRechargerBtn" type="button">
          <i className="fas fa-times"></i>
        </button>
      </div>
<div className="popup-body">
      <form id="RechargerForm" className="transfer-form">
        

          <div className="form-group">
            <label for="sourceCard">
              <i className="fas fa-credit-card"></i> Depuis ma carte
            </label>
            <select id="maCard" name="sourceCard" required>
              <option value="" disabled selected>Sélectionner une carte</option>
            </select>
          </div>

          <div className="form-group">
            <label for="amount">
              <i className="fas fa-money-bill"></i> Montant
            </label>
            <div className="amount-input">
              <input type="number" id="amountRecharger" name="amount" min="1" step="0.01" placeholder="0.00" required/>
              <span className="currency">MAD</span>
            </div>
          </div>

          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" id="cancelRechargerBtn">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" id="submitRechargerBtn">
              <i className="fas fa-paper-plane"></i> Recharger
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>




            <Footer />

        </>
    );
}


export default dashboard