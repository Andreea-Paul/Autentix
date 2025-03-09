<template>
  <Header />
  <div class="user">
    <!-- Formul pentru actualizarea numelui -->
    <div v-if="wallet.walletAddress">
      <h2>Update Your Name</h2>
      <form @submit.prevent="updateUserName">
        <div>
          <input type="text" v-model="newFirstName" placeholder=" " />
        </div>
        <div>
          <input type="text" v-model="newLastName" placeholder=" " />
        </div>
        <button type="submit">Update Name</button>
      </form>
   <Footer />   
    </div>

    <!-- Upload document -->
    <div v-if="wallet.walletAddress">
      <h2>Upload Document</h2>
      <input type="file" @change="handleFileChange" />
      <input v-model="documentName" type="text" placeholder="Enter document name" />
      <button @click="uploadDocument" :disabled="!documentHash || !documentName">Upload Document</button>
    </div>
    <div v-else>
      <p>Please log in to upload a document.</p>
    </div>

    <h3>Your Uploaded Documents:</h3>
    <ul>
      <li v-for="doc in documents" :key="doc.name">
        {{ doc.name }} - {{ formatDate(doc.uploadDate) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ethers } from 'ethers';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { useWalletStore } from '@/stores/walletStore';

const { wallet, user, fetchWalletInfo } = useWalletStore();

const documentHash = ref('');
const documentName = ref('');
const documents = ref([]); // Stochează documentele utilizatorului

// Numele noi pentru actualizare
const newFirstName = ref('');
const newLastName = ref('');

async function fetchUserDocuments() {
  if (!wallet.walletAddress) return;

  try {
    const response = await fetch(`http://localhost:5000/documents/${wallet.walletAddress}`);
    if (response.ok) {
      const docsData = await response.json();
      if (docsData && docsData.documents) {
        // Formatează data documentelor
        documents.value = docsData.documents.map(doc => ({
          name: doc.name,
          uploadDate: new Date(doc.upload_date)  // Convertește string-ul într-un obiect Date
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}

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


onMounted(() => {
  fetchWalletInfo();  // Actualizează datele utilizatorului
  fetchUserDocuments(); 
  
});

watch(() => wallet.walletAddress, async () => {
  
  await fetchUserDocuments();  // Forțează reîncărcarea documentelor
});

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
  if (!documentHash.value || !documentName.value) return;

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

  // Upload document info to the backend (Only name and date, not hash)
  await fetch('http://localhost:5000/upload_document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wallet_address: wallet.walletAddress,
      document_name: documentName.value
    })
  });

  alert('Document hash and details have been uploaded successfully!');
  fetchUserDocuments();
  window.location.reload();  // Refresh documents list
}

// Update user name
async function updateUserName() {
  if (!wallet.walletAddress) {
    alert('You must be logged in to update your name.');
    return;
  }

  if (!newFirstName.value || !newLastName.value) {
    alert('Both first name and last name are required.');
    return;
  }

  // Update user data on the backend
  const response = await fetch(`http://localhost:5000/update_user/${wallet.walletAddress}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_name: newFirstName.value,
      last_name: newLastName.value
    })
  });

  if (response.ok) {
    alert('Your name has been updated successfully!');
    user.firstName = newFirstName.value;
    user.lastName = newLastName.value;
  } else {
    alert('Failed to update name.');
  }
  window.location.reload();
}
</script>

<style scoped>
.user {
  padding: 20px;
}
h1 {
  color: #4CAF50;
}
</style>
