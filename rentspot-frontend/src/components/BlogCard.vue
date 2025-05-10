<template>
  <div class="post-card">
    <!-- User Info Section -->
    <div class="user-info">
      <img :src="images[0]" alt="Profile" class="profile-picture" />
      <div class="user-details">
        <h3 class="user-name">{{ username }}</h3>
        <p class="post-time">{{ date }}</p>
      </div>
    </div>

    <!-- Post Caption -->
    <div class="post-caption">
      <p>{{ caption }}</p>
    </div>

    <!-- Image Gallery -->
    <div class="image-gallery">
      <img v-for="(image, index) in images" :key="index" :src="image" alt="Post Image" class="post-image" />
    </div>

    <!-- Interactions -->
    <div class="post-interactions">
      <div class="action-buttons">
        <button class="like-button" @click="toggleLike">{{ isLiked ? 'Liked' : 'Like' }}</button>
        <button class="comment-button" @click="toggleCommentForm">Comment</button>
        <button class="share-button">Share</button>
      </div>
    </div>

    <!-- Comment Form Modal -->
    <div v-if="showCommentForm" class="comment-modal">
      <div class="modal-content">
        <h4>Comments</h4>
        <!-- Existing Comments -->
        <div class="comments">
          <div v-for="(comment, index) in comments" :key="index" class="comment">
            <p class="comment-author">{{ comment.author }}</p>
            <p class="comment-text">{{ comment.text }}</p>
          </div>
        </div>
        <!-- Add New Comment -->
        <div class="add-comment">
          <textarea v-model="newComment" placeholder="Write a comment..."></textarea>
          <button @click="addComment">Post</button>
        </div>
        <!-- Close Modal -->
        <button class="close-button" @click="toggleCommentForm">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props
defineProps({
  username: String,
  date: String,
  caption: String,
  images: Array,
});

// Like button state
const isLiked = ref(false);

// Comment form modal state
const showCommentForm = ref(false);

// Comments list
const comments = ref([
  { author: 'John Doe', text: 'This is amazing!' },
  { author: 'Jane Smith', text: 'Great post!' },
]);

// New comment input
const newComment = ref('');

// Toggle like state
function toggleLike() {
  isLiked.value = !isLiked.value;
}

// Toggle comment form
function toggleCommentForm() {
  showCommentForm.value = !showCommentForm.value;
}

// Add a new comment
function addComment() {
  if (newComment.value.trim()) {
    comments.value.push({ author: 'You', text: newComment.value });
    newComment.value = ''; // Clear input
  }
}
</script>

<style scoped>
.post-card {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 16px auto;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
}

.post-time {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

.post-caption {
  margin-bottom: 16px;
  font-size: 1rem;
  color: #333;
  text-align: left;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.post-interactions {
  font-size: 0.9rem;
  color: #555;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  flex-grow: 1;
  margin-top: 20px;
}

.action-buttons button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #007bff;
}

.action-buttons button:hover {
  opacity: 0.8;
  transition: background-color 0.3s ease;
  background-color: #f0f0f0;
}

/* Comment Modal Styles */
.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.comments {
  margin-bottom: 16px;
}

.comment {
  margin-bottom: 12px;
}

.comment-author {
  font-weight: bold;
  margin-bottom: 4px;
}

.comment-text {
  margin: 0;
}

.add-comment {
  display: flex;
  flex-direction: column;
}

.add-comment textarea {
  width: 100%;
  height: 60px;
  resize: none;
  margin-bottom: 8px;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-comment button {
  align-self: flex-end;
  background: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.add-comment button:hover {
  background: #0056b3;
}

.close-button {
  margin-top: 16px;
  background: #ff4d4d;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.close-button:hover {
  background: #cc0000;
}
</style>