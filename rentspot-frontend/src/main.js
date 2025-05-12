import { createApp } from 'vue';
import Home from '../src/views/home.vue';
import App from '../src/App.vue';
import router from '../router/index.js';
import '../src/style.css';

const app = createApp(App);
app.use(router);
app.mount('#app');