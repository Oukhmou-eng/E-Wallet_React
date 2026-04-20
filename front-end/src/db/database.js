const database = {
  users: [
    {
      id: "1",
      name: "Ali",
      email: "Ali@example.com",
      password: "1232",
      account: "124847",
      wallet: {
        balance: 10000,
        currency: "MAD",
        cards: [
          { numcards: "12484755", type: "visa", balance: 14712, expiry: "2027-08-14", vcc: "147" },
          { numcards: "124478", type: "mastercard", balance: 1470, expiry: "2028-08-14", vcc: "257" }
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "2025-08-14", from: "Ahmed", to: "124847" },
          { id: "2", type: "debit", amount: 200, date: "2025-08-13", from: "124847", to: "Amazon" },
          { id: "3", type: "credit", amount: 250, date: "2025-08-12", from: "Ahmed", to: "124478" }
        ],
        beneficiaries: [
          { id: "1", name: "Ahmed", account: "12347" },
          { id: "2", name: "Meriem", account: "124478" }
        ]
      }
    },
    {
      id: "2",
      name: "Ahmed",
      email: "Ahmed@example.com",
      password: "12345",
      account: "12347",
      wallet: {
        balance: 2000,
        currency: "MAD",
        cards: [
          { numcards: "22484769569", type: "visa", balance: 14712, expiry: "2027-08-14", vcc: "147" },
          { numcards: "2244755888", type: "mastercard", balance: 1470, expiry: "2028-08-14", vcc: "257" }
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "2025-08-14", from: "Ali", to: "12347" },
          { id: "2", type: "debit", amount: 200, date: "2025-08-13", from: "12347", to: "Amazon" },
          { id: "3", type: "credit", amount: 250, date: "2025-08-12", from: "Ali", to: "224478" }
        ],
        beneficiaries: [
          { id: "1", name: "Ali", account: "124847" },
          { id: "2", name: "Sara", account: "213456" }
        ]
      }
    }
  ]
};

  const finduserbymail = (mail, password) => {
    return database.users.find((u) => u.email === mail && u.password === password);
}

  const getbeneficiaries = (id) => {
    return database.users.find((u)=>u.id===id).wallet.beneficiaries;
}

 const findbeneficiarieByid= (id,beneficiaryId) => {
    return database.users.find((u)=>u.id===id).wallet.beneficiaries.find((u)=>u.id===beneficiaryId);
}

 const finduserbyaccount=(numcompte)=>{
    return database.users.find((u)=>u.account===numcompte);
}

export default database;
export { finduserbymail, getbeneficiaries, findbeneficiarieByid, finduserbyaccount };

