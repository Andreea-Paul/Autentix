<template>
  <header class="sticky top-0 w-full p-4 bg-gradient-to-br from-red-950 via-red-800 to-red-700 shadow-xl flex flex-col sm:flex-row items-center justify-between">
    <!-- Wallet Info Section -->
    <div
      v-if="wallet.walletAddress"
      class="flex flex-col sm:flex-row justify-start w-full sm:w-auto text-center sm:text-left mb-4 sm:mb-0"
    >
      <div
        class="bg-gradient-to-r from-gray-300 to-gray-100 p-5 rounded-2xl shadow-xl w-full sm:w-auto transition-all hover:scale-105 hover:shadow-2xl"
      >
        <p class="font-semibold text-black text-sm sm:text-base break-words">
          Bine ai venit, {{ user.name }}
        </p>
        <p class="text-black text-sm sm:text-base break-words">
          Adresă Portofel: {{ wallet.walletAddress }}
        </p>
        <p class="text-black text-sm sm:text-base break-words">
          Sold: {{ wallet.balance }} ETH
        </p>
      </div>
    </div>

    <!-- Buttons Section (if wallet is connected) -->
    <div
      v-if="wallet.walletAddress"
      class="flex flex-col sm:flex-row gap-4 justify-center sm:justify-end w-full sm:w-auto"
    >
      <button
        @click="navigateToPage"
        class="bg-gradient-to-r from-gray-700 to-gray-500 text-white py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {{ buttonText }}
      </button>
      <button
        @click="logout"
        class="bg-stone-900 text-white py-2 px-5 rounded-lg shadow-md hover:bg-stone-950 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
      >
        Deconectează-te
      </button>
    </div>

    <!-- MetaMask Connect Button (if wallet is not connected) -->
    <div v-else>
      <button
        @click="connectWallet"
        class="bg-gradient-to-r from-orange-600 to-yellow-500 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
      >
        <img src="@/assets/images/metamask-logo.png" alt="MetaMask" class="w-6 h-6 drop-shadow-md" />
        <span class="font-bold text-lg drop-shadow-md">Conectează-te cu MetaMask</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useWalletStore } from '@/stores/walletStore';
import { useRoute, useRouter } from 'vue-router';

// Retrieve wallet and user data along with authentication functions from the store
const { wallet, user, connectWallet, logout } = useWalletStore();

// Get current route and router instance
const route = useRoute();
const router = useRouter();

/**
 * Navigates to the appropriate page based on the current route.
 * If on the home page ("/"), navigates to the user page ("/user"); otherwise, returns to home.
 */
const navigateToPage = () => {
  const targetPath = route.path === '/' ? '/user' : '/';
  if (route.path !== targetPath) {
    router.push(targetPath);
  }
};

/**
 * Computes the button text based on the current route.
 * Returns 'Pagină Utilizator' on the home page and 'Pagina Principală' on other pages.
 */
const buttonText = computed(() =>
  route.path === '/' ? 'Pagină Utilizator' : 'Pagina Principală'
);
</script>
