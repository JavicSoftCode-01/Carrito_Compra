import { AdminPanel } from '../../../../BackEnd/src/admin/AdminPanel.js';
import { AuthManager } from "../../../../BackEnd/src/services/authServices.js";
import { CardsProductService } from "../../../../BackEnd/src/services/cardsProductServices.js";
import { CartsPage } from "../../../../BackEnd/src/services/cartsServices.js";

document.addEventListener('DOMContentLoaded', () => {
  // Verifica la autenticación; si falla, AuthManager redirige al login.
  if (!AuthManager.verifyAuthentication()) return;

  // Muestra el nombre completo del usuario logueado y maneja cerrar sesión.
  new AuthManager().init();

  // Obtiene la ruta actual del archivo HTML
  const currentPage = window.location.pathname;

  // Inicializa el panel de administración solo en la página admin-panel.html
  if (currentPage.endsWith('/admin-panel.html')) {
    new AdminPanel().init();
  }

  // Inicializa el servicio de cards de productos solo en la página de productos
  if (document.getElementById('products-container')) {
    const cardsProductService = new CardsProductService();
    cardsProductService.init();
  }

  // Inicializa la página de carrito solo en la página de carrito
  if (currentPage.includes('/carts/') || currentPage.endsWith('/carts.html')) {
    const cartsPage = new CartsPage();
    cartsPage.init();
  }
});