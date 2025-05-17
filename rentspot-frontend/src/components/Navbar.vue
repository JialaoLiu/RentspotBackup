<template>
  <nav class="navbar">
    <ul>
      <div class="logo">
        <li><router-link to="/">RentSpot AU</router-link></li>
      </div>
      <div class="menu">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/rentlist">Rent</router-link></li>
        <li><router-link to="/news">News</router-link></li>
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
            <a href="#" @click.prevent="handleLogout">Logout</a>
          </li>
          <li>
            <router-link to="/userprofile" class="profile-link">
              <img v-if="userAvatar" :src="userAvatar" alt="Profile" class="nav-avatar" />
              <span v-else>Profile</span>
            </router-link>
          </li>
        </template>
      </div>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotification } from '../composables/useNotification';
import userService from '../services/userService';

const isLoggedIn = ref(false);
const userAvatar = ref(null);
const route = useRoute();
const router = useRouter();
const toast = useNotification();

// Check login status
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token; // If token exists, user is logged in

  // If logged in, try to get user profile for avatar
  if (isLoggedIn.value) {
    fetchUserAvatar();
  } else {
    userAvatar.value = null;
  }
};

// Fetch user avatar
const fetchUserAvatar = async () => {
  try {
    const profile = await userService.getUserProfile();
    userAvatar.value = profile.avatarUrl;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    // Don't show error toast as this is a background operation
  }
};

// Logout functionality
const handleLogout = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
  isLoggedIn.value = false; // Update login state
  userAvatar.value = null; // Clear avatar
  toast.success('Logged out successfully!');
  router.push('/'); // Redirect to home page
};

// Watch for changes in localStorage (in case login state changes elsewhere)
watch(
  () => localStorage.getItem('token'),
  () => {
    checkLoginStatus();
  }
);

// Watch for route changes
watch(() => route.fullPath, () => {
  checkLoginStatus();
});

// Check login status on mount
onMounted(() => {
  checkLoginStatus();
});
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

.menu li,
.connect li {
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

/* Profile link with avatar */
.profile-link {
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #646cff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .menu {
    gap: 1rem;
  }

  .connect {
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .navbar ul {
    flex-direction: column;
    gap: 1rem;
  }

  .menu,
  .connect {
    width: 100%;
    justify-content: center;
  }
}
</style>