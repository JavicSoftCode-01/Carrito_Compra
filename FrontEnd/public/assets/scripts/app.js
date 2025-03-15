// import {AuthManager} from "../../../../BackEnd/src/services/authServices.js";
// import AdminPanel from "../../../../BackEnd/src/admin/AdminPanel.js";
// import {ExecuteManager} from "../../../../BackEnd/src/utils/execute.js";
// import {ProductServices} from "../../../../BackEnd/src/services/productServices.js";
// import {CartsPage} from "./CartsPage.js";
//
// class App {
//   constructor() {
//     this.elements = {
//       userDisplay: document.getElementById("usuario-logueado"),
//       logoutButton: document.getElementById("btn-logout")
//     };
//   }
//
//   setupButtonListeners() {
//     if (this.elements.logoutButton) {
//       this.elements.logoutButton.addEventListener("click", (e) => this.handleLogout(e));
//     }
//   }
//
//   handleLogout(e) {
//     return ExecuteManager.execute(() => {
//       e.preventDefault();
//       AuthManager.logout();
//     }, "Logout successful", "Error during logout:");
//   }
//
//   init() {
//     return ExecuteManager.execute(() => {
//       AuthManager.verifyAuthentication();
//       if (this.elements.userDisplay) {
//         const session = AuthManager.getCurrentSession();
//         this.elements.userDisplay.textContent = `${session.first_name} ${session.last_name}`;
//       }
//       this.setupButtonListeners();
//     }, "Application initialized successfully", "Error initializing application:");
//   }
// }
//
// document.addEventListener("DOMContentLoaded", () => {
//   AuthManager.verifyAuthentication();
//
//   // Inicializa la aplicación base
//   const app = new App();
//   app.init();
//
//   // Detecta la página actual y carga el módulo correspondiente
//   const currentPath = window.location.pathname;
//   if (currentPath.endsWith("products.html")) {
//     const productsPage = new ProductServices();
//     productsPage.init();
//   } else if (currentPath.endsWith("carts.html")) {
//     const cartsPage = new CartsPage();
//     cartsPage.init();
//   }
//
//   // Inicializa el panel de administración si se encuentra presente en la página
//   const adminPanelElement = document.querySelector(".admin-section");
//   if (adminPanelElement) {
//     const adminPanel = new AdminPanel();
//     adminPanel.init();
//   }
// });

import { AuthManager } from "../../../../BackEnd/src/services/authServices.js";
import AdminPanel from "../../../../BackEnd/src/admin/AdminPanel.js";
import { ExecuteManager } from "../../../../BackEnd/src/utils/execute.js";
import { ProductServices } from "../../../../BackEnd/src/services/productServices.js";
import { CartsPage } from "../../../../BackEnd/src/services/cartsServices.js";

class App {
  constructor() {
    this.elements = {
      userDisplay: document.getElementById("usuario-logueado"),
      logoutButton: document.getElementById("btn-logout")
    };
  }

  setupButtonListeners() {
    if (this.elements.logoutButton) {
      this.elements.logoutButton.addEventListener("click", (e) => this.handleLogout(e));
    }
  }

  handleLogout(e) {
    return ExecuteManager.execute(() => {
      e.preventDefault();
      AuthManager.logout();
    }, "Logout successful", "Error during logout:");
  }

  init() {
    return ExecuteManager.execute(() => {
      AuthManager.verifyAuthentication();
      if (this.elements.userDisplay) {
        const session = AuthManager.getCurrentSession();
        this.elements.userDisplay.textContent = `${session.first_name} ${session.last_name}`;
      }
      this.setupButtonListeners();
    }, "Application initialized successfully", "Error initializing application:");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  AuthManager.verifyAuthentication();

  const app = new App();
  app.init();

  const currentPath = window.location.pathname;
  if (currentPath.endsWith("products.html")) {
    const productsPage = new ProductServices();
    productsPage.init();
  } else if (currentPath.endsWith("carts.html")) {
    const cartsPage = new CartsPage();
    cartsPage.init();
  }

  const adminPanelElement = document.querySelector(".admin-section");
  if (adminPanelElement) {
    const adminPanel = new AdminPanel();
    adminPanel.init();
  }
});
