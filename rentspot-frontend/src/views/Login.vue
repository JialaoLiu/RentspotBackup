<!-- TODO: Fix cloudflare turnstile in codespace environment for presentation!! -->
<!-- How to skip cloudflare turnstile when running in codespace??? Random URL  -->
<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <div class="imgcontainer">
      <img src="../assets/profile.png" alt="Avatar" style="width: 100px;height: 100px;"  class="avatar">
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

      <!-- Cloudflare Turnstile -->
      <div id="cf-turnstile" class="turnstile-container" ref="turnstileContainer"></div>

      <button type="submit" class="login-form-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Login' }}
      </button>

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

    <div class="container" style="background-color: var(--color-bg-secondary);">
      <router-link to="/"><button type="button" class="cancelbtn">Cancel</button></router-link>
      <span class="SI"><router-link to="/signin">Create an account</router-link></span>
    </div>
  </form>
</template>

<script setup>
import api from '../services/apiService';
import { useNotification } from '../composables/useNotification';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRoute, useRouter } from '../composables/useRouter.js';

const route = useRoute();
const router = useRouter();
const toast = useNotification();
const turnstileContainer = ref(null);
let turnstileWidget = null;

let user_email = ref('');
let user_password = ref('');
const turnstileToken = ref('');
let isSubmitting = ref(false);

const redirectPath = computed(() => route.value.query.redirect || '/');

onMounted(() => {
  // console.log('Login component mounted'); // useful for debugging navigation issues
  
  // Detect Codespaces environment specifically (not localhost)
  const isCodespaces = window.location.hostname.includes('github.dev') || 
                      window.location.hostname.includes('app.github.dev') ||
                      window.location.hostname.includes('githubpreview.dev');
  
  // Use test sitekey only for Codespaces (works on any domain)
  const siteKey = isCodespaces 
    ? (process.env.VUE_APP_TURNSTILE_TEST_SITE_KEY || '1x00000000000000000000AA')
    : (process.env.VUE_APP_TURNSTILE_SITE_KEY || '0x4AAAAAABdkinnD2a45uxc0');
  
  // load turnstile script - works fine
  let script = document.createElement('script');
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true
  script.defer = true
  document.head.appendChild(script);

  script.onload = () => {
    // console.log('Turnstile script loaded'); // debug loading issues
    // Single attempt to render Turnstile
    if (window.turnstile && turnstileContainer.value) {
      try {
        turnstileWidget = window.turnstile.render('#cf-turnstile', {
          // sitekey: '0x4AAAAAABdkinnD2a45uxc0', // Original hardcoded production key
          sitekey: siteKey, // Dynamic key selection for dev/prod environments
          callback: function(token) {
            turnstileToken.value = token;
            // console.log('Turnstile token received'); // debug callback
          }
        });
      } catch (error) {
        console.warn('Turnstile failed to render:', error);
      }
    }
  };
  
  script.onerror = () => {
    console.warn('Turnstile script failed to load');
  };
});

onBeforeUnmount(() => {
  if (turnstileWidget && window.turnstile) {
    window.turnstile.reset(turnstileWidget);
  }
});

// handle login form submission
async function handleLogin() {
  if (isSubmitting.value) return;
  
  // console.log('Login attempt for:', user_email.value); // helpful for debugging login issues
  
  if (!user_email.value || !user_password.value) {
    toast.error("Email and password are required")
    return;
  }

  // captcha token if available
  let captchaToken = turnstileToken.value || '';
  // console.log('Captcha token available:', !!captchaToken); // debug captcha issues

  isSubmitting.value = true;
  
  try {
    const response = await api.post('/auth/login', {
      user_email: user_email.value,
      user_password: user_password.value,
      captcha: captchaToken // Send the Turnstile token
    });
    
    // console.log('Login response:', response.data); // useful for debugging auth flow
    // console.log('User role from server:', response.data.user?.role); // debug role issues

    toast.success('Login successful!');
    localStorage.setItem('token', response.data.token);
    
    // Store user info
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // console.log('Stored user data:', response.data.user); // keeping this for debugging
    }
    
    // Reset form
    user_email.value = '';
    user_password.value = '';
    
    // temporary workaround for redirect issues on mobile
    if (window.innerWidth < 768) {
      // mobile redirect - needs proper fix later
      setTimeout(() => {
        router.push(redirectPath.value);
      }, 100);
    } else {
      router.push(redirectPath.value);
    }
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    toast.error(error.response?.data?.message || "Login failed");
    
    if (window.turnstile && turnstileWidget) {
      window.turnstile.reset(turnstileWidget);
    }
  } finally {
    isSubmitting.value = false;
  }
}

function socialLogin(provider) {
  toast.info(`Social login with ${provider} is not yet implemented.`);
}
</script>

<style scoped>
.turnstile-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>