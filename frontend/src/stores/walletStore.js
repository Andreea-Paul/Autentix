import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { ethers } from 'ethers';

export const useWalletStore = defineStore('wallet', () => {
  const wallet = reactive({
    walletAddress: '',
    balance: '',
  });

  // Funcție pentru conectarea la MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        await fetchWalletInfo();
        await addUserToBackend(wallet.walletAddress); // Adăugăm utilizatorul pe backend
        localStorage.setItem('walletAddress', wallet.walletAddress);
        localStorage.setItem('balance', wallet.balance);
      } catch (error) {
        console.error('User rejected the request');
      }
    } else {
      alert('Please install MetaMask!');
    }
  }

  // Funcție pentru obținerea informațiilor despre portofel (adresă și balanță)
  async function fetchWalletInfo() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    wallet.walletAddress = await signer.getAddress();
    const balanceWei = await provider.getBalance(wallet.walletAddress);
    wallet.balance = ethers.formatEther(balanceWei);
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
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('balance');
    wallet.walletAddress = '';
    wallet.balance = '';
  }

  return { wallet, connectWallet, logout };
});
