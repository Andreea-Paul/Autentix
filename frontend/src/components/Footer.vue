<template>
    <footer class="footer">
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
  
  <style scoped>
  .footer {
    text-align: center;
    padding: 10px;
    background: #222;
    color: white;
    position: fixed;
    bottom: 0;
    width: 100%;
  }
  </style>
  