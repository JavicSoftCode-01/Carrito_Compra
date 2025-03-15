import {ExecuteManager} from "../../../../../../BackEnd/src/utils/execute.js";
import {NotificationManager} from "../../utils/showNotifications.js";

class Validations {

  /**
   * Valida que las contraseñas coincidan.
   */
  static passwords(password, confirmPassword) {
    return ExecuteManager.execute(() => {
      const isValid = password === confirmPassword;
      if (!isValid) {
        NotificationManager.error("Las contraseñas no coinciden");
      }
      return isValid;
    }, "Exito! Contraseñas validadas.", "Error! Al validar las contraseñas:");
  }
}

export {Validations};