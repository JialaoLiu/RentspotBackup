<template>
  <nav class="navbar">
    <ul>
      <div class="logo">
        <li><router-link to="/">RentSpot AU</router-link></li>
      </div>
      <div class="menu">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/rentlist">Entire Rent</router-link></li>
        <li><a href="#">Shared Rent</a></li>
        <li><a href="#">News</a></li>
        <li><a href="#">Feedback</a></li>
      </div>
      <div class="connect">
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/signin">Register</router-link></li>
      </div>
    </ul>
  </nav>
</template>

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