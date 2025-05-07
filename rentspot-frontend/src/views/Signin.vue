<template>
    <form action="none" method="post" class="signin-form">
      <div class="signin">
        <h1>CREATE A ACCOUNT</h1>
        <h3>To Rent Spot best website find house in Adelaide</h3>
      </div>

      <div class="container">
        <label for="uname"><b>Username</b></label>
        <input type="text" placeholder="Enter Username" name="uname" required>

        <label for="psw"><b>Password</b></label>
        <input type="password" placeholder="Enter Password" name="psw" required>

        <label for="pswa"><b>Password again</b></label>
        <input type="password" placeholder="Enter Password Again" name="pswa" required>

        <label for="phone"><b>Email</b></label>
        <input type="email" placeholder="Enter email" name="email" required>

        <label for="phone"><b>Phone number</b></label>
        <input type="password" placeholder="Enter phone number" name="phone" required>

        <label for="date"><b>Date of birth</b></label>
        <input type="date" name="date" required>

        <label for="gender"><b>Gender:</b></label>
        <label for="gender"><b>Male</b></label>
        <input type="radio" placeholder="Male" name="Male" required>
        <label for="gender"><b>Female</b></label>
        <input type="radio" placeholder="Female" name="Female" required>

        <button type="submit">Create a account</button>

        <div style="width: 100%; text-align: center; border-bottom: 1px solid #ccc; line-height: 0; margin: 20px 0;">
          <span style="background: white; padding: 0 10px;">or</span>
        </div>
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
    </form>
    <div></div>
  </template>

  <script>
  export default {
    name: "Signin",
  };
  </script>


