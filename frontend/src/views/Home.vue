<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <!-- Home section occupies the remaining space between header and footer -->
    <div class="home flex-grow flex flex-col items-center justify-center bg-radial from-zinc-200 from-70% to-zinc-900">
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-black text-center">
        AutentiX
      </h1>

      <!-- Document verification section -->
      <div class="verification bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md p-6 rounded-2xl shadow-2xl hover:shadow-lg max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full text-center space-y-6">
        
        <!-- File upload section -->
        <div class="file-upload flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <!-- File selection button -->
          <label for="file-upload" class="block px-4 py-2 rounded-md bg-gradient-to-r from-red-950 to-red-600 cursor-pointer text-white text-center hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out">
            Alege Documentul
          </label>
          <!-- Hidden file input -->
          <input type="file" id="file-upload" @change="handleFileChange" class="hidden" />
          <!-- Display selected file name; hides overflow if too long -->
          <span v-if="fileName" class="text-black text-sm ml-4 border border-gray-300 rounded-lg p-2 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
            {{ fileName }}
          </span>
          <span v-else class="text-gray-400 text-sm ml-4 border border-gray-300 bg-white rounded-lg p-2 w-full">
            Nume document
          </span>
        </div>

        <!-- Document verification button -->
        <button @click="verifyDocument" :disabled="!documentHash" class="w-full bg-gradient-to-r from-red-950 to-red-600 text-white p-2 rounded-md hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out flex justify-center items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
          <span v-if="isVerifying">Se verifică...</span>
          <span v-else>Verifică Document</span>
        </button>

        <!-- Verification result message -->
        <p v-if="verified !== null" class="text-lg p-4 rounded-lg font-semibold bg-gray-300 text-center">
          Documentul este 
          <strong class="text-green-500" v-if="verified">VALID</strong>
          <strong class="text-red-500" v-else>INVALID / INEXISTENT</strong>
        </p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { toast } from 'vue3-toastify';

// Reactive variables for file verification
const documentHash = ref('');
const verified = ref(null);
const fileName = ref('');
const isVerifying = ref(false);

/* ---------------- File Handling Functions ---------------- */

/**
 * Handles file selection, calculates the file's SHA-256 hash,
 * and stores the file name and hash in reactive variables.
 */
async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name; // Set the file name
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    documentHash.value = Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

/* ---------------- Verification Function ---------------- */

/**
 * Verifies the document on the blockchain without using MetaMask.
 * Sets a loading state during the verification process.
 */
async function verifyDocument() {
  isVerifying.value = true; // Enable verifying state
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Local Ganache provider
  const contractAddress = '0x910Da67F3feEA4B55a5775019f285caBbb282F3e'; // CONTRACT ADDRESS
  const contractABI = [
    { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "documentHashes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "storeDocumentHash", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "verifyDocument", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
  ];
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  try {
    const result = await contract.verifyDocument(documentHash.value);
    verified.value = result;
  } catch (error) {
    toast.error("A apărut o eroare la verificare.");
  } finally {
    isVerifying.value = false; // Disable verifying state
  }
}
</script>
