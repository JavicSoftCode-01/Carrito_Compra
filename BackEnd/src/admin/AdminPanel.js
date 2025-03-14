import Product from "../../src/models/Product.js";
import {LocalStorageManager} from "../database/localStorage.js";

class AdminPanel {
  constructor() {
    // Elementos del DOM del panel
    this.usuarioLogueado = document.getElementById("usuario-logueado");
    this.logoutMenu = document.getElementById("logout-menu");
    this.btnLogout = document.getElementById("btn-logout");
    this.btnOpenModal = document.getElementById("btn-open-modal");
    this.modal = document.getElementById("modal");
    this.modalClose = document.getElementById("modal-close");
    this.productForm = document.getElementById("product-form");

    // Ejemplo de datos para widgets (puedes personalizar)
    this.data = {
      totalProductos: 120,
      totalCapital: 3500.50
    };
  }

  init() {
    this.bindEvents();
    this.loadWidgets();
    this.initCharts();
  }

  bindEvents() {
    // Menú de usuario
    this.usuarioLogueado.addEventListener("click", () => {
      this.toggleLogoutMenu();
    });
    if (this.btnLogout) {
      this.btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }
    // Eventos para el modal
    if (this.btnOpenModal) {
      this.btnOpenModal.addEventListener("click", () => this.openModal());
    }
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => this.closeModal());
    }
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
    // Manejo del formulario de producto
    if (this.productForm) {
      this.productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  toggleLogoutMenu() {
    this.logoutMenu.style.display =
      (this.logoutMenu.style.display === "none" || this.logoutMenu.style.display === "")
        ? "block"
        : "none";
  }

  loadWidgets() {
    // Recupera los productos guardados en localStorage
    const products = LocalStorageManager.getData("products") || [];
    // Calcula el total de productos (cantidad de registros)
    const totalProductos = products.length;
    // Calcula el capital total (suma de precio * stock de cada producto)
    let totalCapital = 0;
    products.forEach(product => {
      totalCapital += product.price * product.stock;
    });
    // Actualiza los elementos del DOM correspondientes
    const widgetProductos = document.getElementById("widget-total-productos");
    const widgetCapital = document.getElementById("widget-total-capital");
    if (widgetProductos) widgetProductos.textContent = totalProductos;
    if (widgetCapital) widgetCapital.textContent = totalCapital.toFixed(2);
  }

  initCharts() {
    // Recupera los productos desde localStorage
    const products = LocalStorageManager.getData("products") || [];

    // Inicializa el gráfico de barras para mostrar el stock de cada producto
    const ctxBar = document.getElementById("chart-barras")?.getContext("2d");
    if (ctxBar) {
      new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: products.map(product => product.name),
          datasets: [{
            label: 'Stock de Productos',
            data: products.map(product => product.stock),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {beginAtZero: true}
          }
        }
      });
    }

    // Inicializa el gráfico de línea para mostrar el capital por producto (precio * stock)
    const ctxLine = document.getElementById("chart-linea")?.getContext("2d");
    if (ctxLine) {
      new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: products.map(product => product.name),
          datasets: [{
            label: 'Capital por Producto',
            data: products.map(product => product.price * product.stock),
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {beginAtZero: true}
          }
        }
      });
    }
  }


  openModal() {
    this.modal.style.display = "block";
  }

  closeModal() {
    this.modal.style.display = "none";
    this.productForm.reset();
  }

  handleFormSubmit() {
    // Obtención de datos del formulario
    const id = parseInt(document.getElementById("product-id").value);
    const name = document.getElementById("product-name").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const stock = parseInt(document.getElementById("product-stock").value);
    const description = document.getElementById("product-description").value;
    const imgLink = document.getElementById("product-imgLink").value;

    // Crear nueva instancia de Product (la clase debe incluir imgLink)
    const newProduct = new Product(id, name, price, stock, description, imgLink);

    // Obtener productos existentes de localStorage o inicializar un array vacío
    const currentProducts = LocalStorageManager.getData("products") || [];
    currentProducts.push(newProduct);
    LocalStorageManager.setData("products", currentProducts);

    this.showNotification("Producto agregado correctamente.");
    this.closeModal();

    // Redirige a la página de inventario para ver el producto agregado
    // window.location.href = "./inventario/inventario.html";
  }

  logout() {
    LocalStorageManager.clearData();
    window.location.href = "./login.html"; // Ajusta la ruta a tu login
  }

  showNotification(message) {
    const notificationContainer = document.getElementById("notification-container");
    if (!notificationContainer) return;

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

export default AdminPanel;