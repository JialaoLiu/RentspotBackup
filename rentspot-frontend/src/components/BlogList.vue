<template>
  <div class="blog-list">
    <!-- Pass the correct props from blogs to BlogCard -->
    <BlogCard
      v-for="blog in blogs"
      :key="blog.id"
      :username="blog.username"
      :date="blog.date"
      :caption="blog.caption"
      :images="blog.images"
    />
  </div>
</template>

<script setup>
import BlogCard from './BlogCard.vue';

defineProps({
  blogs: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f4f4f4;
}
</style>