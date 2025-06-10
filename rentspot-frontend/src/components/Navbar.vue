<template>
  <nav class="navbar">
    <ul class="nav-wrapper">
      <li class="logo left-container">
        <router-link to="/">RentSpot AU</router-link>
      </li>

      <!-- Hamburger shown only on mobile -->
      <li class="hamburger-container">
        <button class="hamburger" @click="toggleMenu" :aria-expanded="isMenuOpen" aria-label="Toggle menu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </button>
      </li>

      <!-- Menu (desktop only) -->
      <li class="menu">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/rentlist">Rent</router-link></li>
          <li><router-link to="/news">News</router-link></li>
          <li><a href="#">Feedback</a></li>
          <li v-if="isLandlordOrAdmin">
            <router-link to="/property/manage" class="management-link">
              <Icon name="house" size="md" color="white" /> Property Management
            </router-link>
          </li>
        </ul>
      </li>

      <!-- Connect (desktop only) -->
      <li class="connect">
        <ul>
          <!-- Dark Mode Toggle -->
          <li class="dark-mode-item">
            <DarkModeToggle />
          </li>
          <template v-if="!isLoggedIn">
            <li><router-link to="/login">Login</router-link></li>
            <li><router-link to="/signin">Register</router-link></li>
          </template>
          <template v-else>
            <li v-if="!isLandlordOrAdmin"><router-link to="/my-bookings">My Bookings</router-link></li>
            <li v-if="isLandlordOrAdmin"><router-link to="/my-property">My Property</router-link></li>
            <li><a href="#" @click.prevent="handleLogout">Logout</a></li>
            <li>
              <router-link to="/userprofile" class="profile-link">
                <img v-if="userAvatar" :src="userAvatar" alt="Profile" class="nav-avatar" />
                <span v-else>Profile</span>
              </router-link>
            </li>
          </template>
        </ul>
      </li>
    </ul>

    <!-- Mobile menu shown only on mobile and toggled -->
    <div class="mobile-menu" :class="{ open: isMenuOpen }">
      <ul class="menu-mobile">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/rentlist">Rent</router-link></li>
        <li><router-link to="/news">News</router-link></li>
        <li><a href="#">Feedback</a></li>
        <li v-if="isLandlordOrAdmin">
          <router-link to="/property/manage" class="management-link">
            <Icon name="house" size="sm" color="white" /> Property Management
          </router-link>
        </li>
      </ul>
      <ul class="connect-mobile">
        <!-- Dark Mode Toggle for Mobile -->
        <li class="dark-mode-item-mobile">
          <DarkModeToggle />
        </li>
        <template v-if="!isLoggedIn">
          <li><router-link to="/login">Login</router-link></li>
          <li><router-link to="/signin">Register</router-link></li>
        </template>
        <template v-else>
          <li v-if="!isLandlordOrAdmin"><router-link to="/my-bookings">My Bookings</router-link></li>
          <li v-if="isLandlordOrAdmin"><router-link to="/my-property">My Property</router-link></li>
          <li><a href="#" @click.prevent="handleLogout">Logout</a></li>
          <li>
            <router-link to="/userprofile" class="profile-link">
              <img v-if="userAvatar" :src="userAvatar" alt="Profile" class="nav-avatar" />
              <span v-else>Profile</span>
            </router-link>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from '../composables/useRouter.js';
import { useNotification } from '../composables/useNotification';
import userService from '../services/userService';

// Import Icon component
import Icon from './Common/Icon.vue';
import DarkModeToggle from './DarkModeToggle.vue';

const isLoggedIn = ref(false);
const userAvatar = ref(null);
const isLandlordOrAdmin = ref(false);
const route = useRoute();
const router = useRouter();
const toast = useNotification();

//mobile
const isMenuOpen = ref(false);
const isMobileView = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  // console.log('Menu toggled:', isMenuOpen.value); // debug menu state
};

const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768;
  if (!isMobileView.value) {
    isMenuOpen.value = false; // close menu when switching to desktop
  }
  // console.log('Mobile view check:', isMobileView.value); // track responsive behavior
};

onMounted(() => {
  // console.log('Navbar component mounted'); // track component lifecycle
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobileView);
});

watch(
  () => route.value.fullPath,
  () => {
    if (isMobileView.value) {
      isMenuOpen.value = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
);

//=======================

// check login status and role
const checkLoginStatus = () => {
  let token = localStorage.getItem('token');
  isLoggedIn.value = !!token; // token exists = logged in
  
  // console.log('Checking login status:', isLoggedIn.value); // track auth state
  // console.log('Token found:', token ? 'yes' : 'no'); // debug token existence

  if (isLoggedIn.value && token) {
    let userData = JSON.parse(localStorage.getItem('user') || '{}');
    // quick fix for role checking - sometimes role comes as string
    isLandlordOrAdmin.value = userData.role >= 1 || userData.role === 'landlord' || userData.role === 'admin';
    // console.log('User role level:', userData.role); // debug role permissions
    fetchUserAvatar();
  } else {
    userAvatar.value = null;
    isLandlordOrAdmin.value = false;
  }
};

// Fetch user avatar
const fetchUserAvatar = async () => {
  try {
    const profile = await userService.getUserProfile();
    userAvatar.value = profile.avatarUrl;
    // console.log('Avatar loaded successfully'); // track avatar loading
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    // If we get a 401 or 400 error, the token might be invalid
    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      isLoggedIn.value = false;
      userAvatar.value = null;
      isLandlordOrAdmin.value = false;
    }
    // Don't show error toast as this is a background operation
  }
};

// Logout functionality
const handleLogout = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
  localStorage.removeItem('user'); // Remove user data from localStorage
  isLoggedIn.value = false; // Update login state
  userAvatar.value = null; // Clear avatar
  isLandlordOrAdmin.value = false; // Clear role state
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
watch(() => route.value.fullPath, () => {
  checkLoginStatus();
});

// Check login status on mount
onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.navbar {
  background-color: var(--color-bg-dark);
  padding: var(--space-md);
}

/* Main nav wrapper */
.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between; /* left and right spaced */
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-md);
}

/* Logo left */
.logo {
  flex: 1;
  font-weight: bold;
  color: var(--color-dark);
}

/* Desktop menu in center */
.menu {
  flex: 2;
}

.menu ul {
  display: flex;
  gap: var(--space-xl);
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu ul li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.menu ul li a:hover {
  color: var(--color-primary);
}

/* Connect right */
.connect {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.connect ul {
  display: flex;
  gap: var(--space-xl);
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.connect ul li a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.connect ul li a:hover {
  color: var(--color-primary);
}

/* Dark mode toggle styling */
.dark-mode-item,
.dark-mode-item-mobile {
  display: flex;
  align-items: center;
}

.dark-mode-item-mobile {
  justify-content: center;
  margin: 10px 0;
}

/* Profile link */
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
  border: 2px solid var(--color-primary);
}

/* Management link styling */
.management-link {
  background: var(--color-primary);
  border-radius: 6px;
  padding: 8px 12px;
  transition: var(--transition-fast);
  border: none;
  color: white !important;
}

.management-link:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  color: white !important;
}

.management-link .icon {
  margin-right: 6px;
  vertical-align: middle;
}

/* Hamburger container - hidden on desktop */
.hamburger-container {
  display: none;
}

/* Hamburger button styling */
.hamburger {
  flex-direction: column;
  gap: 5px;
  width: 30px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: var(--color-dark);
  transition: var(--transition-normal);
}

.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: var(--space-md);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: var(--color-bg-dark);
  padding: 0 1rem 1rem;
}

.mobile-menu.open {
  display: flex;
  max-height: 1000px;
}

.menu-mobile,
.connect-mobile {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-mobile li,
.connect-mobile li {
  margin: 0.5rem 0;
}

.menu-mobile li a,
.connect-mobile li a {
  color: var(--color-dark);
  text-decoration: none;
  font-weight: 500;
}

.menu-mobile li a:hover,
.connect-mobile li a:hover {
  color: var(--color-primary);
}

/* Responsive rules */

@media (max-width: 768px) {
  /* Hide desktop menu and connect */
  .menu,
  .connect {
    display: none;
  }

  /* Show hamburger */
  .hamburger-container {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  /* Navbar flex: logo left, hamburger right */
  .nav-wrapper {
    justify-content: space-between;
  }

  /* Logo should stay left */
  .logo {
    flex: none;
  }
}

@media (min-width: 769px) {
  /* Show menu and connect on desktop */
  .menu,
  .connect {
    display: block;
  }

  /* Hide hamburger on desktop */
  .hamburger-container {
    display: none;
  }

  /* Mobile menu hidden */
  .mobile-menu {
    display: none !important;
  }
}
</style>