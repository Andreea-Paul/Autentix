<template>
  <footer class="text-center py-3 bg-stone-950 text-white fixed bottom-0 w-full shadow-md">
    &copy; {{ currentYear }} - Toate drepturile rezervate.
  </footer>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

