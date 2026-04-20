import { useState } from 'react';
import Header from './header'
import Footer from './footer'
import { getbeneficiaries, finduserbyaccount, findbeneficiarieByid } from '../db/database';


function Dashboard({ setIsLoggedIn }) {
    const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('currentUser')));
  const [showTransfer, setShowTransfer] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);

  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [sourceCard, setSourceCard] = useState('');
  const [amount, setAmount] = useState('');

  const [rechargeCard, setRechargeCard] = useState('');
  const [amountRecharge, setAmountRecharge] = useState('');

  if (!user) {
    alert('User not authenticated');
    return null;
  }

  const beneficiaries = getbeneficiaries(user.id) || [];
  const cards = user.wallet.cards || [];

  const monthlyIncome = user.wallet.transactions
    .filter((t) => t.type === 'credit')
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter((t) => t.type === 'debit')
    .reduce((total, t) => total + t.amount, 0);

  const dashboardData = {
    userName: user.name,
    currentDate: new Date().toLocaleDateString('fr-FR'),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };

  const refreshUser = () => {
    const updatedUser = JSON.parse(JSON.stringify(user));
    setUser(updatedUser);
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const checkUser = (numcompte) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const beneficiary = finduserbyaccount(numcompte);
        if (beneficiary) {
          resolve(beneficiary);
        } else {
          reject('beneficiary not found');
        }
      }, 200);
    });

  const checkSolde = (expediteur, value) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (expediteur.wallet.balance > value) {
          resolve('Sufficient balance');
        } else {
          reject('Insufficient balance');
        }
      }, 300);
    });

  const updateSolde = (expediteur, destinataire, value) =>
    new Promise((resolve) => {
      setTimeout(() => {
        expediteur.wallet.balance -= value;
        destinataire.wallet.balance += value;
        resolve('update balance done');
      }, 200);
    });

  const addtransactions = (expediteur, destinataire, value) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const credit = {
          id: Date.now(),
          type: 'credit',
          amount: value,
          date: new Date().toLocaleString('fr-FR'),
          from: expediteur.name,
        };

        const debit = {
          id: Date.now() + 1,
          type: 'debit',
          amount: value,
          date: new Date().toLocaleString('fr-FR'),
          to: destinataire.name,
        };

        expediteur.wallet.transactions.push(debit);
        destinataire.wallet.transactions.push(credit);
        resolve('transaction added successfully');
      }, 300);
    });

  async function transfer(expediteur, numcompte, value) {
    const destinataire = await checkUser(numcompte);
    await checkSolde(expediteur, value);
    await updateSolde(expediteur, destinataire, value);
    await addtransactions(expediteur, destinataire, value);
  }

  const checkAmount = (value) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value >= 100) {
          resolve('Amount is valid');
        } else {
          reject('Amount invalid');
        }
      }, 200);
    });

  const addRechargeTransaction = (value) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const credit = {
          id: Date.now(),
          type: 'RECHARGE',
          amount: value,
          date: new Date().toLocaleString('fr-FR'),
          from: 'Card Recharge',
        };
        user.wallet.transactions.push(credit);
        user.wallet.balance += value;
        resolve('Recharge successful');
      }, 300);
    });

  const checkCard = (cardNumber) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const card = user.wallet.cards.find((c) => c.numcards === cardNumber);
        if (card) {
          const expiryDate = new Date(card.expiry);
          const currentDate = new Date();
          if (expiryDate - currentDate > 0) {
            resolve('Card is valid');
          } else {
            reject('Card has expired');
          }
        } else {
          reject('Card not found');
        }
      }, 200);
    });

  async function recharge(value) {
    await checkAmount(value);
    await checkCard(rechargeCard);
    await addRechargeTransaction(value);
  }

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      const beneficiary = findbeneficiarieByid(user.id, beneficiaryId);
      if (!beneficiary) {
        alert('beneficiary not found');
        return;
      }

      const numericAmount = Number(amount);
      await transfer(user, beneficiary.account, numericAmount);
      refreshUser();
      setShowTransfer(false);
      setBeneficiaryId('');
      setSourceCard('');
      setAmount('');
    } catch (error) {
      alert(error);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();

    try {
      const numericAmount = Number(amountRecharge);
      await recharge(numericAmount);
      refreshUser();
      setShowRecharge(false);
      setRechargeCard('');
      setAmountRecharge('');
    } catch (error) {
      alert(error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setIsLoggedIn(false);
  };

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
                    <span>Aide &amp; Support</span>
                  </a>
                </li>
               
                <li>
                  <a href="#" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Déconnexion</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="dashboard-content">

            <section id="overview" className="dashboard-section active">
              <div className="section-header">
               
                <h2>Bonjour, <span id="greetingName">{dashboardData.userName}</span> !</h2>
                <p className="date-display" id="currentDate">{dashboardData.currentDate}</p>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon blue">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Solde disponible</span>
                    <span className="card-value" id="availableBalance">{dashboardData.availableBalance}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon green">
                    <i className="fas fa-arrow-up"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Revenus</span>
                    <span className="card-value" id="monthlyIncome">{dashboardData.monthlyIncome}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon red">
                    <i className="fas fa-arrow-down"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Dépenses</span>
                    <span className="card-value" id="monthlyExpenses">{dashboardData.monthlyExpenses}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon purple">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Cartes actives</span>
                    <span className="card-value" id="activeCards">{dashboardData.activeCards}</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Actions rapides</h3>
                <div className="action-buttons">
                
                  <button className="action-btn" id="quickTransfer" type="button" onClick={() => setShowTransfer(true)}>
                    <i className="fas fa-paper-plane"></i>
                    <span>Transférer</span>
                  </button>
                  <button className="action-btn" id="quickTopup" type="button" onClick={() => setShowRecharge(true)}>
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
               
                <div className="transactions-list" id="recentTransactionsList">
                  {user.wallet.transactions.slice().reverse().map((t) => (
                    <div key={t.id} className={`transaction-item ${t.type}`}>
                      <span className="transaction-type">{t.type.toUpperCase()}</span>
                      <span className="transaction-amount">{t.type === 'debit' ? '-' : '+'}{t.amount} MAD</span>
                      <span className="transaction-date">{t.date}</span>
                      <span className="transaction-party">{t.from || t.to}</span>
                    </div>
                  ))}
                </div>
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
                {cards.map((card) => (
                  <div key={card.numcards} className="card-item">
                    <div className={`card-preview ${card.type}`}>
                      <div className="card-chip"></div>
                      <div className="card-number">**** **** {card.numcards.slice(-4)}</div>
                      <div className="card-holder">{user.name}</div>
                      <div className="card-expiry">{card.expiry}</div>
                   
                      <div className="card-type">{card.type}</div>
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
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      
      {showTransfer && (
        <div className="popup-overlay" id="transferPopup">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer un transfert</h2>
              <button className="btn-close" type="button" onClick={() => setShowTransfer(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="popup-body">
              <form id="transferForm" className="transfer-form" onSubmit={handleTransfer}>
                <div className="form-group">
              
                  <label htmlFor="beneficiary">
                    <i className="fas fa-user"></i> Bénéficiaire
                  </label>
                 
                  <select
                    id="beneficiary"
                    name="beneficiary"
                    required
                    value={beneficiaryId}
                    onChange={(e) => setBeneficiaryId(e.target.value)}
                  >
                    <option value="" disabled>Choisir un bénéficiaire</option>
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sourceCard">
                    <i className="fas fa-credit-card"></i> Depuis ma carte
                  </label>
                  <select
                    id="sourceCard"
                    name="sourceCard"
                    required
                    value={sourceCard}
                    onChange={(e) => setSourceCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map((c) => (
                      <option key={c.numcards} value={c.numcards}>{c.type} - *{c.numcards.slice(-4)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    <i className="fas fa-money-bill"></i> Montant
                  </label>
                  <div className="amount-input">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransfer(false)}>
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
      )}

    
      {showRecharge && (
        <div className="popup-overlay" id="RechargerPopup">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Effectuer un rechargement</h2>
              <button className="btn-close" type="button" onClick={() => setShowRecharge(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body">
              <form id="RechargerForm" className="transfer-form" onSubmit={handleRecharge}>
                <div className="form-group">
                  <label htmlFor="maCard">
                    <i className="fas fa-credit-card"></i> Depuis ma carte
                  </label>
                  <select
                    id="maCard"
                    name="sourceCard"
                    required
                    value={rechargeCard}
                    onChange={(e) => setRechargeCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map((c) => (
                      <option key={c.numcards} value={c.numcards}>{c.type} - *{c.numcards.slice(-4)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amountRecharger">
                    <i className="fas fa-money-bill"></i> Montant
                  </label>
                  <div className="amount-input">
                    <input
                      type="number"
                      id="amountRecharger"
                      name="amount"
                      min="100"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={amountRecharge}
                      onChange={(e) => setAmountRecharge(e.target.value)}
                    />
                    <span className="currency">MAD</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRecharge(false)}>
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
      )}

      <Footer />
    </>
  );
}

export default Dashboard
