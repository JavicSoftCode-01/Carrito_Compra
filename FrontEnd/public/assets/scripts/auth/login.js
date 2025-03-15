import {AuthFormManager} from "./utils/authForm.js";

class LoginManager extends AuthFormManager {
  constructor() {
    // El segundo parámetro es el id del input de contraseña
    super("login-form", "password");
    this.usernameInput = document.getElementById("username");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new LoginManager().init();
});