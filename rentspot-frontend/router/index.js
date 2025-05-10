import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/views/home.vue';
import Login from '../src/views/Login.vue';
import Signin from '../src/views/Signin.vue';
import RentList from '../src/views/Rentlist.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/rentlist',
    name: 'RentList',
    component: RentList
  },

  {
    path: '/rentpage/:id',
    name: 'RentPage',
    component: () => import('../src/views/RentPage.vue') 
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;