<!-- DocumentList.vue -->
<template>
  <div class="p-6 bg-gradient-to-b from-gray-950 to-gray-400 backdrop-blur-md rounded-lg shadow-xl text-white transition-transform transform hover:scale-105 hover:backdrop-blur-sm">
    <h3 class="text-xl font-semibold text-gray-100 mb-4">Documentele Încărcate</h3>
    <ul class="space-y-3">
      <li v-for="doc in paginatedDocuments" :key="doc.name" class="p-3 bg-white/70 rounded-md shadow-md">
        <span class="font-medium">{{ doc.name }}</span> - <span class="text-gray-600">{{ formatDate(doc.uploadDate) }}</span>
      </li>
    </ul>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useWalletStore } from '@/stores/walletStore'

const { wallet } = useWalletStore()
const documents = ref([])
const currentPage = ref(1)
const itemsPerPage = 3

// Computed: paginated documents.
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return documents.value.slice(start, start + itemsPerPage)
})

// Computed: total pages.
const totalPages = computed(() => Math.ceil(documents.value.length / itemsPerPage) || 1)

// Formats a date using the Romanian locale.
function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

// Fetches documents from the backend.
async function fetchUserDocuments() {
  if (!wallet.walletAddress) return
  try {
    const response = await fetch(`http://localhost:5000/documents/${wallet.walletAddress}`)
    if (response.ok) {
      const docsData = await response.json()
      if (docsData && docsData.documents) {
        documents.value = docsData.documents
          .map(doc => ({
            name: doc.name,
            uploadDate: new Date(doc.upload_date)
          }))
          .sort((a, b) => b.uploadDate - a.uploadDate)
      }
    }
  } catch (error) {
    toast.error('Eroare la preluarea documentelor:', error)
  }
}

// Increments current page.
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Decrements current page.
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

onMounted(() => {
  fetchUserDocuments()
})

defineExpose({ fetchUserDocuments })
</script>
