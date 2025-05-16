<template>
  <nav class="navbar">
    <ul>
      <div class="logo">
        <li><router-link to="/">RentSpot AU</router-link></li>
      </div>
      <div class="menu">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/rentlist">Rent</router-link></li>
        <!-- <li><a href="#">Shared Rent</a></li> -->
        <li><a href="#">News</a></li>
        <li><a href="#">Feedback</a></li>
      </div>
      <div class="connect">
        <template v-if="!isLoggedIn">
        <li>
    <router-link to="/login">Login</router-link>
  </li>
  <li>
    <router-link to="/signin">Register</router-link>
  </li>
</template>
<template v-else>
  <li>
    <a href="#" @click="handleLogout">Logout</a>
  </li>
  <li>
    <router-link to="/userprofile:id',
">Profile</router-link>
  </li>
</template>
        <!-- <li v-if="!isLoggedIn">
          <router-link to="/login">Login</router-link>
        </li>
        <li v-if="!isLoggedIn">
          <router-link to="/signin">Register</router-link>
        </li>
        <li v-else>
          <a href="#" @click="handleLogout">Logout</a>
        </li>
        <li v-else>
          <router-link to="/userprofile:id">Profile</router-link>
        </li> -->
      </div>
    </ul>
  </nav>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

export default {
  name: 'Navbar',
  setup() {
    const isLoggedIn = ref(false);

    // Check login status
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token; // If token exists, user is logged in
    };

    // Logout functionality
    const handleLogout = () => {
      localStorage.removeItem('token'); // Remove token from localStorage
      isLoggedIn.value = false; // Update login state
      alert('You have been logged out!');
    };

    // Watch for changes in localStorage (in case login state changes elsewhere)
    watch(
      () => localStorage.getItem('token'),
      () => {
        checkLoginStatus();
      }
    );

    // Check login status on mount
    onMounted(() => {
      checkLoginStatus();
    });

    return {
      isLoggedIn,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.navbar {
  background-color: black;
  padding: 1rem;
}

.navbar ul {
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex: 2;
}

.menu li, .Connect li {
  display: inline-block;
}

.connect {
  display: flex;
  gap: 2rem;
  justify-content: flex-end;
}

.navbar a {
  text-decoration: none;
  color: white;
  font-weight: 500;
}

.navbar a:hover {
  color: #646cff;
}
</style>