import AdminPanel from "../../../../BackEnd/src/admin/AdminPanel.js";
import {InventoryPage} from "../../../../BackEnd/src/services/InventoryService.js";
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  
  // Verifica si la URL termina con "products.html"
  if (currentPath.endsWith("products.html")) {
    const inventoryPage = new InventoryPage();
    inventoryPage.init();
  }
  
  // Aquí puedes inicializar otros componentes que requieras
  const adminPanel = new AdminPanel();
  adminPanel.init();
});
