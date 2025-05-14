<template>
  <div class="user-profile">
    <h1>User Profile Management</h1>

    <!-- Update Profile Section -->
    <section class="profile-section">
      <h2>Update Profile</h2>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="avatar">Avatar</label>
          <input type="file" id="avatar" @change="handleAvatarUpload" />
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

        <div class="form-group">
          <label for="id">User ID</label>
          <input type="text" id="id" v-model="profile.id" placeholder="Enter your user ID" disabled />
        </div>

        <button type="submit">Save Profile</button>
      </form>
    </section>

    <!-- Change Password Section -->
    <section class="profile-section">
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

        <button type="submit">Change Password</button>
      </form>
    </section>

    <!-- Favorite History Section -->
    <section class="profile-section">
      <h2>Favorite History</h2>
      <ul>
        <li v-for="item in favoriteHistory" :key="item.id">
          {{ item.name }} - <span>{{ item.date }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

// Handle Avatar Upload
function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    profile.value.avatar = file
    avatarPreview.value = URL.createObjectURL(file)
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
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.profile-section {
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.avatar-preview {
  display: block;
  margin-top: 10px;
  max-width: 100px;
  border-radius: 50%;
}
</style>