import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { ethers } from 'ethers';


export const useWalletStore = defineStore('wallet', () => {
  // Inițializăm starea din localStorage (dacă există)
  const wallet = reactive({
    walletAddress: localStorage.getItem('walletAddress') || '', // Verificăm în localStorage
    balance: localStorage.getItem('balance') || '', // Verificăm în localStorage
  });

  const user = reactive({
    userId: localStorage.getItem('userId') || null, // Verificăm în localStorage
    firstName: localStorage.getItem('firstName') || '', // Verificăm și firstName în localStorage
    lastName: localStorage.getItem('lastName') || '', // Verificăm și lastName în localStorage
  });

  // Funcție pentru conectarea la MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        await fetchWalletInfo(); // Fetch wallet info, which now also fetches user info

        // Dacă nu avem userId, înseamnă că este prima conectare, deci adăugăm utilizatorul pe backend
        if (!user.userId) {
          await addUserToBackend(wallet.walletAddress);  // Adăugăm utilizatorul pe backend doar la prima conectare
        }

        // Salvăm datele doar ale portofelului în Pinia și localStorage
        localStorage.setItem('walletAddress', wallet.walletAddress);
        localStorage.setItem('balance', wallet.balance);
        localStorage.setItem('userId', user.userId);
        localStorage.setItem('firstName', user.firstName);  // Salvăm firstName
        localStorage.setItem('lastName', user.lastName);    // Salvăm lastName

        window.ethereum.on('accountsChanged', async (accounts) => {
          wallet.walletAddress = accounts[0]; // Actualizăm adresa de portofel
          await fetchWalletInfo();  // Actualizăm doar informațiile despre portofel (nu și userul)
          await addNewWallet(wallet.walletAddress);  // Adăugăm noul portofel în backend
        });

      } catch (error) {
        console.error('User rejected the request');
      }
    } else {
      alert('Please install MetaMask!');
    }
  }

  // Funcție pentru obținerea informațiilor despre portofel
  async function fetchWalletInfo() {
    if (!window.ethereum) return alert('Please install MetaMask!');
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    wallet.walletAddress = await signer.getAddress();
    const balanceWei = await provider.getBalance(wallet.walletAddress);
    wallet.balance = ethers.formatEther(balanceWei);

    if (user.userId === null) {
      await fetchUserInfo();  // Doar dacă userId nu este deja prezent
    }
  }

  // Funcție pentru obținerea informațiilor despre utilizator
  async function fetchUserInfo() {
    if (!wallet.walletAddress) return console.error('No wallet address available');
    
    try {
      const response = await fetch(`http://localhost:5000/user/${wallet.walletAddress}`);
      if (response.ok) {
        const userData = await response.json();
        user.userId = userData.user_id; // Salvăm userId în Pinia
        user.firstName = userData.first_name; // Preluăm firstName din backend
        user.lastName = userData.last_name; // Preluăm lastName din backend

        // Salvăm firstName și lastName în localStorage
        localStorage.setItem('firstName', user.firstName);
        localStorage.setItem('lastName', user.lastName);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Funcție pentru adăugarea unui nou portofel în backend
  async function addNewWallet(walletAddress) {
    if (!user.userId) {
      console.error('User ID not available. Cannot associate wallet.');
      return;
    }

    const response = await fetch('http://localhost:5000/add_new_wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        user_id: user.userId,  // Folosim userId din store
      }),
    });

    if (!response.ok) {
      console.error('Failed to add new wallet to backend');
    } else {
      console.log('New wallet added successfully to the backend');
    }
  }

  // Funcție pentru adăugarea utilizatorului pe backend
  async function addUserToBackend(walletAddress) {
    const response = await fetch('http://localhost:5000/add_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
      }),
    });

    if (!response.ok) {
      console.error('Failed to add user to backend');
    } else {
      console.log('User added to backend successfully');
    }
  }

  // Funcție pentru deconectarea utilizatorului
  function logout() {
    // Ștergem datele doar din Pinia și localStorage pentru portofel și userId
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('balance');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName'); // Ștergem firstName din localStorage
    localStorage.removeItem('lastName');  // Ștergem lastName din localStorage

    wallet.walletAddress = '';
    wallet.balance = '';
    user.userId = null;
    user.firstName = '';  // Nu mai păstrăm firstName în Pinia
    user.lastName = '';   // Nu mai păstrăm lastName în Pinia

    window.location.reload();
  }

  // Încarcă datele din localStorage la începutul aplicației
  function loadFromLocalStorage() {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    const storedBalance = localStorage.getItem('balance');
    const storedUserId = localStorage.getItem('userId');
    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');

    if (storedWalletAddress && storedBalance && storedUserId) {
      wallet.walletAddress = storedWalletAddress;
      wallet.balance = storedBalance;
      user.userId = storedUserId;
      user.firstName = storedFirstName; // Restaurăm firstName din localStorage
      user.lastName = storedLastName;   // Restaurăm lastName din localStorage
    }
  }

  // Apelăm această funcție la crearea store-ului pentru a asigura încărcarea datelor din localStorage la inițializare
  loadFromLocalStorage();

  return { wallet, user, connectWallet, fetchWalletInfo, logout };
});
