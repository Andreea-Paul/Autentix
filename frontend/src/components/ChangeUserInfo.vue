<!-- ChangeUserInfo.vue -->
<template>
    <div class="relative">
      <button @click="toggleDropdown" class="bg-gradient-to-r from-red-950 to-red-600 px-4 py-2 rounded-lg shadow-xl hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out transform hover:scale-105">
        Modifică Nume şi Cod Acces
      </button>
      <div v-if="showDropdown" ref="dropdownRef" @click.stop class="absolute right-0 mt-2 w-64 bg-gray/40 backdrop-blur-md p-4 rounded-lg shadow-lg z-50">
        <form @submit.prevent="updateUserInfo">
          <input type="text" v-model="newName" placeholder="Introdu Nume" class="w-full p-2 mb-2 rounded-md bg-white/70">
          <input type="text" v-model="newAccessCode" placeholder="Introdu Cod Acces" class="w-full p-2 mb-2 rounded-md bg-white/70">
          <button type="submit" class="w-full bg-gradient-to-r from-red-950 to-red-600 text-white p-2 rounded-md hover:from-red-800 hover:to-red-500 transition-all duration-300 ease-in-out">
            Update
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { toast } from 'vue3-toastify'
  import { useWalletStore } from '@/stores/walletStore'
  
  const { wallet, user } = useWalletStore()
  const newName = ref('')
  const newAccessCode = ref('')
  const showDropdown = ref(false)
  const dropdownRef = ref(null)
  
  // Toggles the dropdown visibility.
  function toggleDropdown(event) {
    event.stopPropagation()
    showDropdown.value = !showDropdown.value
  }
  
  // Sends updated user info to the backend.
  function updateUserInfo() {
    if (!newName.value.trim() && !newAccessCode.value.trim()) {
      toast.error('Trebuie să introduci fie numele, fie codul de acces.')
      return
    }
    if (newName.value.trim().length > 20) {
      toast.error('Numele nu poate fi mai lung de 20 de caractere.')
      return
    }
    const updateData = {}
    if (newName.value.trim()) updateData.name = newName.value.trim()
    if (newAccessCode.value.trim()) updateData.access_code = newAccessCode.value.trim()
    fetch(`http://localhost:5000/update_user/${wallet.walletAddress}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(response => {
        if (response.ok) {
          toast.success('Ţi-ai actualizat datele cu succes!')
          if (updateData.name) user.name = updateData.name
          if (updateData.access_code) user.hasAccessCode = true
          newName.value = ''
          newAccessCode.value = ''
          showDropdown.value = false
        } else {
          toast.error('Eroare la actualizarea datelor.')
        }
      })
      .catch(() => {
        toast.error('Eroare la actualizarea datelor.')
      })
  }
  
  // Closes the dropdown when clicking outside.
  function closeDropdown(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      showDropdown.value = false
    }
  }
  
  onMounted(() => {
    window.addEventListener('click', closeDropdown)
  })
  onUnmounted(() => {
    window.removeEventListener('click', closeDropdown)
  })
  </script>
  