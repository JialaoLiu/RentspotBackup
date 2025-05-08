import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/views/home.vue';
import Login from '../src/views/Login.vue';
import Signin from '../src/views/Signin.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/Login',
    name: 'Login',
    component: Login
  },

  {
    path: '/Signin',
    name: 'Signin',
    component: Signin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;