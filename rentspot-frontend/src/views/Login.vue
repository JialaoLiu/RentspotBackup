<template>
    <form action="none" method="post" class="login-form">
      <div class="imgcontainer">
        <img src="./images/profile.png" alt="Avatar" class="avatar">
      </div>

      <div class="container">
        <label for="uname"><b>Username</b></label>
        <input type="text" placeholder="Enter Username" name="uname" required>

        <label for="psw"><b>Password</b></label>
        <input type="password" placeholder="Enter Password" name="psw" required>

        <span class="psw"><a href="#">Forgot password?</a></span>

        <label>
          <input type="checkbox" checked="checked" name="remember"> Remember me
        </label>

        <router-link to="/User.vue"><button type="submit">Login</button></router-link>

        <div style="width: 100%; text-align: center; border-bottom: 1px solid #ccc; line-height: 0; margin: 20px 0;">
          <span style="background: white; padding: 0 10px;">or</span>
        </div>

        <div class="container">
          <button type="button" class="login social">
            <i class="fab fa-google"></i> Continue with Google
          </button>
          <button type="button" class="login social">
            <i class="fab fa-facebook-f"></i> Continue with Facebook
          </button>
          <button type="button" class="login social">
            <i class="fab fa-apple"></i> Continue with Apple
          </button>
        </div>
      </div>

      <div class="container" style="background-color:#f1f1f1">
        <router-link to="/"><button type="button" class="cancelbtn">Cancel</button></router-link>
        <span class="SI"><router-link to="/signin">Create a account</router-link></span>
      </div>
    </form>
  </template>

  <script>
  export default {
    name: "Login",
  };
  </script>


