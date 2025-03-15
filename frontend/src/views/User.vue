<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <Header />

    <!-- Main content section -->
    <div class="flex-grow flex flex-col items-center justify-center bg-radial from-zinc-200 from-70% to-zinc-900 bg-cover bg-center relative">
      <div class="absolute inset-0 bg-animated-gradient backdrop-blur-lg bg-white/30"></div>

      <!-- Primary container -->
      <div class="relative z-10 w-full max-w-5xl mx-auto p-6 flex flex-col gap-6">
        <!-- Dropdown header -->
        <div class="flex justify-end relative z-50">
          <div class="relative">
            <button @click="toggleDropdown" class="bg-gradient-to-r from-red-950 to-red-600 px-4 py-2 rounded-lg shadow-xl hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out transform hover:scale-105">
              Modifică Nume şi Cod Acces
            </button>
            <div v-if="showDropdown" ref="dropdownRef" @click.stop class="absolute right-0 mt-2 w-64 bg-gray/40 backdrop-blur-md p-4 rounded-lg shadow-lg z-50">
              <form @submit.prevent="updateUserName">
                <input type="text" v-model="newName" placeholder="Introdu Nume" class="w-full p-2 mb-2 rounded-md bg-white/70">
                <input type="text" v-model="newAccessCode" placeholder="Introdu Cod Acces" class="w-full p-2 mb-2 rounded-md bg-white/70">
                <button type="submit" class="w-full bg-gradient-to-r from-red-950 to-red-600 text-white p-2 rounded-md hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out">
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Main layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          <!-- Document Upload Section -->
          <div class="p-6 bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md rounded-lg shadow-xl text-white transition-transform transform hover:scale-105 hover:backdrop-blur-sm">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Încărcare Documente</h2>
            <input id="file-upload-custom" type="file" @change="handleFileChange" class="hidden">
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
            <input v-model="documentName" type="text" placeholder="Introdu numele documentului" class="w-full mb-3 p-2 rounded-md bg-white/70 text-black">
            <button @click="uploadDocument" 
              :disabled="!documentHash || !documentName || isProcessing"
              class="w-full bg-gradient-to-r from-red-950 to-red-600 text-white p-2 rounded-md hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out flex justify-center items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
              <svg v-if="isProcessing" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              {{ isProcessing ? 'Procesare...' : 'Încarcă Document' }}
            </button>
          </div>

          <!-- Document List with Pagination Section -->
          <div class="p-6 bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md rounded-lg shadow-xl text-white transition-transform transform hover:scale-105 hover:backdrop-blur-sm">
            <h3 class="text-xl font-semibold text-gray-100 mb-4">Documentele Încărcate</h3>
            <ul class="space-y-3">
              <li v-for="doc in paginatedDocuments" :key="doc.name" class="p-3 bg-white/70 rounded-md shadow-md">
                <span class="font-medium">{{ doc.name }}</span> - <span class="text-gray-600">{{ formatDate(doc.uploadDate) }}</span>
              </li>
            </ul>
            <!-- Pagination Controls -->
            <div class="flex justify-between mt-4">
              <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 bg-gradient-to-r from-red-950 to-red-600 text-white rounded hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
              </button>
              <span>Pagina {{ currentPage }} din {{ totalPages }}</span>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 bg-gradient-to-r from-red-950 to-red-600 text-white rounded hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                Următor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ethers } from 'ethers';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { useWalletStore } from '@/stores/walletStore';
import { toast } from 'vue3-toastify';

// Get wallet and user data from the store
const { wallet, user, fetchWalletInfo } = useWalletStore();

// Reactive variables for document upload
const documentHash = ref('');
const documentName = ref('');
const documents = ref([]); // Stores user documents

// Reactive variables for updating user information
const newName = ref('');
const newAccessCode = ref('');
const showDropdown = ref(false);
const dropdownRef = ref(null);
const isProcessing = ref(false);
const fileName = ref('');

// Pagination reactive variables
const currentPage = ref(1);
const itemsPerPage = 3;
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return documents.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(documents.value.length / itemsPerPage) || 1);

/* ---------------- Helper Functions ---------------- */

// Format a date for display
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('ro-RO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });
};

/* ---------------- Dropdown Functions ---------------- */

// Toggle the dropdown for updating user info
function toggleDropdown(event) {
  event.stopPropagation();
  showDropdown.value = !showDropdown.value;
}

// Close the dropdown when clicking outside
function closeDropdown(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
}

/* ---------------- File and Document Handling ---------------- */

// Handle file selection and generate file hash
async function handleFileChange(event) {
  const file = event.target.files[0];
  fileName.value = file.name;
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Mărimea documentului trebuie sa fie mai mică de 10MB.');
    return;
  }
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Doar documente în format Word sau PDF sunt admise.');
    return;
  }
  try {
    isProcessing.value = true;
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    documentHash.value = Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    toast.success('Hash-ul documentului s-a generat cu succes!');
  } catch (error) {
    toast.error('A apărut o eroare la generarea hash-ului.');
  } finally {
    isProcessing.value = false;
  }
}

// Upload document to blockchain and backend
async function uploadDocument() {
  if (!user.hasAccessCode) {
    toast.warning('Trebuie să ai un cod de acces valid pentru a stoca hash-uri.');
    return;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contractAddress = '0x910Da67F3feEA4B55a5775019f285caBbb282F3e'; //CONTRACT ADDRESS
  const contractABI = [
    { "inputs": [{ "internalType": "string", "name": "", "type": "string" }], "name": "documentHashes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "storeDocumentHash", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "documentHash", "type": "string" }], "name": "verifyDocument", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
  ];
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  try {
    const exists = await contract.verifyDocument(documentHash.value);
    if (exists) {
      toast.warning('Hash-ul documentului deja există.');
      documentName.value = '';
      documentHash.value = '';
      fileName.value = '';
      document.querySelector('input[type="file"]').value = '';
      return;
    }
    const tx = await contract.storeDocumentHash(documentHash.value);
    await tx.wait();
    await fetch('http://localhost:5000/upload_document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: wallet.walletAddress,
        document_name: documentName.value
      })
    });
    toast.success('Hash-ul a fost stocat cu succes!');
    fetchUserDocuments();
    // Reset fields after upload
    documentName.value = '';
    documentHash.value = '';
    fileName.value = '';
    document.querySelector('input[type="file"]').value = '';
  } catch (error) {
    toast.error('Eroare', error);
  }
}

// Update user's name and access code in the backend
async function updateUserName() {
  if (!newName.value.trim() && !newAccessCode.value.trim()) {
    toast.error('Trebuie să introduci fie numele, fie codul de acces.');
    return;
  }
  if (newName.value.trim().length > 20) {
    toast.error('Numele nu poate fi mai lung de 20 de caractere.');
    return;
  }
  const updateData = {};
  if (newName.value.trim()) updateData.name = newName.value.trim();
  if (newAccessCode.value.trim()) updateData.access_code = newAccessCode.value.trim();
  const response = await fetch(`http://localhost:5000/update_user/${wallet.walletAddress}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (response.ok) {
    toast.success('Ţi-ai actualizat datele cu succes!');
    if (updateData.name) user.name = updateData.name;
    if (updateData.access_code) user.hasAccessCode = true;
    if (updateData.name) newName.value = '';
    if (updateData.access_code) newAccessCode.value = '';
    showDropdown.value = false;
  } else {
    toast.error('Eroare la actualizarea datelor.');
  }
}

// Fetch user's documents from backend
async function fetchUserDocuments() {
  if (!wallet.walletAddress) return;
  try {
    const response = await fetch(`http://localhost:5000/documents/${wallet.walletAddress}`);
    if (response.ok) {
      const docsData = await response.json();
      if (docsData && docsData.documents) {
        // Map and sort documents: latest first
        documents.value = docsData.documents
          .map(doc => ({
            name: doc.name,
            uploadDate: new Date(doc.upload_date)
          }))
          .sort((a, b) => b.uploadDate - a.uploadDate);
      }
    }
  } catch (error) {
    toast.error('Error fetching documents:', error);
  }
}

/* ---------------- Pagination Functions ---------------- */

// Move to the next page of documents
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// Move to the previous page of documents
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

/* ---------------- Lifecycle Hooks & Watchers ---------------- */

// When the component mounts, update wallet info, fetch documents, and set up dropdown close event
onMounted(() => {
  fetchWalletInfo();
  fetchUserDocuments();
  window.addEventListener('click', closeDropdown);
});

// Reset current page if the document list shrinks
watch(documents, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

// Refetch documents when the wallet address changes
watch(() => wallet.walletAddress, async () => {
  await fetchUserDocuments();
});
</script>
