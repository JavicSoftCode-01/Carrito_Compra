import {AuthManager} from "../../../../../../BackEnd/src/services/authServices.js";
import {NotificationManager} from "../../utils/showNotifications.js";
import {ExecuteManager} from "../../../../../../BackEnd/src/utils/execute.js";
import {Validations} from "./validations.js";

class AuthFormManager {
  constructor(formId, passwordInputId) {
    this.form = document.getElementById(formId);
    this.passwordInput = document.getElementById(passwordInputId);
  }

  // Configura los eventos del formulario
  setupEvents() {
    return ExecuteManager.execute(() => {
      if (this.form) {
        this.form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleFormSubmit().then((r) => console.log(r));
        });
      }
      // Botones para mostrar/ocultar contraseña
      const togglePasswordButtons = document.querySelectorAll(".toggle-password");
      togglePasswordButtons.forEach(button => {
        button.addEventListener("click", (e) => {
          this.togglePasswordVisibility(e.currentTarget);
        });
      });
    }, "Éxito! Eventos configurados correctamente.", "Error! Al configurar eventos:");
  }

  // Alterna la visibilidad de la contraseña
  togglePasswordVisibility(button) {
    return ExecuteManager.execute(() => {
      const container = button.parentElement;
      const input = container.querySelector("input");
      if (!input) return;
      const newType = input.type === "password" ? "text" : "password";
      input.type = newType;
      const icon = button.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    }, "Éxito! Al cambiar visibilidad de la contraseña.", "Error! Al cambiar visibilidad de la contraseña:");
  }

  // Valida que todos los campos requeridos tengan valor
  validateRequiredFields(fields) {
    return ExecuteManager.execute(() => {
      const values = Object.entries(fields).reduce((acc, [key, element]) => {
        acc[key] = element?.value?.trim() ?? "";
        return acc;
      }, {});
      if (Object.values(values).some((value) => !value)) {
        NotificationManager.warning("¡Atención! Todos los campos son requeridos");
        return null;
      }
      return values;
    }, "Éxito! Al validar campos.", "Error! Al validar campos:");
  }

  // Maneja el envío del formulario (registro o login)
  async handleFormSubmit() {
    return ExecuteManager.execute(
      async () => {
        if (this.inputFields) {
          // Caso Registro
          const formData = this.validateRequiredFields(this.inputFields);
          if (!formData) return;
          if (!Validations.passwords(formData.password, formData.confirm_password)) return;
          await AuthManager.register(formData);
          setTimeout(() => {
            AuthManager.redirectTo(AuthManager._LOGIN_PATH);
          }, 1500);
        } else {
          // Caso Login
          const formData = this.validateRequiredFields({
            username: this.usernameInput,
            password: this.passwordInput
          });
          if (!formData) return;
          await AuthManager.login(formData.username, formData.password);
        }
      },
      this.inputFields
        ? "Éxito! Registro completado."
        : "Éxito! Inicio de sesión completado.",
      this.inputFields
        ? "Error! En el proceso de registro:"
        : "Error! En el proceso de inicio de sesión:"
    );
  }

  // Inicializa el formulario
  init() {
    return ExecuteManager.execute(() => {
      AuthManager.verifyAuthentication();
      this.setupEvents();
    }, "Éxito! Al inicializar el formulario de autenticación.", "Error! Al inicializar el formulario de autenticación:");
  }
}

export {AuthFormManager};