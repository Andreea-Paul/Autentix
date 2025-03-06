<template>
  <div class="home">
    <Header /> 
    <h1>Document Validator</h1>

    <!-- Verificare document -->
    <div class="verification">
      <input type="file" @change="handleFileChange" />
      <button @click="verifyDocument" :disabled="!documentHash">Verifică Document</button>
      <p v-if="documentHash">Hash-ul documentului: {{ documentHash }}</p>
      <p v-if="verified !== null">
        Documentul este <strong>{{ verified ? 'VALID' : 'INVALID / INEXISTENT' }}</strong> pe blockchain.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import Header from '../components/Header.vue'; // Importă Header-ul

const documentHash = ref('');
const verified = ref(null);

// Funcție pentru calcularea hash-ului documentului
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

// Funcție pentru verificarea documentului pe blockchain
async function verifyDocument() {
  if (!documentHash.value) {
    alert("Te rog încarcă un document!");
    return;
  }

  if (!window.ethereum) {
    alert("Te rog instalează MetaMask!");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Înlocuiește cu adresa contractului tău
  const contractAddress = '0xf28337137Ae29E5BE2CeC98046DDf8081B2A13b0';  
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "documentHashes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        }
      ],
      "name": "storeDocumentHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        }
      ],
      "name": "verifyDocument",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    const result = await contract.verifyDocument(documentHash.value);
    verified.value = result;
  } catch (error) {
    console.error("Eroare la verificare:", error);
    alert("A apărut o eroare la verificare.");
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.verification {
  margin-bottom: 20px;
}

input {
  padding: 8px;
  width: 300px;
  margin-bottom: 10px;
}

button {
  padding: 8px 16px;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
}
</style>
