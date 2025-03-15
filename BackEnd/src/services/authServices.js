import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {SessionStorageManager} from "../database/sessionStorage.js";
import {User} from "../models/User.js";
import {ExecuteManager} from "../utils/execute.js";

class AuthManager {
  static {
    this._KEY_USERS = "users";
    this._KEY_CURRENT_SESSION = "currentSession";
    this._LOGIN_PATH = "/FrontEnd/public/pages/auth/login.html";
    this._ADMIN_PANEL_PATH = "/FrontEnd/public/pages/admin-panel.html";
  }

  getBasePath() {
    return ExecuteManager.execute(() => {
      const path = window.location.pathname;
      const baseIndex = path.includes("FrontEnd") ? path.indexOf("FrontEnd") : path.indexOf("BackEnd");
      return path.substring(0, baseIndex);
    }, "Exito! Al obtener la Base path.", "Error! Al obtener la base path:");
  }

  static getUserFullName() {
    return ExecuteManager.execute(() => {
      const session = this.getCurrentSession();
      return session ? `${session.first_name} ${session.last_name}` : "Desconocido";
    }, "Exito! Al obtener el nombre completo.", "Error! Al obtener el nombre completo:");
  }

  static redirectTo(path) {
    return ExecuteManager.execute(() => {
      const basePath = new AuthManager().getBasePath();
      window.location.replace(`${basePath}${path.startsWith("/") ? path.slice(1) : path}`);
    }, "Exito! Al redireccionar.", "Error! Al redireccionar:");
  }

  static verifyAuthentication() {
    return ExecuteManager.execute(() => {
      const currentSession = this.getCurrentSession();
      const currentUrl = window.location.href;
      const isAuthPage = currentUrl.includes("login.html") || currentUrl.includes("register.html");

      if (isAuthPage && !currentSession) return true;

      if (currentSession) {
        const now = Date.now();
        const elapsedTime = now - (currentSession.timestamp || 0);
        const oneHour = 60 * 60 * 1000;
        if (elapsedTime > oneHour) {
          SessionStorageManager.removeData(this._KEY_CURRENT_SESSION);
          if (!isAuthPage) {
            NotificationManager.info("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
            setTimeout(() => {
              this.redirectTo(this._LOGIN_PATH);
            }, 2000);
            return false;
          }
          return true;
        }
      }

      if (!currentSession && !isAuthPage) {
        NotificationManager.info("Debe iniciar sesión para acceder");
        this.redirectTo(this._LOGIN_PATH);
        return false;
      }

      if (currentSession && isAuthPage) {
        this.redirectTo(this._ADMIN_PANEL_PATH);
        return false;
      }

      return true;
    }, "Exito! al verificar la autenticación.", "Error! al verificar la autenticación:");
  }

  /**
   * Registra un nuevo usuario usando el modelo User
   */
  static register(userData) {
    return ExecuteManager.execute(() => {
      const users = SessionStorageManager.getData(this._KEY_USERS) || [];
      if (users.some(u => u.username === userData.username)) {
        NotificationManager.info("El nombre de usuario ya está en uso");
        return;
      }
      const newUser = new User(
        Date.now(),
        userData.first_name,
        userData.last_name,
        userData.username,
        userData.password // En producción se recomienda usar hash en la contraseña
      );
      const result = SessionStorageManager.createUser(this._KEY_USERS, newUser);
      result
        ? NotificationManager.success("Exito! Usuario registrado")
        : NotificationManager.error("Error! Al registrar el usuario");
    }, "Éxito! Usuario registrado.", "Error! Al registrar usuario:");
  }

  /**
   * Inicia sesión buscando el usuario y almacenando la sesión en el sessionStorage.
   */
  static login(username, password) {
    return ExecuteManager.execute(() => {
      const users = SessionStorageManager.getData(this._KEY_USERS) || [];
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        NotificationManager.error("Error! Usuario o contraseña incorrectos");
        return;
      }
      const sessionData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        full_name: `${user.first_name} ${user.last_name}`,
        timestamp: Date.now()
      };
      SessionStorageManager.setData(this._KEY_CURRENT_SESSION, sessionData);
      NotificationManager.success("Bienvenido! " + this.getUserFullName());
      setTimeout(() => {
        this.redirectTo(this._ADMIN_PANEL_PATH);
      }, 1000);
    }, "Éxito! Al iniciar sesión.", "Error! Al iniciar sesión:");
  }

  /**
   * Cierra la sesión del usuario y redirecciona a la página de login.
   */
  static logout() {
    return ExecuteManager.execute(() => {
      SessionStorageManager.removeData(this._KEY_CURRENT_SESSION);
      NotificationManager.success("Exito! Cerrando Sesion");
      setTimeout(() => {
        this.redirectTo(this._LOGIN_PATH);
      }, 1000);
    }, "Éxito! Al cerrar sesión.", "Error! Al cerrar sesión:");
  }

  /**
   * Retorna la sesión actual del usuario.
   */
  static getCurrentSession() {
    return ExecuteManager.execute(() =>
        SessionStorageManager.getData(this._KEY_CURRENT_SESSION),
      "Exito! Al obtener la sesión.",
      "Error! Al obtener la sesión:"
    );
  }
}

export {AuthManager};