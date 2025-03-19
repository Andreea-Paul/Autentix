<!-- VerifyDocument.vue -->
<template>
    <div class="verification bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md p-6 rounded-2xl shadow-2xl hover:shadow-lg max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full text-center space-y-6">
      <!-- File upload section -->
      <div class="file-upload flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <label for="file-upload" class="block px-4 py-2 rounded-md bg-gradient-to-r from-red-950 to-red-600 cursor-pointer text-white text-center hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out">
          Alege Documentul
        </label>
        <input type="file" id="file-upload" @change="handleFileChange" class="hidden" />
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
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ethers } from 'ethers'
  import { toast } from 'vue3-toastify'
  
  // Reactive state variables
  const documentHash = ref('')
  const fileName = ref('')
  const isVerifying = ref(false)
  const verified = ref(null)
  
  /**
   * handleFileChange:
   * - Validates selected file and generates its SHA-256 hash.
   */
  async function handleFileChange(event) {
    const file = event.target.files[0]
    if (file) {
      fileName.value = file.name
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      documentHash.value = Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
    }
  }
  
  /**
   * verifyDocument:
   * - Checks the document hash on the blockchain.
   */
  async function verifyDocument() {
    isVerifying.value = true
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545")
    const contractAddress = '0x910Da67F3feEA4B55a5775019f285caBbb282F3e'
    const contractABI = [
      { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "documentHashes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
      { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "storeDocumentHash", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "verifyDocument", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
    ]
    const contract = new ethers.Contract(contractAddress, contractABI, provider)
    try {
      const result = await contract.verifyDocument(documentHash.value)
      verified.value = result
    } catch (error) {
      toast.error("A apărut o eroare la verificare.")
    } finally {
      isVerifying.value = false
    }
  }
  </script>
  