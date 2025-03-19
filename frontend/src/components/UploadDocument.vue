<!-- UploadDocument.vue -->
<template>
    <div class="p-6 bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md rounded-lg shadow-xl text-white transition-transform transform hover:scale-105 hover:backdrop-blur-sm">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">Încărcare Documente</h2>
      <input id="file-upload-custom" type="file" @change="handleFileChange" class="hidden" />
      <div class="flex items-center space-x-4 mb-3">
        <label for="file-upload-custom" class="block px-4 py-2 rounded-md bg-gradient-to-r from-red-950 to-red-600 cursor-pointer text-white text-center hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out">
          Alege Documentul
        </label>
        <span v-if="fileName" class="text-black text-sm border border-gray-300 bg-gray-200 rounded-lg p-2 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
          {{ fileName }}
        </span>
        <span v-else class="text-black text-sm border border-gray-300 bg-gray-200 rounded-lg p-2 w-full">
          Nume document
        </span>
      </div>
      <input v-model="documentName" type="text" placeholder="Introdu numele documentului" class="w-full mb-3 p-2 rounded-md bg-white/70 text-black" />
      <button @click="uploadDocument" :disabled="!documentHash || !documentName || isProcessing" class="w-full bg-gradient-to-r from-red-950 to-red-600 text-white p-2 rounded-md hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out flex justify-center items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
        <svg v-if="isProcessing" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ isProcessing ? 'Procesare...' : 'Încarcă Document' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ethers } from 'ethers'
  import { toast } from 'vue3-toastify'
  import { useWalletStore } from '@/stores/walletStore'
  
  const emit = defineEmits(['documentUploaded'])
  const documentHash = ref('')
  const documentName = ref('')
  const isProcessing = ref(false)
  const fileName = ref('')
  const { wallet, user } = useWalletStore()
  
  // Validates the file and generates its SHA-256 hash.
  async function handleFileChange(event) {
    const file = event.target.files[0]
    fileName.value = file.name
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Mărimea documentului trebuie să fie mai mică de 10MB.')
      return
    }
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type)) {
      toast.error('Doar documente în format Word sau PDF sunt admise.')
      return
    }
    try {
      isProcessing.value = true
      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      documentHash.value = Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      toast.success('Hash-ul documentului s-a generat cu succes!')
    } catch (error) {
      toast.error('A apărut o eroare la generarea hash-ului.')
    } finally {
      isProcessing.value = false
    }
  }
  
  // Clears the form fields and resets the file input.
  function resetFields() {
    documentName.value = ''
    documentHash.value = ''
    fileName.value = ''
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) fileInput.value = ''
  }
  
  // Checks user access, stores the hash on-chain and in the backend, emits an event, and resets the form.
  async function uploadDocument() {
    if (!user.hasAccessCode) {
      toast.warning('Trebuie să ai un cod de acces valid pentru a stoca hash-uri.')
      return
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contractAddress = '0x910Da67F3feEA4B55a5775019f285caBbb282F3e'
    const contractABI = [
      { inputs: [{ internalType: 'string', name: '', type: 'string' }], name: 'documentHashes', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
      { inputs: [{ internalType: 'string', name: 'documentHash', type: 'string' }], name: 'storeDocumentHash', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      { inputs: [{ internalType: 'string', name: 'documentHash', type: 'string' }], name: 'verifyDocument', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' }
    ]
    const contract = new ethers.Contract(contractAddress, contractABI, signer)
    try {
      const exists = await contract.verifyDocument(documentHash.value)
      if (exists) {
        toast.warning('Hash-ul documentului deja există.')
        resetFields()
        return
      }
      const tx = await contract.storeDocumentHash(documentHash.value)
      await tx.wait()
      await fetch('http://localhost:5000/upload_document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet.walletAddress, document_name: documentName.value })
      })
      toast.success('Hash-ul a fost stocat cu succes!')
      emit('documentUploaded')
      resetFields()
    } catch (error) {
      toast.error('Eroare', error)
    }
  }
  </script>
  