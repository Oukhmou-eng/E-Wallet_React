import { useState, useEffect } from 'react';
import Header from './header';
import Footer from './footer';
import database, { getbeneficiaries, findbeneficiarieByid } from '../db/database';

function Dashboard({ setIsLoggedIn }) {
  // ─── States ───────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [sourceCard, setSourceCard] = useState('');
  const [amount, setAmount] = useState('');
  const [rechargeCard, setRechargeCard] = useState('');
  const [amountRecharge, setAmountRecharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }

  // ─── useEffect 1 : Charger l'utilisateur depuis sessionStorage au montage ──
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      alert('Utilisateur non authentifié');
      setIsLoggedIn(false);
    }
  }, []); // [] = une seule fois au montage

  // ─── useEffect 2 : Sauvegarder user dans sessionStorage à chaque changement ─
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [user]); // se déclenche à chaque fois que user change

  // ─── useEffect 3 : Mettre à jour le titre de la page ──────────────────────
  useEffect(() => {
    if (user) {
      document.title = `Dashboard — ${user.name}`;
    }
    return () => {
      document.title = 'E-Wallet'; // nettoyage au démontage
    };
  }, [user]);

  // ─── useEffect 4 : Masquer la notification après 3 secondes ──────────────
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer); // nettoyage si notification change avant 3s
    }
  }, [notification]);

  // ─── Afficher une notification ────────────────────────────────────────────
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // ─── Rafraîchir user depuis la vraie database (source de vérité) ─────────
  const refreshUser = () => {
    const updatedUser = database.users.find((u) => u.id === user.id);
    if (updatedUser) {
      // On force une nouvelle référence pour déclencher le useEffect
      setUser({ ...updatedUser, wallet: { ...updatedUser.wallet } });
    }
  };

  // ─── Promises de transfert ────────────────────────────────────────────────
  const findUserByAccount = (numcompte) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = database.users.find((u) => u.account === numcompte);
        found ? resolve(found) : reject('Bénéficiaire introuvable');
      }, 200);
    });

  const checkSolde = (expediteur, value) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // On récupère le vrai objet depuis la database
        const realUser = database.users.find((u) => u.id === expediteur.id);
        realUser.wallet.balance > value
          ? resolve(realUser)
          : reject('Solde insuffisant');
      }, 300);
    });

  const updateSolde = (expediteur, destinataire, value) =>
    new Promise((resolve) => {
      setTimeout(() => {
        // Modification des vrais objets en mémoire database
        expediteur.wallet.balance -= value;
        destinataire.wallet.balance += value;
        resolve('Solde mis à jour');
      }, 200);
    });

    

  const addTransactions = (expediteur, destinataire, value) =>
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
        resolve('Transactions ajoutées');
      }, 300);
    });

  const transfer = async (expediteur, numcompte, value) => {
    // expediteur = vrai objet database
    const realExpediteur = database.users.find((u) => u.id === expediteur.id);
    const destinataire = await findUserByAccount(numcompte);
    await checkSolde(realExpediteur, value);
    await updateSolde(realExpediteur, destinataire, value);
    await addTransactions(realExpediteur, destinataire, value);
  };

  // ─── Promises de rechargement ─────────────────────────────────────────────
  const checkAmount = (value) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        value >= 100 ? resolve('Montant valide') : reject('Le montant minimum est 100 MAD');
      }, 200);
    });

  const checkCard = (cardNumber) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const card = user.wallet.cards.find((c) => c.numcards === cardNumber);
        if (!card) {
          reject('Carte introuvable');
          return;
        }
        const expiryDate = new Date(card.expiry);
        const now = new Date();
        expiryDate > now ? resolve('Carte valide') : reject('Carte expirée');
      }, 200);
    });

  const addRechargeTransaction = (value) =>
    new Promise((resolve) => {
      setTimeout(() => {
        // Modification du vrai objet en database
        const realUser = database.users.find((u) => u.id === user.id);
        const credit = {
          id: Date.now(),
          type: 'RECHARGE',
          amount: value,
          date: new Date().toLocaleString('fr-FR'),
          from: 'Rechargement carte',
        };
        realUser.wallet.transactions.push(credit);
        realUser.wallet.balance += value;
        resolve('Rechargement effectué');
      }, 300);
    });

  const recharge = async (value) => {
    await checkAmount(value);
    await checkCard(rechargeCard);
    await addRechargeTransaction(value);
  };

  // ─── Handler Transfert ────────────────────────────────────────────────────
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const beneficiary = findbeneficiarieByid(user.id, beneficiaryId);
      if (!beneficiary) {
        showNotification('Bénéficiaire introuvable', 'error');
        return;
      }
      const numericAmount = Number(amount);
      await transfer(user, beneficiary.account, numericAmount);
      refreshUser(); // met à jour le state depuis la vraie database
      setShowTransfer(false);
      setBeneficiaryId('');
      setSourceCard('');
      setAmount('');
      showNotification('Transfert effectué avec succès !', 'success');
    } catch (error) {
      showNotification(error, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handler Recharge ─────────────────────────────────────────────────────
  const handleRecharge = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const numericAmount = Number(amountRecharge);
      await recharge(numericAmount);
      refreshUser();
      setShowRecharge(false);
      setRechargeCard('');
      setAmountRecharge('');
      showNotification('Rechargement effectué avec succès !', 'success');
    } catch (error) {
      showNotification(error, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handler Déconnexion ──────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setIsLoggedIn(false);
  };

  // ─── Guard : user pas encore chargé ──────────────────────────────────────
  if (!user) return null;

  // ─── Données calculées ────────────────────────────────────────────────────
  const beneficiaries = getbeneficiaries(user.id) || [];
  const cards = user.wallet?.cards || [];

  const monthlyIncome = user.wallet.transactions
    .filter((t) => t.type === 'credit' || t.type === 'RECHARGE')
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter((t) => t.type === 'debit')
    .reduce((total, t) => total + t.amount, 0);

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />

      {/* Notification toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          {notification.type === 'success' ? '✅ ' : '❌ '}
          {notification.message}
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-container">

          {/* ── Sidebar ── */}
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

          {/* ── Contenu principal ── */}
          <div className="dashboard-content">

            {/* Overview */}
            <section id="overview" className="dashboard-section active">
              <div className="section-header">
                <h2>Bonjour, <span id="greetingName">{user.name}</span> !</h2>
                <p className="date-display" id="currentDate">
                  {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon blue">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Solde disponible</span>
                    <span className="card-value" id="availableBalance">
                      {user.wallet.balance} {user.wallet.currency}
                    </span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon green">
                    <i className="fas fa-arrow-up"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Revenus</span>
                    <span className="card-value" id="monthlyIncome">{monthlyIncome} MAD</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon red">
                    <i className="fas fa-arrow-down"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Dépenses</span>
                    <span className="card-value" id="monthlyExpenses">{monthlyExpenses} MAD</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon purple">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="card-details">
                    <span className="card-label">Cartes actives</span>
                    <span className="card-value" id="activeCards">{cards.length}</span>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="quick-actions">
                <h3>Actions rapides</h3>
                <div className="action-buttons">
                  <button className="action-btn" type="button" onClick={() => setShowTransfer(true)}>
                    <i className="fas fa-paper-plane"></i>
                    <span>Transférer</span>
                  </button>
                  <button className="action-btn" type="button" onClick={() => setShowRecharge(true)}>
                    <i className="fas fa-plus-circle"></i>
                    <span>Recharger</span>
                  </button>
                  <button className="action-btn" type="button">
                    <i className="fas fa-hand-holding-usd"></i>
                    <span>Demander</span>
                  </button>
                </div>
              </div>

              {/* Transactions récentes */}
              <div className="recent-transactions">
                <div className="section-header">
                  <h3>Transactions récentes</h3>
                </div>
                <div className="transactions-list" id="recentTransactionsList">
                  {user.wallet.transactions.length === 0 ? (
                    <p>Aucune transaction pour le moment.</p>
                  ) : (
                    user.wallet.transactions
                      .slice()
                      .reverse()
                      .map((t) => (
                        <div key={t.id} className={`transaction-item ${t.type}`}>
                          <span className="transaction-type">{t.type.toUpperCase()}</span>
                          <span className="transaction-amount">
                            {t.type === 'debit' ? '-' : '+'}{t.amount} MAD
                          </span>
                          <span className="transaction-date">{t.date}</span>
                          <span className="transaction-party">{t.from || t.to}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </section>

            {/* Mes cartes */}
            <section id="cards" className="dashboard-section">
              <div className="section-header">
                <h2>Mes cartes</h2>
                <button className="btn btn-secondary" type="button">
                  <i className="fas fa-plus"></i> Ajouter une carte
                </button>
              </div>
              <div className="cards-grid" id="cardsGrid">
                {cards.length === 0 ? (
                  <p>Aucune carte enregistrée.</p>
                ) : (
                  cards.map((card) => (
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
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* ── Popup Transfert ── */}
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
                    required
                    value={sourceCard}
                    onChange={(e) => setSourceCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map((c) => (
                      <option key={c.numcards} value={c.numcards}>
                        {c.type} - *{c.numcards.slice(-4)}
                      </option>
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="fas fa-paper-plane"></i>
                    {loading ? ' En cours...' : ' Transférer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Recharge ── */}
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
                    required
                    value={rechargeCard}
                    onChange={(e) => setRechargeCard(e.target.value)}
                  >
                    <option value="" disabled>Sélectionner une carte</option>
                    {cards.map((c) => (
                      <option key={c.numcards} value={c.numcards}>
                        {c.type} - *{c.numcards.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amountRecharger">
                    <i className="fas fa-money-bill"></i> Montant (min. 100 MAD)
                  </label>
                  <div className="amount-input">
                    <input
                      type="number"
                      id="amountRecharger"
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="fas fa-plus-circle"></i>
                    {loading ? ' En cours...' : ' Recharger'}
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

export default Dashboard;