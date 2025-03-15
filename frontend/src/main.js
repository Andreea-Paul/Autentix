import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'vue3-toastify/dist/index.css';
import Vue3Toastify from 'vue3-toastify';
import './style.css';

/**
 * Create the Vue application instance.
 */
const app = createApp(App);

/**
 * Configure global plugins:
 * - Vue3Toastify for toast notifications with autoClose after 3 seconds and top-right positioning.
 * - Pinia for state management.
 * - Vue Router for navigation.
 */
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "top-right",
  style: {
    fontSize: "18px", 
    padding: "20px",  
    minWidth: "450px", 
  }
});
app.use(createPinia());
app.use(router);

/**
 * Mount the application to the DOM element with id "app".
 */
app.mount('#app');
