<template>
  <div class="agent-section">
    <h2>Contact Agent</h2>
    <div class="agent-details">
      <div class="agent-photo">
        <img 
          v-if="agentInfo.photo" 
          :src="agentInfo.photo" 
          :alt="agentInfo.name"
          @error="handlePhotoError" 
        >
        <div v-else class="agent-placeholder">👤</div>
      </div>
      <div class="agent-info">
        <h3>{{ agentInfo.name }}</h3>
        <p>Email: {{ agentInfo.email }}</p>
        <p>Phone: {{ agentInfo.phone }}</p>
      </div>
    </div>
    <div class="contact-buttons">
      <a :href="`mailto:${agentInfo.email}`" class="email-button">Email Agent</a>
      <a :href="`tel:${agentInfo.phone}`" class="call-button">Call Agent</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  agentInfo: {
    type: Object,
    required: true
  }
})

function handlePhotoError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.agent-section {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.agent-section h2 {
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: #1f2937;
}

.agent-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.agent-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e5e7eb;
}

.agent-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agent-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #9ca3af;
}

.agent-info h3 {
  margin-bottom: 8px;
  color: #1f2937;
}

.agent-info p {
  margin-bottom: 6px;
  color: #4b5563;
}

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-buttons a {
  padding: 12px 0;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.email-button {
  background-color: #f3f4f6;
  color: #1f2937;
}

.email-button:hover {
  background-color: #e5e7eb;
}

.call-button {
  background-color: #e0f2fe;
  color: #0369a1;
}

.call-button:hover {
  background-color: #bae6fd;
}

@media (max-width: 768px) {
  .agent-details {
    flex-direction: row;
    align-items: center;
  }
}
</style>