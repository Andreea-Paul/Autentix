<!-- user.vue -->
<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="flex-grow flex flex-col items-center justify-center bg-radial from-zinc-200 from-70% to-zinc-900 bg-cover bg-center relative">
      <div class="absolute inset-0 bg-animated-gradient backdrop-blur-lg bg-white/30"></div>
      <div class="relative z-10 w-full max-w-5xl mx-auto p-6 flex flex-col gap-6">
        <div class="flex justify-end">
          <ChangeUserInfo />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          <UploadDocument @documentUploaded="handleDocumentUploaded" />
          <DocumentList ref="documentListRef" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import UploadDocument from '../components/UploadDocument.vue';
import DocumentList from '../components/DocumentList.vue';
import ChangeUserInfo from '../components/ChangeUserInfo.vue';

const documentListRef = ref(null);

function handleDocumentUploaded() {
  if (documentListRef.value && documentListRef.value.fetchUserDocuments) {
    documentListRef.value.fetchUserDocuments();
  }
}
</script>
