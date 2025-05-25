import { createApp } from 'vue';
import App from '../src/App.vue';
import customRouter from '../src/router/customRouter.js';
import RouterLink from '../src/components/RouterLink.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '../src/style.css';
import { POSITION } from 'vue-toastification';

const app = createApp(App);
app.use(customRouter);
app.component('router-link', RouterLink);
app.use(Toast, {
  position: POSITION.TOP_CENTER,
  timeout: 2000,
  transition: 'Vue-Toastification__bounce',
  closeOnClick: true,
  pauseOnHover: true,
  hideProgressBar: false,

  toastClassName: ['Vue-Toastification__toast', 'rentspot-toast'],
  bodyClassName: 'rentspot-toast-body'
});
app.mount('#app');