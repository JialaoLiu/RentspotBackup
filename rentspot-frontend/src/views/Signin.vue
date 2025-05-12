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

      <button type="submit">Sign Up</button>
    </div>

    <div class="container" style="background-color:#f1f1f1">
      <router-link to="/"><button type="button" class="cancelbtn">Cancel</button></router-link>
      <span class="LI"><router-link to="/login">Already have an account? Log in</router-link></span>
    </div>
  </form>
</template>

<script>
import api from '../services/apiService'; // Axios instance

export default {
  name: "Signin",
  data() {
    return {
      user_name: '',
      user_email: '',
      user_password: '',
      user_phone: '',
      user_role: 0, // Default to Renter
    };
  },
  methods: {
    async handleSignIn() {
    console.log('Sign Up button clicked'); // For debugging
      try {
        const response = await api.post('/auth/register', {
          user_name: this.user_name,
          user_email: this.user_email,
          user_password: this.user_password,
          user_phone: this.user_phone,
          user_role: this.user_role,
        });
        alert('Registration successful');
        console.log(response.data);

        // Redirect to Login Page
        this.$router.push('/login');
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        alert('Registration failed: ' + (error.response?.data?.message || "Unknown error"));
      }
    },
  },
};
</script>


