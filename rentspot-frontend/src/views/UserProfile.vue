<template>
    <div>
        <form action="" class="container-user">
            <!-- Background Image -->
            <img src="https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg"
            alt="Background" id="background-user">

            <!-- Avatar and Username Section -->
            <div class="avatar-container">
                <img :src="profile.avatarUrl || '/profile.png'" alt="Avatar" id="avatar-preview">
                <h2>{{ profile.name || 'User Name' }}</h2>
            </div>
        </form>

        <!-- Buttons Section -->
        <form action="" class="container-user-btn">
            <button type="button" @click="openModal('detail')">
                <Icon name="user" size="sm" />
                Detail Profile
            </button>
            <button type="button" @click="openModal('changePassword')">
                <Icon name="key" size="sm" />
                Change Password
            </button>
            <button type="button" @click="openModal('favoriteHistory')">
                <Icon name="heart" size="sm" />
                Favorite History
            </button>
            <!-- Admin Dashboard Link -->
            <button v-if="profile.role === 2" type="button" @click="goToAdmin" class="admin-button">
                <Icon name="admin_panel_settings" size="sm" />
                Admin Dashboard
            </button>
        </form>

        <!-- Modal for Popups -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <button class="modal-close" @click="closeModal">&times;</button>
                <div v-if="currentModal === 'detail'">
                    <h2>Detail Profile</h2>
                    <form @submit.prevent="updateProfile">
                        <div class="form-group">
                            <label for="avatar">Avatar</label>
                            <input type="file" id="avatar-upload" @change="handleAvatarUpload" accept="image/*" />
                            <div class="avatar-preview-container">
                                <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar Preview" class="avatar-preview" />
                                <div v-if="loadingState === 'avatar'" class="avatar-uploading">
                                    <span>Uploading...</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" v-model="profile.name" placeholder="Enter your full name" />
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="text" id="phone" v-model="profile.phone" placeholder="Enter your phone number" />
                        </div>
                        <div class="form-group">
                            <label for="dob">Date of Birth</label>
                            <input type="date" id="dob" v-model="profile.dateOfBirth" />
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="profile.email" disabled />
                            <span class="input-hint">Email cannot be changed</span>
                        </div>
                        <button type="submit" :disabled="loadingState === 'profile'">{{ loadingState === 'profile' ? 'Saving...' : 'Save Profile' }}</button>
                    </form>
                </div>
                <div v-else-if="currentModal === 'changePassword'">
                    <h2>Change Password</h2>
                    <form @submit.prevent="changePassword">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" v-model="passwords.currentPassword" placeholder="Enter current password" />
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" v-model="passwords.newPassword" placeholder="Enter new password" />
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" v-model="passwords.confirmPassword" placeholder="Confirm new password" />
                        </div>
                        <div v-if="passwordError" class="form-error">{{ passwordError }}</div>
                        <button type="submit" :disabled="loadingState === 'password'">{{ loadingState === 'password' ? 'Submitting...' : 'Submit' }}</button>
                    </form>
                </div>
                <div v-else-if="currentModal === 'favoriteHistory'">
                    <h2>Favorite Properties</h2>
                    <div v-if="loadingState === 'favorites'" class="loading-message">Loading favorites...</div>
                    <div v-else-if="favorites.length === 0" class="no-favorites">
                        <p>You haven't saved any properties yet.</p>
                        <p>Explore properties and click the heart icon to add them to your favorites.</p>
                    </div>
                    <ul v-else class="favorites-list">
                        <li v-for="item in favorites" :key="item.id" class="favorite-item" @click="viewProperty(item.id)">
                            <div class="favorite-image">
                                <img :src="item.image || 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'" :alt="item.title">
                            </div>
                            <div class="favorite-details">
                                <h3>{{ item.title }}</h3>
                                <p class="favorite-price">${{ item.price }}/week</p>
                                <p class="favorite-features">
                                    <span>{{ item.bedrooms }} bed</span> •
                                    <span>{{ item.bathrooms }} bath</span>
                                </p>
                                <p class="favorite-date">Saved on: {{ formatDate(item.favorite_saved_at) }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Success notification -->
        <div v-if="showSuccess" class="success-notification">
            <div class="success-content">
                <span class="success-icon">✓</span>
                <span>{{ successMessage }}</span>
                <button @click="showSuccess = false" class="close-success">&times;</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from '../composables/useRouter.js';
import userService from '../services/userService';
import { useNotification } from '../composables/useNotification';
import Icon from '../components/Common/Icon.vue';

const router = useRouter();
const toast = useNotification();

// Modal state
const showModal = ref(false);
const currentModal = ref(null);

// Profile state
const profile = ref({
    id: null,
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    avatarUrl: null,
    role: 0
});

// Unified loading state: 'idle' | 'profile' | 'avatar' | 'password' | 'favorites'
const loadingState = ref('idle');

// Avatar state
const avatarPreview = ref(null);
const avatarFile = ref(null);

// Password state
const passwords = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const passwordError = ref('');

// Favorites state
const favorites = ref([]);

// Success notification
const showSuccess = ref(false);
const successMessage = ref('');

// Open modal
function openModal(modalName) {
    // If opening the favorites modal, load the favorites
    if (modalName === 'favoriteHistory') {
        loadFavorites();
    }

    currentModal.value = modalName;
    showModal.value = true;

    // Reset form errors
    passwordError.value = '';
}

// Close modal
function closeModal() {
    showModal.value = false;
    currentModal.value = null;

    // Reset avatar preview when modal closes
    if (currentModal.value === 'detail') {
        avatarPreview.value = null;
    }

    // Reset password form
    if (currentModal.value === 'changePassword') {
        passwords.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        passwordError.value = '';
    }
}

/* 
 * Handle avatar upload with resize
 * - resizes image to max 400x400
 * - creates preview for user
 */
async function handleAvatarUpload(event) {
    let file = event.target.files[0];
    if (!file) return;
    
    // console.log('Selected file:', file.name, file.size); // debug info

    // Store the file for actual upload later
    avatarFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            // Calculate the scaling factor to preserve aspect ratio
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            // Set canvas dimensions and draw the resized image
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Generate a new image URL from the canvas
            avatarPreview.value = canvas.toDataURL('image/png');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// update profile - basic but works
const updateProfile = async () => {
    if (loadingState.value !== 'idle') return;
    
    // console.log('Starting profile update...', profile.value); // keep for debugging
    // debugger; // remove this before codespaces deployment

    loadingState.value = 'profile';
    try {
        // avatar upload first if needed
        if (avatarFile.value) {
            // console.log('Uploading avatar...'); // useful for debugging upload issues
            loadingState.value = 'avatar';
            let uploadResult = await userService.uploadUserAvatar(avatarFile.value);
            // console.log('Avatar upload result:', uploadResult); // keeping this for now
            profile.value.avatarUrl = uploadResult.avatarUrl;
            avatarFile.value = null; // Reset the file reference
        }

        loadingState.value = 'profile';
        // Now update the profile
        const updatedData = {
            name: profile.value.name,
            phone: profile.value.phone,
            dateOfBirth: profile.value.dateOfBirth
        };

        await userService.updateUserProfile(updatedData);

        // Show success message
        toast.success('Profile updated successfully!');

        // Close the modal
        closeModal();

        // Refresh the profile data
        loadProfile();
    } catch (error) {
        toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
        loadingState.value = 'idle';
    }
}

// Change password
async function changePassword() {
    if (loadingState.value !== 'idle') return;

    // Validate password confirmation
    if (passwords.value.newPassword !== passwords.value.confirmPassword) {
        passwordError.value = 'New password and confirmation do not match';
        return;
    }

    loadingState.value = 'password';
    passwordError.value = '';

    try {
        await userService.changeUserPassword({
            currentPassword: passwords.value.currentPassword,
            newPassword: passwords.value.newPassword
        });

        // Show success message
        toast.success('Password changed successfully!');

        // Close the modal
        closeModal();

        // Reset the form
        passwords.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    } catch (error) {
        passwordError.value = error.response?.data?.message || 'Error changing password. Please try again.';
    } finally {
        loadingState.value = 'idle';
    }
}

// Load user profile
async function loadProfile() {
    try {
        const userProfile = await userService.getUserProfile();
        profile.value = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
            avatarUrl: userProfile.avatarUrl,
            role: userProfile.role
        };
    } catch (error) {
        toast.error('Error loading profile: ' + (error.response?.data?.message || error.message));

        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
            router.push('/login?redirect=/userprofile');
        }
    }
}

// Load user favorites
async function loadFavorites() {
    loadingState.value = 'favorites';
    try {
        favorites.value = await userService.getUserFavorites();
        // console.log('Loaded favorites:', favorites.value.length); // helpful for debugging
    } catch (error) {
        // console.error('Favorites loading failed:', error); // keep this for troubleshooting
        toast.error('Error loading favorites: ' + (error.response?.data?.message || error.message));
    } finally {
        loadingState.value = 'idle';
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// View property details
function viewProperty(propertyId) {
    closeModal();
    router.push(`/rentpage/${propertyId}`);
}

// Navigate to admin dashboard
function goToAdmin() {
    router.push('/admin');
}


// Load profile on component mount
onMounted(() => {
    loadProfile();
});
</script>

<style scoped>
/* Main container for user profile */
.container-user {
  position: relative;
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  text-align: center;
}

/* Background Image */
#background-user {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

/* Avatar and Username Container */
.avatar-container {
  position: relative;
  display: flex;
  flex-direction: column; /* Stack avatar and username */
  align-items: center; /* Center align avatar and username */
  margin-top: -50px; /* Pull avatar into the background */
}

/* Avatar Image */
#avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--color-bg-primary);
  background-color: var(--color-bg-secondary);
  object-fit: cover;
}

#avatar-upload {
  margin-top: 10px;
  font-size: 14px;
}

/* Avatar preview in form */
.avatar-preview-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  position: relative;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.avatar-uploading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

/* Username Styling */
.avatar-container h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0; /* Add spacing above username */
  color: var(--color-dark);
}

/* Button container */
.container-user-btn {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  padding: 0 20px;
  align-items: center; /* Center buttons horizontally */
}

/* Buttons for actions */
.container-user-btn button {
  width: 100%; /* Full width on small screens */
  max-width: 300px; /* Limit width on larger screens */
  padding: 12px 24px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  transition: background-color var(--transition-normal), transform var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Button hover effect */
.container-user-btn button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

/* Admin button specific styling */
.admin-button {
  background-color: #c2185b !important;
}

.admin-button:hover {
  background-color: #a91648 !important;
}


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-close:hover {
  color: red;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  color: #777;
}

.input-hint {
  font-size: 12px;
  color: #777;
  margin-top: 5px;
  display: block;
}

.form-error {
  color: #d32f2f;
  margin-bottom: 15px;
  font-size: 14px;
}

/* Submit button */
button[type="submit"] {
  width: 100%;
  padding: 12px 15px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #0056b3;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Favorites list */
.favorites-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.favorite-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.favorite-item:hover {
  background-color: #f9f9f9;
}

.favorite-image {
  width: 100px;
  height: 75px;
  overflow: hidden;
  margin-right: 12px;
  border-radius: 4px;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-details {
  flex: 1;
}

.favorite-details h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.favorite-price {
  color: #007BFF;
  font-weight: bold;
  margin: 2px 0;
}

.favorite-features {
  color: #666;
  font-size: 14px;
  margin: 2px 0;
}

.favorite-date {
  color: #999;
  font-size: 12px;
  margin: 4px 0 0;
}

.loading-message, .no-favorites {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-favorites p:first-child {
  font-weight: bold;
  margin-bottom: 10px;
}

/* Success notification */
.success-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
}

.success-content {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.success-icon {
  font-size: 18px;
  margin-right: 10px;
}

.close-success {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .favorite-image {
    width: 80px;
    height: 60px;
  }

  .favorite-details h3 {
    font-size: 14px;
  }

  .container-user-btn {
    padding: 0 10px;
  }
}
</style>