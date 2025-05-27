<template>
  <form @submit.prevent="handleSignIn" class="signin-form">
    <div class="container">
      <h2>Create an Account</h2>

      <label for="name"><b>Name</b></label>
      <input type="text" placeholder="Enter Name" v-model="user_name" required>

      <label for="email"><b>Email</b></label>
      <input type="email" placeholder="Enter Email" v-model="user_email" required>

      <label for="password"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" v-model="user_password" required>

      <label for="phone"><b>Phone</b></label>
      <input type="text" placeholder="Enter Phone Number" v-model="user_phone" required>

      <label for="role"><b>Role</b></label>
      <select v-model="user_role" required>
        <option value="0">Renter</option>
        <option value="1">Landlord</option>
        <option value="2">Admin</option>
      </select>

      <!-- Cloudflare Turnstile container -->
      <div 
        id="cf-turnstile" 
        class="turnstile-container" 
        ref="turnstileContainer"
        :style="{ display: showCaptcha ? 'flex' : 'none' }"
      ></div>

      <button type="submit" class="signin-form-submit">Sign Up</button>
    </div>

    <div class="container" style="background-color:#f1f1f1">
      <router-link to="/"><button type="button" class="cancelbtn">Cancel</button></router-link>
      <span class="LI"><router-link to="/login">Already have an account? Log in</router-link></span>
    </div>
  </form>
</template>

<script>
import api from '../services/apiService';
import { useNotification } from '../composables/useNotification';

export default {
  name: "Signin",
  setup() {
    const toast = useNotification();
    return { toast };
  },
  data() {
    return {
      user_name: '',
      user_email: '',
      user_password: '',
      user_phone: '',
      user_role: 0,
      showCaptcha: true,
      turnstileWidget: null,
      turnstileToken: ''
    };
  },
  mounted() {
    this.initializeTurnstile();
  },
  methods: {
    // Initialize Turnstile on mount
    initializeTurnstile() {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.turnstile && this.$refs.turnstileContainer) {
          try {
            this.turnstileWidget = window.turnstile.render('#cf-turnstile', {
              sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABdkinnD2a45uxc0',
              callback: token => this.turnstileToken = token
            });
          } catch (error) {
            console.warn('Turnstile failed to render:', error);
          }
        }
      };
      
      script.onerror = () => {
        console.warn('Turnstile script failed to load');
      };
    },


    // Form submission handler
    async handleSignIn() {
      // Get CAPTCHA token if available
      const captchaToken = this.turnstileToken || '';

      try {
        // Prepare request data
        const requestData = {
          user_name: this.user_name,
          user_email: this.user_email,
          user_password: this.user_password,
          user_phone: this.user_phone,
          user_role: this.user_role
        };

        // Add CAPTCHA token
        if (captchaToken) {
          requestData.captcha = captchaToken;
        }

        // Submit registration
        const response = await api.post('/auth/register', requestData);
        this.toast.success('Registration successful');
        console.log(response.data);

        // Redirect to login page
        this.$router.push('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Unknown error";
        console.error(errorMessage);
        this.toast.error('Registration failed: ' + errorMessage);
        // Reset Turnstile if available
        if (this.turnstileWidget && window.turnstile) {
          window.turnstile.reset(this.turnstileWidget);
          this.turnstileToken = '';
        }
      }
    }
  },
  beforeUnmount() {
    // Clean up Turnstile widget
    if (this.turnstileWidget && window.turnstile) {
      window.turnstile.reset(this.turnstileWidget);
    }
  }
};
</script>

<style scoped>
.turnstile-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  min-height: 65px;
}
</style>