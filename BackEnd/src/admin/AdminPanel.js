// // BackEnd/src/admin/AdminPanel.js
// import Product from "../../src/models/Product.js"; // Asegúrate de importarlo al inicio
// import {InventoryService} from "../services/InventoryServices.js";
// import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
// import {LocalStorageManager} from "../database/localStorage.js";
//
// class AdminPanel {
//   constructor() {
//     // Elementos de usuario y menú
//     this.usuarioLogueado = document.getElementById("usuario-logueado");
//     this.logoutMenu = document.getElementById("logout-menu");
//
//     // Elementos del modal para creación/edición de producto
//     this.btnOpenModal = document.getElementById("btn-open-modal");
//     this.modal = document.getElementById("modal");
//     this.modalClose = document.getElementById("modal-close");
//     this.productForm = document.getElementById("product-form");
//     this.modalTitle = this.modal.querySelector("h2"); // Para actualizar el título
//
//     // Elementos del modal para mostrar la tabla de inventario
//     this.btnShowInventory = document.getElementById("btn-show-inventory");
//     this.inventoryModal = document.getElementById("inventory-modal");
//     this.inventoryModalClose = document.getElementById("inventory-modal-close");
//
//     // Elementos del modal de confirmación para eliminación
//     this.deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
//     this.deleteConfirmBtn = document.getElementById("delete-confirm-btn");
//     this.deleteCancelBtn = document.getElementById("delete-cancel-btn");
//
//     // Estado interno para edición y eliminación
//     this.editingProductId = null;
//     this.productToDelete = null;
//     // Bandera para saber si el modal de inventario estaba abierto al iniciar una edición
//     this.fromInventoryModal = false;
//
//     // Se instancia el servicio de inventario (que integra la lógica de DynamicTable)
//     this.inventoryService = new InventoryService();
//     // Forzamos que el formulario usado en el servicio sea el del AdminPanel (modal)
//     this.inventoryService.productForm = this.productForm;
//   }
//
//   init() {
//     this.bindEvents();
//     // Inicializa el servicio (enlaza el formulario y prepara métodos de renderizado)
//     this.inventoryService.init();
//     this.loadWidgets();
//     this.initCharts();
//   }
//
//   bindEvents() {
//     // Menú de usuario
//     this.usuarioLogueado.addEventListener("click", () => this.toggleLogoutMenu());
//
//     // Modal para creación/edición de producto
//     if (this.btnOpenModal) {
//       this.btnOpenModal.addEventListener("click", () => this.openProductModal());
//     }
//     if (this.modalClose) {
//       this.modalClose.addEventListener("click", () => this.closeProductModal());
//     }
//     if (this.productForm) {
//       // Se sobreescribe el submit para incluir la lógica de creación o edición
//       this.productForm.addEventListener("submit", (e) => {
//         e.preventDefault();
//         this.handleFormSubmit();
//       });
//     }
//
//     // Modal para mostrar la tabla de inventario
//     if (this.btnShowInventory) {
//       this.btnShowInventory.addEventListener("click", () => {
//         this.openInventoryModal();
//         this.renderInventoryTable();
//       });
//     }
//     if (this.inventoryModalClose) {
//       this.inventoryModalClose.addEventListener("click", () => this.closeInventoryModal());
//     }
//
//     // Eventos del modal de confirmación para eliminación
//     if (this.deleteConfirmBtn) {
//       this.deleteConfirmBtn.addEventListener("click", () => this.confirmDeleteProduct());
//     }
//     if (this.deleteCancelBtn) {
//       this.deleteCancelBtn.addEventListener("click", () => this.closeDeleteModal());
//     }
//     window.addEventListener("click", (e) => {
//       if (e.target === this.inventoryModal) {
//         this.closeInventoryModal();
//       }
//       if (e.target === this.deleteConfirmationModal) {
//         this.closeDeleteModal();
//       }
//     });
//   }
//
//   toggleLogoutMenu() {
//     this.logoutMenu.style.display =
//       (!this.logoutMenu.style.display || this.logoutMenu.style.display === "none")
//         ? "block"
//         : "none";
//   }
//
//   openProductModal(product = null) {
//     if (product) {
//       // Se trata de una edición: se precargan los datos y se cambia el título del modal
//       document.getElementById("product-id").value = product.id;
//       document.getElementById("product-name").value = product.name;
//       document.getElementById("product-price").value = product.price;
//       document.getElementById("product-stock").value = product.stock;
//       document.getElementById("product-description").value = product.description;
//       document.getElementById("product-imgLink").value = product.imgLink;
//       this.editingProductId = product.id;
//       this.modalTitle.textContent = "Editar Producto";
//     } else {
//       // Se crea un nuevo producto: se limpia el formulario y se ajusta el título
//       this.productForm.reset();
//       this.editingProductId = null;
//       this.modalTitle.textContent = "Crear Producto";
//     }
//     // Si se está editando desde el modal de inventario, lo cerramos y marcamos la bandera
//     if (this.inventoryModal.style.display === "block") {
//       this.closeInventoryModal();
//       this.fromInventoryModal = true;
//     } else {
//       this.fromInventoryModal = false;
//     }
//     this.modal.style.display = "block";
//   }
//
//   closeProductModal() {
//     this.modal.style.display = "none";
//     this.productForm.reset();
//     this.editingProductId = null;
//   }
//
//   handleFormSubmit() {
//     // Get form values
//     const idInput = document.getElementById("product-id").value;
//     const nameInput = document.getElementById("product-name").value.trim();
//     const priceInput = document.getElementById("product-price").value;
//     const stockInput = document.getElementById("product-stock").value;
//     const description = document.getElementById("product-description").value.trim();
//     const imgLink = document.getElementById("product-imgLink").value.trim();
//
//     // Validate inputs
//     if (!nameInput || isNaN(parseFloat(priceInput)) || isNaN(parseInt(stockInput))) {
//       NotificationManager.error("Por favor complete todos los campos requeridos correctamente.");
//       return;
//     }
//
//     // Parse values correctly
//     const id = idInput ? parseInt(idInput) : Date.now(); // Use timestamp as fallback ID
//     const name = nameInput;
//     const price = parseFloat(priceInput);
//     const stock = parseInt(stockInput);
//
//     // Get products from localStorage
//     let products = LocalStorageManager.getData("products") || [];
//
//     if (this.editingProductId !== null) {
//       // Update existing product
//       const index = products.findIndex(p => p.id === this.editingProductId);
//       if (index !== -1) {
//         products[index] = {id, name, price, stock, description, imgLink};
//         NotificationManager.success("Producto actualizado correctamente.");
//       }
//     } else {
//       // Create new product using the Product class
//       const newProduct = new Product(id, name, price, stock, description, imgLink);
//       products.push(newProduct);
//       NotificationManager.success("Producto agregado correctamente.");
//     }
//
//     // Save to localStorage
//     LocalStorageManager.setData("products", products);
//     this.closeProductModal();
//     this.loadWidgets();
//
//     // Re-open inventory modal if editing started from there
//     if (this.fromInventoryModal) {
//       this.openInventoryModal();
//     }
//     this.renderInventoryTable();
//   }
//
//   openInventoryModal() {
//     this.inventoryModal.style.display = "block";
//   }
//
//   closeInventoryModal() {
//     this.inventoryModal.style.display = "none";
//   }
//
//   renderInventoryTable() {
//     // Se usa el método del servicio de inventario para renderizar la tabla.
//     // Asegúrate de que en el modal exista un elemento <tbody id="compras-tbody"></tbody>
//     this.inventoryService.renderTable();
//     // Se adjuntan los eventos para editar/eliminar en la tabla
//     this.attachTableActionListeners();
//   }
//
//   attachTableActionListeners() {
//     const tbody = document.getElementById("compras-tbody");
//     if (tbody) {
//       // Para editar
//       tbody.querySelectorAll('.btn-edit').forEach(btn => {
//         btn.addEventListener('click', () => {
//           const productId = Number(btn.dataset.id);
//           this.handleEditProduct(productId);
//         });
//       });
//       // Para eliminar
//       tbody.querySelectorAll('.btn-delete').forEach(btn => {
//         btn.addEventListener('click', () => {
//           const productId = Number(btn.dataset.id);
//           this.openDeleteModal(productId);
//         });
//       });
//     }
//   }
//
//   handleEditProduct(productId) {
//     const products = LocalStorageManager.getData("products") || [];
//     const product = products.find(p => p.id === productId);
//     if (product) {
//       this.openProductModal(product);
//     }
//   }
//
//   openDeleteModal(productId) {
//     this.productToDelete = productId;
//     // Cerrar el modal de inventario y abrir el de confirmación
//     this.closeInventoryModal();
//     this.deleteConfirmationModal.style.display = "block";
//   }
//
//   closeDeleteModal() {
//     this.deleteConfirmationModal.style.display = "none";
//     this.productToDelete = null;
//     // Reabrir el modal de inventario si estaba abierto previamente
//     this.openInventoryModal();
//   }
//
//   confirmDeleteProduct() {
//     let products = LocalStorageManager.getData("products") || [];
//     const updatedProducts = products.filter(p => p.id !== this.productToDelete);
//     LocalStorageManager.setData("products", updatedProducts);
//     NotificationManager.success("Producto eliminado correctamente.");
//     this.closeDeleteModal();
//     this.loadWidgets();
//     this.renderInventoryTable();
//   }
//
//   loadWidgets() {
//     const products = LocalStorageManager.getData("products") || [];
//     const widgetProductos = document.getElementById("widget-total-productos");
//     const widgetCapital = document.getElementById("widget-total-capital");
//     if (widgetProductos) widgetProductos.textContent = products.length;
//     let totalCapital = 0;
//     products.forEach(product => {
//       totalCapital += product.price * product.stock;
//     });
//     if (widgetCapital) widgetCapital.textContent = totalCapital.toFixed(2);
//   }
//
//   initCharts() {
//     const products = LocalStorageManager.getData("products") || [];
//     const ctxBar = document.getElementById("chart-barras")?.getContext("2d");
//     if (ctxBar) {
//       new Chart(ctxBar, {
//         type: 'bar',
//         data: {
//           labels: products.map(product => product.name),
//           datasets: [{
//             label: 'Stock de Productos',
//             data: products.map(product => product.stock),
//             backgroundColor: 'rgba(255, 99, 132, 0.5)',
//             borderColor: 'rgba(255, 99, 132, 1)',
//             borderWidth: 1
//           }]
//         },
//         options: {scales: {y: {beginAtZero: true}}}
//       });
//     }
//     const ctxLine = document.getElementById("chart-linea")?.getContext("2d");
//     if (ctxLine) {
//       new Chart(ctxLine, {
//         type: 'line',
//         data: {
//           labels: products.map(product => product.name),
//           datasets: [{
//             label: 'Capital por Producto',
//             data: products.map(product => product.price * product.stock),
//             fill: false,
//             borderColor: 'rgba(54, 162, 235, 1)',
//             tension: 0.1
//           }]
//         },
//         options: {scales: {y: {beginAtZero: true}}}
//       });
//     }
//   }
// }
//
// export default AdminPanel;

// BackEnd/src/admin/AdminPanel.js
import {InventoryService} from "../services/InventoryServices.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {LocalStorageManager} from "../database/localStorage.js";

class AdminPanel {
  constructor() {
    this.usuarioLogueado = document.getElementById("usuario-logueado");
    this.logoutMenu = document.getElementById("logout-menu");

    this.btnOpenModal = document.getElementById("btn-open-modal");
    this.modal = document.getElementById("modal");
    this.modalClose = document.getElementById("modal-close");
    this.productForm = document.getElementById("product-form");
    this.modalTitle = this.modal.querySelector("h2");

    this.btnShowInventory = document.getElementById("btn-show-inventory");
    this.inventoryModal = document.getElementById("inventory-modal");
    this.inventoryModalClose = document.getElementById("inventory-modal-close");

    this.deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
    this.deleteConfirmBtn = document.getElementById("delete-confirm-btn");
    this.deleteCancelBtn = document.getElementById("delete-cancel-btn");

    // Esta propiedad se usará para diferenciar entre edición y creación
    this.editingProductId = null;
    this.productToDelete = null;
    this.fromInventoryModal = false;

    this.inventoryService = new InventoryService();
    // Forzamos que el formulario del servicio sea el del AdminPanel
    this.inventoryService.productForm = this.productForm;
    // Sincronizamos la propiedad editingProductId
    this.inventoryService.editingProductId = this.editingProductId;
    // Inyectamos las funciones de UI para que el servicio las invoque
    this.inventoryService.closeProductModal = this.closeProductModal.bind(this);
    this.inventoryService.loadWidgets = this.loadWidgets.bind(this);
    this.inventoryService.openInventoryModal = this.openInventoryModal.bind(this);
    this.inventoryService.renderInventoryTable = this.renderInventoryTable.bind(this);
  }

  init() {
    this.bindEvents();
    this.inventoryService.init();
    this.loadWidgets();
    this.initCharts();
  }

  bindEvents() {
    this.usuarioLogueado.addEventListener("click", () => this.toggleLogoutMenu());

    if (this.btnOpenModal) {
      this.btnOpenModal.addEventListener("click", () => this.openProductModal());
    }
    if (this.modalClose) {
      this.modalClose.addEventListener("click", () => this.closeProductModal());
    }
    // No se vuelve a asignar el submit aquí (ya lo hace InventoryService)

    if (this.btnShowInventory) {
      this.btnShowInventory.addEventListener("click", () => {
        this.openInventoryModal();
        this.renderInventoryTable();
      });
    }
    if (this.inventoryModalClose) {
      this.inventoryModalClose.addEventListener("click", () => this.closeInventoryModal());
    }

    if (this.deleteConfirmBtn) {
      this.deleteConfirmBtn.addEventListener("click", () => this.confirmDeleteProduct());
    }
    if (this.deleteCancelBtn) {
      this.deleteCancelBtn.addEventListener("click", () => this.closeDeleteModal());
    }
    window.addEventListener("click", (e) => {
      if (e.target === this.inventoryModal) {
        this.closeInventoryModal();
      }
      if (e.target === this.deleteConfirmationModal) {
        this.closeDeleteModal();
      }
    });
  }

  toggleLogoutMenu() {
    this.logoutMenu.style.display =
      (!this.logoutMenu.style.display || this.logoutMenu.style.display === "none")
        ? "block"
        : "none";
  }

  openProductModal(product = null) {
    if (product) {
      document.getElementById("product-id").value = product.id;
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-price").value = product.price;
      document.getElementById("product-stock").value = product.stock;
      document.getElementById("product-description").value = product.description;
      document.getElementById("product-imgLink").value = product.imgLink;
      this.editingProductId = product.id;
      this.modalTitle.textContent = "Editar Producto";
    } else {
      this.productForm.reset();
      this.editingProductId = null;
      this.modalTitle.textContent = "Crear Producto";
    }
    // Sincronizamos con el servicio
    this.inventoryService.editingProductId = this.editingProductId;

    if (this.inventoryModal.style.display === "block") {
      this.closeInventoryModal();
      this.fromInventoryModal = true;
    } else {
      this.fromInventoryModal = false;
    }
    this.modal.style.display = "block";
  }

  closeProductModal() {
    this.modal.style.display = "none";
    this.productForm.reset();
    this.editingProductId = null;
    // Actualizamos la propiedad del servicio
    this.inventoryService.editingProductId = null;
  }

  openInventoryModal() {
    this.inventoryModal.style.display = "block";
  }

  closeInventoryModal() {
    this.inventoryModal.style.display = "none";
  }

  renderInventoryTable() {
    this.inventoryService.renderTable();
    this.attachTableActionListeners();
  }

  attachTableActionListeners() {
    const tbody = document.getElementById("compras-tbody");
    if (tbody) {
      tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const productId = Number(btn.dataset.id);
          this.handleEditProduct(productId);
        });
      });
      tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const productId = Number(btn.dataset.id);
          this.openDeleteModal(productId);
        });
      });
    }
  }

  handleEditProduct(productId) {
    const products = LocalStorageManager.getData("products") || [];
    const product = products.find(p => p.id === productId);
    if (product) {
      this.openProductModal(product);
    }
  }

  openDeleteModal(productId) {
    this.productToDelete = productId;
    this.closeInventoryModal();
    this.deleteConfirmationModal.style.display = "block";
  }

  closeDeleteModal() {
    this.deleteConfirmationModal.style.display = "none";
    this.productToDelete = null;
    this.openInventoryModal();
  }

  confirmDeleteProduct() {
    let products = LocalStorageManager.getData("products") || [];
    const updatedProducts = products.filter(p => p.id !== this.productToDelete);
    LocalStorageManager.setData("products", updatedProducts);
    NotificationManager.success("Producto eliminado correctamente.");
    this.closeDeleteModal();
    this.loadWidgets();
    this.renderInventoryTable();
  }

  loadWidgets() {
    const products = LocalStorageManager.getData("products") || [];
    const widgetProductos = document.getElementById("widget-total-productos");
    const widgetCapital = document.getElementById("widget-total-capital");
    if (widgetProductos) widgetProductos.textContent = products.length;
    let totalCapital = 0;
    products.forEach(product => {
      totalCapital += product.price * product.stock;
    });
    if (widgetCapital) widgetCapital.textContent = totalCapital.toFixed(2);
  }

  initCharts() {
    const products = LocalStorageManager.getData("products") || [];
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
        options: {scales: {y: {beginAtZero: true}}}
      });
    }
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
        options: {scales: {y: {beginAtZero: true}}}
      });
    }
  }
}

export default AdminPanel;
