<template>
  <form @submit.prevent="handleSignIn" class="signin-form">
    <div class="container">
      <h2>Create an Account</h2>

      <label for="name"><b>Name</b></label>
      <input type="text" placeholder="Enter Name" v-model="user_name" required>

      <label for="email"><b>Email</b></label>
      <input type="email" placeholder="Enter Email" v-model="user_email" required>

      <label for="password"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" v-model="user_password" @click="initializeTurnstile" required>

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
  data() {
    return {
      user_name: '',
      user_email: '',
      user_password: '',
      user_phone: '',
      user_role: 0,
      showCaptcha: false,
      turnstileWidget: null,
      turnstileToken: '',
      turnstileInitialized: false,
      scriptLoaded: false
    };
  },
  methods: {
    // Load Turnstile script once
    async loadTurnstileScript() {
      if (this.scriptLoaded || document.getElementById('turnstile-script')) {
        this.scriptLoaded = true;
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Turnstile script:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      });
    },

    // Initialize Turnstile widget once
    async initializeTurnstile() {
      // Don't initialize more than once or show if already shown
      if (this.turnstileInitialized || this.showCaptcha) return;

      this.showCaptcha = true;

      try {
        // Load script if needed
        if (!this.scriptLoaded) {
          await this.loadTurnstileScript();
        }

        // Wait briefly for DOM update
        setTimeout(() => {
          if (window.turnstile && this.$refs.turnstileContainer) {
            this.turnstileWidget = window.turnstile.render('#cf-turnstile', {
              sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABdkinnD2a45uxc0',
              callback: token => this.turnstileToken = token,
              'expired-callback': () => this.turnstileToken = ''
            });
            this.turnstileInitialized = true;
          }
        }, 100);
      } catch (error) {
        console.error('Turnstile initialization error:', error);
      }
    },

    // Reset Turnstile when needed
    resetTurnstile() {
      if (this.turnstileWidget && window.turnstile) {
        window.turnstile.reset(this.turnstileWidget);
        this.turnstileToken = '';
      }
    },

    // Show notification or alert based on availability
    notify(message, type = 'error') {
      if (typeof useNotification === 'function') {
        const toast = useNotification();
        toast[type](message);
      } else {
        alert(message);
      }
    },

    // Form submission handler
    async handleSignIn() {
      // Verify CAPTCHA is completed if it was shown
      if (this.turnstileInitialized && !this.turnstileToken) {
        this.notify('Please complete the CAPTCHA challenge');
        return;
      }

      try {
        // Prepare request data
        const requestData = {
          user_name: this.user_name,
          user_email: this.user_email,
          user_password: this.user_password,
          user_phone: this.user_phone,
          user_role: this.user_role
        };

        // Add CAPTCHA token if available
        if (this.turnstileToken) {
          requestData.captcha = this.turnstileToken;
        }

        // Submit registration
        const response = await api.post('/auth/register', requestData);
        this.notify('Registration successful', 'success');
        console.log(response.data);

        // Redirect to login page
        this.$router.push('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Unknown error";
        console.error(errorMessage);
        this.notify('Registration failed: ' + errorMessage);
        this.resetTurnstile();
      }
    }
  },
  beforeUnmount() {
    // Clean up Turnstile widget
    this.resetTurnstile();
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