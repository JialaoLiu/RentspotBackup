import { createRouter, createWebHistory } from 'vue-router';
import Home from '../src/views/home.vue';
import Login from '../src/views/Login.vue';
import Signin from '../src/views/Signin.vue';
import RentList from '../src/views/RentList.vue';
import UserProfile from '../src/views/UserProfile.vue';
import News from '../src/views/News.vue';

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
    path: '/userprofile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/news',
    name: 'News',
    component: News
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for routes that require authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');
  
  if (requiresAuth && !token) {
    // Redirect to login page with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
});

export default router;