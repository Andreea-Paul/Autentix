<template>
  <Header />
  <div class="user">
    <h1>User Dashboard</h1>
    <p>Wallet Address: {{ wallet.walletAddress || 'Not logged in' }}</p>
    <p>ETH Balance: {{ wallet.balance || '0.00' }}</p>

    <div v-if="wallet.walletAddress">
      <h2>Upload Document</h2>
      <input type="file" @change="handleFileChange" />
      <button @click="uploadDocument" :disabled="!documentHash">Upload Hash</button>
      <p v-if="documentHash">Hash-ul documentului: {{ documentHash }}</p>
    </div>
    <div v-else>
      <p>Please log in to upload a document.</p>
    </div>

    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import Header from '../components/Header.vue';
import { useWalletStore } from '@/stores/walletStore';

const { wallet } = useWalletStore();
const documentHash = ref('');

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    documentHash.value = Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

async function uploadDocument() {
  if (!wallet.walletAddress) {
    alert('You must be logged in to upload a document.');
    return;
  }
  if (!documentHash.value) return;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contractAddress = '0xf28337137Ae29E5BE2CeC98046DDf8081B2A13b0';
  const contractABI = [
    { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "documentHashes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "storeDocumentHash", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "verifyDocument", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.storeDocumentHash(documentHash.value);
  await tx.wait();
  alert('Hash-ul a fost stocat cu succes pe blockchain!');
}
</script>

<style scoped>
.user {
  text-align: center;
  margin-top: 50px;
}

button:disabled {
  background-color: gray;
}

.home-link {
  display: block;
  margin-top: 20px;
  text-decoration: none;
  color: blue;
}
</style>
