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

      <!-- Add reCAPTCHA widget  V2version -->
      <!-- <div class="g-recaptcha"
           data-sitekey="6Lc44TkrAAAAAOLwEP3GjcUW0bwVQBFkmWyJIu4N"
           data-callback="onCaptchaSuccess"
           data-expired-callback="onCaptchaExpired">
      </div> -->

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

export default {
  name: "Login",
  data() {
    return {
      user_email: '',
      user_password: '',
      captchaResponse: '',
    };
  },
  methods: {
    async handleLogin() {
      if (!this.user_email || !this.user_password) {
        alert('Email and password are required');
        return;
      }

      try {
        // 获取 reCAPTCHA token (v3)
        const siteKey = '6Lc44TkrAAAAAOLwEP3GjcUW0bwVQBFkmWyJIu4N';
        const token = await grecaptcha.execute(siteKey, { action: 'login' });

        const response = await api.post('/auth/login', {
          user_email: this.user_email,
          user_password: this.user_password,
          captcha: token // 将 token 发给后端
        });

        alert('Login successful');
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        alert('Login failed: ' + (error.response?.data?.message || "Unknown error"));
      }
    },
    socialLogin(provider) {
      alert(`Social login with ${provider} is not yet implemented.`);
    },
    onCaptchaSuccess(response) {
      this.captchaResponse = response; // Set the CAPTCHA response
    },
    onCaptchaExpired() {
      this.captchaResponse = ''; // Clear the CAPTCHA response
    },
  },
};
</script>
