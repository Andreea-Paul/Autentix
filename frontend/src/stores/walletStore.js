import { defineStore } from 'pinia'; // Pinia for state management
import { reactive, watch } from 'vue'; // Vue for reactivity
import { ethers } from 'ethers'; // Ethers.js for interacting with the Ethereum blockchain
import { useRouter } from 'vue-router'; // Vue Router for navigation

export const useWalletStore = defineStore('wallet', () => {
  const router = useRouter(); // Vue Router for programmatic navigation

  // Reactive state for wallet data
  const wallet = reactive({
    walletAddress: sessionStorage.getItem('walletAddress') || '',
    balance: sessionStorage.getItem('balance') || '',
  });

  // Reactive state for user data
  const user = reactive({
    userId: sessionStorage.getItem('userId') || null,
    name: sessionStorage.getItem('name') || '',
    hasAccessCode: sessionStorage.getItem('hasAccessCode') === 'true',
  });

  // Watcher to sync wallet data with sessionStorage
  watch(wallet, () => {
    sessionStorage.setItem('walletAddress', wallet.walletAddress);
    sessionStorage.setItem('balance', wallet.balance);
  }, { deep: true });

  // Watcher to sync user data with sessionStorage
  watch([() => user.name, () => user.hasAccessCode], () => {
    sessionStorage.setItem('name', user.name);
    sessionStorage.setItem('hasAccessCode', user.hasAccessCode.toString());
  });

  // Connect the wallet via MetaMask and fetch wallet info
  async function connectWallet() {
    if (!window.ethereum) return alert('Please install MetaMask!');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      await fetchWalletInfo();

      if (!user.userId) {
        await addUserToBackend(wallet.walletAddress);
      }

      // Listen for account changes in MetaMask
      window.ethereum.on('accountsChanged', async (accounts) => {
        wallet.walletAddress = accounts[0];
        await fetchWalletInfo();
        await addNewWallet(wallet.walletAddress);
      });
    } catch (error) {
      console.error('User rejected the request:', error);
    }
  }

  // Logout user and clear sessionStorage, redirecting to home page
  function logout() {
    sessionStorage.clear(); // Clear all session data
    wallet.walletAddress = '';
    wallet.balance = '';
    user.userId = null;
    user.name = '';
    user.hasAccessCode = false;

    router.push('/'); // Redirect to home page
  }

  // Fetch wallet info (address and balance)
  async function fetchWalletInfo() {
    if (!window.ethereum) return alert('Please install MetaMask!');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      wallet.walletAddress = await signer.getAddress();
      const balanceWei = await provider.getBalance(wallet.walletAddress);
      wallet.balance = ethers.formatEther(balanceWei);

      if (!user.userId) {
        await fetchUserInfo();
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  }

  // Add new wallet address to the backend
  async function addNewWallet(walletAddress) {
    if (!user.userId) {
      console.error('User ID not available. Cannot associate wallet.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/add_new_wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, user_id: user.userId }),
      });

      if (!response.ok) throw new Error('Failed to add new wallet to backend');

      console.log('New wallet added successfully to the backend');
    } catch (error) {
      console.error(error.message);
    }
  }

  // Fetch user data from the backend using the wallet address
  async function fetchUserInfo() {
    if (!wallet.walletAddress) return console.error('No wallet address available');

    try {
      const response = await fetch(`http://localhost:5000/user/${wallet.walletAddress}`);
      if (response.ok) {
        const userData = await response.json();
        user.userId = userData.user_id;
        sessionStorage.setItem('userId', user.userId);
        user.name = userData.name;
        user.hasAccessCode = !!userData.access_code;
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Add user to the backend when they first connect
  async function addUserToBackend(walletAddress) {
    const response = await fetch('http://localhost:5000/add_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress }),
    });

    if (!response.ok) {
      console.error('Failed to add user to backend');
    } else {
      console.log('User added to backend successfully');
    }
  }

  return { wallet, user, connectWallet, fetchWalletInfo, logout };
});
