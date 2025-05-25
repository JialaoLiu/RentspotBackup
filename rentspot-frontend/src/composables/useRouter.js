import { inject } from 'vue';

export function useRouter() {
  const router = inject('router');
  if (!router) {
    throw new Error('Router not found. Make sure the app is using the custom router.');
  }
  return router;
}

export function useRoute() {
  const route = inject('route');
  if (!route) {
    throw new Error('Route not found. Make sure the app is using the custom router.');
  }
  return route;
}