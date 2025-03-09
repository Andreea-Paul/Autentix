import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import User from '@/views/User.vue';
import { useWalletStore } from '@/stores/walletStore';

const routes = [
  { path: '/', component: Home },
  { 
    path: '/user', 
    component: User,
    beforeEnter: (to, from, next) => {
      const walletStore = useWalletStore();
      if (!walletStore.wallet.walletAddress) {
        next('/'); // Redirecționează utilizatorul dacă nu este autentificat
      } else {
        next();
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
