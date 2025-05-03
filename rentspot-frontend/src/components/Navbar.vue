<template>
  <nav class="navbar">
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Entire Rent</a></li>
      <li><a href="#">Shared Rent</a></li>
      <li><a href="#">News</a></li>
      <li><a href="#">Feedback</a></li>
      <li><a href="#">Login</a></li>
      <li><a href="#">Register</a></li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #f8f8f8;
  padding: 1rem;
}

.navbar ul {
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem; /* 你可以根据需要调整间距 */
}

.navbar a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.navbar a:hover {
  color: #646cff;
}
</style>