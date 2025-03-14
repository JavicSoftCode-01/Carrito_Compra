import AdminPanel from "./classes/AdminPanel.js";

// Instanciar el panel y ejecutar la inicialización
document.addEventListener("DOMContentLoaded", () => {
  const adminPanel = new AdminPanel();
  adminPanel.init();
});
