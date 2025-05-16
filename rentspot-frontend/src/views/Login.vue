<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <div class="imgcontainer">
      <img src="./images/profile.png" alt="Avatar" class="avatar">
    </div>

    <div class="container">
      <label for="email"><b>Email</b></label>
      <input type="text" placeholder="Enter Email" v-model="user_email" required>

      <label for="password"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" v-model="user_password" required>

      <span class="psw"><a href="#">Forgot password?</a></span>

      <label>
        <input type="checkbox" checked="checked" name="remember"> Remember me
      </label>

      <!-- Cloudflare Turnstile Widget -->
      <div id="cf-turnstile" class="turnstile-container" ref="turnstileContainer"></div>

      <button type="submit">Login</button>

      <div style="width: 100%; text-align: center; border-bottom: 1px solid #ccc; line-height: 0; margin: 20px 0;">
        <span style="background: white; padding: 0 10px;">or</span>
      </div>

      <div class="container">
        <button type="button" class="login social" @click="socialLogin('google')">
          <i class="fab fa-google"></i> Continue with Google
        </button>
        <button type="button" class="login social" @click="socialLogin('facebook')">
          <i class="fab fa-facebook-f"></i> Continue with Facebook
        </button>
        <button type="button" class="login social" @click="socialLogin('apple')">
          <i class="fab fa-apple"></i> Continue with Apple
        </button>
      </div>
    </div>

    <div class="container" style="background-color:#f1f1f1">
      <router-link to="/"><button type="button" class="cancelbtn">Cancel</button></router-link>
      <span class="SI"><router-link to="/signin">Create an account</router-link></span>
    </div>
  </form>
</template>

<script>
import api from '../services/apiService'; // Axios instance
import { useNotification } from '../composables/useNotification';
import { onMounted, onBeforeUnmount, ref } from 'vue';

export default {
  name: "Login",
  setup() {
    const toast = useNotification();
    const turnstileContainer = ref(null);
    let turnstileWidget = null;

    onMounted(() => {
      // Load Cloudflare Turnstile script
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize Turnstile when script is loaded
        if (window.turnstile) {
          renderTurnstile();
        } else {
          // If turnstile is not available immediately, try again after a short delay
          setTimeout(renderTurnstile, 1000);
        }
      };
    });

    onBeforeUnmount(() => {
      // Clean up the Turnstile widget when component is unmounted
      if (turnstileWidget) {
        window.turnstile.reset(turnstileWidget);
      }
    });

    function renderTurnstile() {
      if (window.turnstile && turnstileContainer.value) {
        turnstileWidget = window.turnstile.render('#cf-turnstile', {
          sitekey: '0x4AAAAAABdkinnD2a45uxc0', 
          callback: function(token) {
            // This function executes when the user completes the Turnstile challenge
            // The token will be sent with the login request
          }
        });
      }
    }

    return { 
      turnstileContainer, 
      toast,
      renderTurnstile
    };
  },
  data() {
    return {
      user_email: '',
      user_password: '',
      turnstileToken: ''
    };
  },
  methods: {
    async handleLogin() {
      if (!this.user_email || !this.user_password) {
        this.toast.error('Email and password are required');
        return;
      }

      // Get the Turnstile token
      this.turnstileToken = this.getTurnstileToken();
      
      if (!this.turnstileToken) {
        this.toast.error('Please complete the CAPTCHA challenge');
        return;
      }

      try {
        const response = await api.post('/auth/login', {
          user_email: this.user_email,
          user_password: this.user_password,
          captcha: this.turnstileToken // Send the Turnstile token instead of reCAPTCHA
        });

        this.toast.success('Login successful!');
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        this.$router.push('/');
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        this.toast.error(error.response?.data?.message || "Login failed");
      }
    },
    getTurnstileToken() {
      // Get the token from the Turnstile widget
      return window.turnstile?.getResponse(this.turnstileWidget) || '';
    },
    socialLogin(provider) {
      this.toast.info(`Social login with ${provider} is not yet implemented.`);
    }
  }
};
</script>

<style scoped>
.turnstile-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}
</style>