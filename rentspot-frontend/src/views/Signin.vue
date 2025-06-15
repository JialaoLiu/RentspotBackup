<!-- CAPTCHA automatically skipped in GitHub Codespaces environment -->
<template>
  <form @submit.prevent="handleSignIn" class="signin-form">
    <div class="container">
      <h2>Create an Account</h2>

      <label for="name"><b>Name</b></label>
      <input type="text" placeholder="Enter Name" v-model="user_name" required>
      <div v-if="validationErrors.name" class="field-error">{{ validationErrors.name }}</div> <!-- Error message for name field -->

      <label for="email"><b>Email</b></label>
      <input type="email" placeholder="Enter Email" v-model="user_email" required>
      <div v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</div> <!-- Error message for name field -->

      <label for="password"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" v-model="user_password" required :class="passwordStrengthClass">
      <ul class="password-checklist">
        <li :class="{ passed: /[a-z]/.test(user_password) }">✔ Lowercase letter</li>
        <li :class="{ passed: /[A-Z]/.test(user_password) }">✔ Uppercase letter</li>
        <li :class="{ passed: /[0-9]/.test(user_password) }">✔ Number</li>
        <li :class="{ passed: /[^A-Za-z0-9]/.test(user_password) }">✔ Symbol</li>
        <li :class="{ passed: user_password.length >= 8 }">✔ At least 8 characters</li>
      </ul>
      <div v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</div> <!-- Error message for name field -->

      <label for="phone"><b>Phone</b></label>
      <input type="text" placeholder="Enter Phone Number" v-model="user_phone" required>
      <div v-if="validationErrors.phone" class="field-error">{{ validationErrors.phone }}</div> <!-- Error message for name field -->

      <label for="role"><b>Role</b></label>
      <select v-model="user_role" required>
        <option value="0">Renter</option>
        <option value="1">Landlord</option>
        <option value="2">Admin</option>
      </select>

      <!-- Cloudflare Turnstile container (disabled in Codespaces) -->
      <div
        v-if="!isCodespaces"
        id="cf-turnstile"
        class="turnstile-container"
        ref="turnstileContainer"
        :style="{ display: showCaptcha ? 'flex' : 'none' }"
      ></div>
      <div v-else class="codespaces-notice">
        <p>CAPTCHA verification skipped (Codespaces environment)</p>
      </div>

      <!-- btn can be click but still need to verify -->
      <button type="submit" class="signin-form-submit">Sign Up</button>
    </div>

    <div class="container" style="background-color: var(--color-bg-secondary);">
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
      turnstileToken: '',
      isCodespaces: window.location.hostname.includes('github.dev') || 
                    window.location.hostname.includes('app.github.dev') ||
                    window.location.hostname.includes('githubpreview.dev'),
      validationErrors: {
        name: '',
        email: '',
        password: '',
        phone: ''
      }
    };
  },
  // Computed properties for password strength and form validation
  computed: {
    passwordStrengthClass() {
      if (!this.user_password) return '';
      return this.isPasswordStrong ? 'strong-password' : 'weak-password';
    },
    isPasswordStrong() {
      const pwd = this.user_password;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
      const longEnough = pwd.length >= 8;
      return hasUpper && hasLower && hasNumber && hasSymbol && longEnough;
    },
    isFormValid() {
      return this.user_name.trim() !== '' &&
             this.user_email.trim() !== '' &&
             this.user_phone.trim() !== '' &&
             this.isValidEmail(this.user_email) &&
             this.isPasswordStrong;
    }
  },
  watch: {
    // Clear error messages when user starts typing
    user_name() {
      if (this.validationErrors.name) this.validationErrors.name = '';
    },
    user_email() {
      if (this.validationErrors.email) this.validationErrors.email = '';
    },
    user_password() {
      if (this.validationErrors.password) this.validationErrors.password = '';
    },
    user_phone() {
      if (this.validationErrors.phone) this.validationErrors.phone = '';
    }
  },
  mounted() {
    this.initializeTurnstile();
  },
  methods: {
    // Validate individual field
    validateField(fieldName) {
      this.validationErrors[fieldName] = '';

      switch (fieldName) {
        case 'name':
          if (!this.user_name.trim()) {
            this.validationErrors.name = 'Name is required';
          }
          break;
        case 'email':
          if (!this.user_email.trim()) {
            this.validationErrors.email = 'Email is required';
          } else if (!this.isValidEmail(this.user_email)) {
            this.validationErrors.email = 'Please enter a valid email address';
          }
          break;
        case 'password':
          if (!this.user_password) {
            this.validationErrors.password = 'Password is required';
          } else if (!this.isPasswordStrong) {
            this.validationErrors.password = 'Password must meet all requirements above';
          }
          break;
        case 'phone':
          if (!this.user_phone.trim()) {
            this.validationErrors.phone = 'Phone number is required';
          }
          break;
      }
    },

    // Validate all fields
    validateForm() {
      this.validateField('name');
      this.validateField('email');
      this.validateField('password');
      this.validateField('phone');

      return this.isFormValid;
    },

    // Email format validation
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Initialize Turnstile on mount
    initializeTurnstile() {
      // Skip CAPTCHA initialization in Codespaces
      if (this.isCodespaces) {
        console.log('Codespaces environment - CAPTCHA disabled');
        return;
      }
      
      // Use standard sitekey for non-Codespaces environments
      const siteKey = process.env.VUE_APP_TURNSTILE_SITE_KEY || '0x4AAAAAABdkinnD2a45uxc0';
      
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.turnstile && this.$refs.turnstileContainer) {
          try {
            this.turnstileWidget = window.turnstile.render('#cf-turnstile', {
              sitekey: siteKey,
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

    // Form submission handler with validation
    async handleSignIn() {
      // First validate the form
      const isValid = this.validateForm();

      // If validation fails, return directly without submitting
      if (!isValid) {
        return;
      }

      // Only proceed with submission if validation passes
      const captchaToken = this.turnstileToken || '';

      try {
        const requestData = {
          user_name: this.user_name,
          user_email: this.user_email,
          user_password: this.user_password,
          user_phone: this.user_phone,
          user_role: this.user_role
        };

        if (captchaToken) {
          requestData.captcha = captchaToken;
        }

        const response = await api.post('/auth/register', requestData);
        this.toast.success('Registration successful');
        console.log(response.data);

        this.$router.push('/login');
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Unknown error";
        console.error(errorMessage);
        this.toast.error('Registration failed: ' + errorMessage);

        if (this.turnstileWidget && window.turnstile) {
          window.turnstile.reset(this.turnstileWidget);
          this.turnstileToken = '';
        }
      }
    }
  },
  beforeUnmount() {
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

/* password standard */
.strong-password {
  border: 2px solid green;
  background-color: #f0fff4;
}

.weak-password {
  border: 2px solid red;
  background-color: #fff0f0;
}

.password-checklist {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0.5rem 0 1rem;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.password-checklist li {
  padding: 4px 8px;
  border-radius: 5px;
  background-color: #ffe6e6;
  color: red;
  white-space: nowrap;
}

.password-checklist li.passed {
  background-color: #e6ffe6;
  color: green;
  font-weight: bold;
}


/* Field error message styles */
.field-error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.codespaces-notice {
  margin: 20px 0;
  padding: 10px;
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 5px;
  text-align: center;
  color: #2e7d32;
  font-size: 0.9rem;
}
</style>