import { createApp } from 'vue';
import Home from '../src/views/home.vue';
import App from '../src/App.vue';
import router from '../router/index.js';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import '../src/style.css';
import { POSITION } from 'vue-toastification';

const app = createApp(App);
app.use(router);
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