// Custom router
import { reactive, shallowRef, computed } from 'vue';

// Views
import Home from '../views/home.vue';
import Login from '../views/Login.vue';
import Signin from '../views/Signin.vue';
import RentList from '../views/RentList.vue';
import UserProfile from '../views/UserProfile.vue';
import News from '../views/News.vue';
import RentPage from '../views/RentPage.vue';
import PropertyManagement from '../views/PropertyManagement.vue';
import MyBookings from '../views/MyBookings.vue';
import MyProperty from '../views/MyProperty.vue';

// Routes
const routes = {
  '/': { name: 'Home', component: Home },
  '/rentlist': { name: 'RentList', component: RentList },
  '/rentpage': { name: 'RentPage', component: RentPage },
  '/login': { name: 'Login', component: Login },
  '/signin': { name: 'Signin', component: Signin },
  '/userprofile': { name: 'UserProfile', component: UserProfile, requiresAuth: true },
  '/my-bookings': { name: 'MyBookings', component: MyBookings, requiresAuth: true },
  '/my-property': { name: 'MyProperty', component: MyProperty, requiresAuth: true, requiresLandlord: true },
  '/news': { name: 'News', component: News },
  '/property/manage': { name: 'PropertyManagement', component: PropertyManagement, requiresAuth: true, requiresLandlord: true }
};

// State
const routerState = reactive({
  currentPath: window.location.pathname,
  params: {},
  query: {}
});

// Current
const currentRoute = shallowRef(null);

// Parse query
function parseQuery(queryString) {
  const query = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      query[key] = decodeURIComponent(value || '');
    });
  }
  return query;
}

// Match route
function matchRoute(path) {
  // Exact
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }
  
  // Dynamic routes
  if (path.startsWith('/rentpage/')) {
    const id = path.split('/')[2];
    return { route: routes['/rentpage'], params: { id } };
  }
  
  // Property management route
  if (path === '/property/manage') {
    return { route: routes['/property/manage'], params: {} };
  }
  
  return { route: routes['/'], params: {} };
}

// Navigate
function navigate(path, replace = false) {
  const queryIndex = path.indexOf('?');
  const pathname = queryIndex > -1 ? path.substring(0, queryIndex) : path;
  const queryString = queryIndex > -1 ? path.substring(queryIndex + 1) : '';
  
  routerState.currentPath = pathname;
  routerState.query = parseQuery(queryString);
  
  const { route, params } = matchRoute(pathname);
  routerState.params = params;
  
  // Auth check
  if (route.requiresAuth && !localStorage.getItem('token')) {
    navigate(`/login?redirect=${encodeURIComponent(path)}`);
    return;
  }
  
  // Landlord permission check
  if (route.requiresLandlord) {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.role || userData.role < 1) {
      navigate('/userprofile'); // Redirect to user profile
      return;
    }
  }
  
  currentRoute.value = route.component;
  
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
}

// History
window.addEventListener('popstate', () => {
  const path = window.location.pathname + window.location.search;
  navigate(path, true);
});

// API
const router = {
  push(path) {
    return new Promise((resolve) => {
      if (typeof path === 'string') {
        navigate(path);
      } else if (path.path) {
        let targetPath = path.path;
        if (path.query) {
          const queryString = Object.entries(path.query)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
          targetPath += `?${queryString}`;
        }
        navigate(targetPath);
      } else if (path.name) {
        // By name
        const entry = Object.entries(routes).find(([_, route]) => route.name === path.name);
        if (entry) {
          let targetPath = entry[0];
          if (path.params && path.params.id) {
            targetPath = `/rentpage/${path.params.id}`;
          }
          if (path.query) {
            const queryString = Object.entries(path.query)
              .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
              .join('&');
            targetPath += `?${queryString}`;
          }
          navigate(targetPath);
        }
      }
      resolve();
    });
  },
  
  replace(path) {
    return new Promise((resolve) => {
      if (typeof path === 'string') {
        navigate(path, true);
      } else if (path.path) {
        let targetPath = path.path;
        if (path.query) {
          const queryString = Object.entries(path.query)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
          targetPath += `?${queryString}`;
        }
        navigate(targetPath, true);
      }
      resolve();
    });
  },
  
  back() {
    window.history.back();
  },
  
  currentRoute: computed(() => ({
    path: routerState.currentPath,
    params: routerState.params,
    query: routerState.query,
    fullPath: routerState.currentPath + (Object.keys(routerState.query).length > 0 
      ? '?' + Object.entries(routerState.query).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '')
  }))
};

// Init
const initRouter = () => {
  const path = window.location.pathname + window.location.search;
  navigate(path, true);
  return currentRoute;
};

// Plugin
export default {
  install(app) {
    app.config.globalProperties.$router = router;
    app.config.globalProperties.$route = router.currentRoute;
    app.provide('router', router);
    app.provide('route', router.currentRoute);
  }
};

export { router, currentRoute, initRouter };