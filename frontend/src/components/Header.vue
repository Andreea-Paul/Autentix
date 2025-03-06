<template>
  <header>
    <div v-if="wallet.walletAddress">
      <p>Welcome, {{ wallet.walletAddress }}</p>
      <p>Balance: {{ wallet.balance }} ETH</p>
      <router-link :to="goToPage" class="user-link">{{ buttonText }}</router-link>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <div v-else>
      <button @click="connectWallet" class="login-btn">Log in with MetaMask</button>
    </div>
  </header>
</template>

<script setup>
import { useWalletStore } from '@/stores/walletStore';
import { useRoute } from 'vue-router';

const { wallet, connectWallet, logout } = useWalletStore();
const route = useRoute();

// Verifică ruta curentă și stabilește butonul corect
const goToPage = route.path === '/' ? '/user' : '/';
const buttonText = route.path === '/' ? 'Go to Dashboard' : 'Go to Home';

// Funcția de conectare la MetaMask și adăugare a utilizatorului la backend
async function connectAndAddUser() {
  await connectWallet(); // Conectează portofelul
  if (wallet.walletAddress) { // Asigură-te că adresa este validă
    await addUserToBackend(wallet.walletAddress); // Adaugă utilizatorul pe backend
  }
}

</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: yellow;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.logout-btn {
  background-color: #dc3545;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>
