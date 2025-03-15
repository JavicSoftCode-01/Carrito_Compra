import {AuthFormManager} from "./utils/authForm.js";

class RegisterManager extends AuthFormManager {
  constructor() {
    // El primer parámetro es el id del formulario; segundo, el id del input de contraseña
    super("register-form", "password");
    this.inputFields = {
      first_name: document.getElementById("first_name"),
      last_name: document.getElementById("last_name"),
      username: document.getElementById("username"),
      password: this.passwordInput,
      confirm_password: document.getElementById("confirm_password")
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RegisterManager().init();
});