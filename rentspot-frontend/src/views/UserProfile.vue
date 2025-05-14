<template>
    <div>
        <form action="" class="container-user">
            <!-- Background Image -->
            <img src="https://images.pexels.com/photos/257540/pexels-photo-257540.jpeg?cs=srgb&dl=pexels-pixabay-257540.jpg&fm=jpg"
            alt="Background" id="background-user">

            <!-- Avatar and Username Section -->
            <div class="avatar-container">
                <img src="../assets/vue.svg" alt="Avatar" id="avatar-preview">
                <h2>User Name</h2>
            </div>
        </form>

        <!-- Buttons Section -->
        <form action="" class="container-user-btn">
            <button type="button" @click="openModal('detail')">Detail Profile</button>
            <button type="button" @click="openModal('changePassword')">Change Password</button>
            <button type="button" @click="openModal('favoriteHistory')">Favorite History</button>
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
                            <input type="file" id="avatar-upload" @change="handleAvatarUpload" />
                            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar Preview" class="avatar-preview" />
                        </div>
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" v-model="profile.name" placeholder="Enter your full name" />
                        </div>
                        <div class="form-group">
                            <label for="dob">Date of Birth</label>
                            <input type="date" id="dob" v-model="profile.dateOfBirth" />
                        </div>
                        <button type="submit">Save Profile</button>
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
                        <button type="submit">Submit</button>
                    </form>
                </div>
                <div v-else-if="currentModal === 'favoriteHistory'">
                    <h2>Favorite History</h2>
                    <ul>
                        <li v-for="item in favoriteHistory" :key="item.id">
                            {{ item.name }} - <span>{{ item.date }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// State for modals
const showModal = ref(false)
const currentModal = ref(null)

// Modal control methods
function openModal(modalName) {
    currentModal.value = modalName
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    currentModal.value = null
}

// Profile State
const profile = ref({
    avatar: null,
    name: '',
    dateOfBirth: '',
    id: '12345', // Example static ID
})

// Password State
const passwords = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
})

// Favorite History
const favoriteHistory = ref([
    { id: 1, name: 'Favorite Property 1', date: '2025-05-01' },
    { id: 2, name: 'Favorite Property 2', date: '2025-05-10' },
])

// Avatar Preview State
const avatarPreview = ref(null)

// Handle Avatar Upload with Resize
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 100; // Set the max width for the resized image
                const MAX_HEIGHT = 100; // Set the max height for the resized image
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
                profile.value.avatar = file;
                avatarPreview.value = canvas.toDataURL('image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Update Profile Method (Placeholder for Backend Integration)
function updateProfile() {
    alert('Profile updated successfully! (Connect backend here)')
    console.log('Updated Profile:', profile.value)
}

// Change Password Method (Placeholder for Backend Integration)
function changePassword() {
    if (passwords.value.newPassword !== passwords.value.confirmPassword) {
        alert('New password and confirmation do not match!')
        return
    }
    alert('Password changed successfully! (Connect backend here)')
    console.log('Password Change Data:', passwords.value)
}
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
  border: 3px solid white;
  background-color: #f0f0f0;
}

#avatar-upload {
  margin-top: 10px;
  font-size: 14px;
}

/* Username Styling */
.avatar-container h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 0; /* Add spacing above username */
  color: #333;
}

/* Button container */
.container-user-btn {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  padding: 0 20px;
}

/* Buttons for actions */
.container-user-btn button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

/* Button hover effect */
.container-user-btn button:hover {
  background-color: #0056b3;
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
</style>