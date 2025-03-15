import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import User from '@/views/User.vue';
import { useWalletStore } from '@/stores/walletStore';

/**
 * Define application routes.
 * - The home route ('/') is accessible to everyone.
 * - The user route ('/user') is protected and requires the wallet to be connected.
 */
const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/user',
    component: User,
    beforeEnter: (to, from, next) => {
      // Get wallet store instance to check if the wallet is connected.
      const walletStore = useWalletStore();
      if (!walletStore.wallet.walletAddress) {
        // Redirect to home if the user is not authenticated.
        next('/');
      } else {
        // Allow navigation if the user is authenticated.
        next();
      }
    },
  },
];

/**
 * Create the Vue Router instance with HTML5 history mode.
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
