import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/views/home.vue';
import Login from '../src/views/Login.vue';
import Signin from '../src/views/Signin.vue';
import RentList from '../src/views/Rentlist.vue';
import User from '../src/views/UserProfile.vue';

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
  },

  {
    path: '/userprofile:id',
    name: 'User',
    component: User
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;