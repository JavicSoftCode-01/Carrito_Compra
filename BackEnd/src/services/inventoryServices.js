import Product from "../../src/models/Product.js";
import {LocalStorageManager} from "../database/localStorage.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {ExecuteManager} from "../utils/execute.js";
import {CartService} from "./cartsServices.js";

class DynamicTable {
  createTableCell(content) {
    const td = document.createElement("td");
    td.innerHTML = content;
    return td;
  }

  createStockControls(product) {
    // Se devuelve el HTML con botones para incrementar/decrementar stock.
    return ExecuteManager.execute(() => {
      return `
        <div style="display: flex; justify-content: center;">
          <button class="btn-stock" data-id="${product.id}" data-action="increment">+</button>
          <span class="stock-value" data-id="${product.id}">${product.stock}</span>
          <button class="btn-stock" data-id="${product.id}" data-action="decrement">-</button>
        </div>
      `;
    }, "Controles de stock creados", "Error al crear controles de stock");
  }

  createActionButtons(product) {
    return `
      <button class="btn-edit" data-id="${product.id}" title="Editar">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button class="btn-delete" data-id="${product.id}" title="Eliminar">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
  }

  createTableRow(product, index) {
    return ExecuteManager.execute(() => {
      if (!product || product.id == null || !product.name || product.price == null || product.stock == null) {
        console.warn("Producto inválido, omitiendo fila:", product);
        return null;
      }
      const row = document.createElement("tr");
      const priceFixed = Number(product.price) ? Number(product.price).toFixed(2) : "0.00";

      const rowContent = [
        index + 1,
        product.name,
        product.description || "",
        `$ ${priceFixed}`,
        this.createStockControls(product),
        this.createActionButtons(product)
      ];

      rowContent.forEach(content => {
        row.appendChild(this.createTableCell(content || ""));
      });

      return row;
    }, "Fila creada", "Error al crear fila");
  }

  static attachStockEventListeners(tbody) {
    return ExecuteManager.execute(() => {
      tbody.querySelectorAll('.btn-stock').forEach(btn => {
        btn.removeEventListener('click', DynamicTable.updateProductStock);
        btn.addEventListener('click', DynamicTable.updateProductStock);
      });
    }, "Eventos de stock adjuntados", "Error al adjuntar eventos de stock");
  }

  static updateProductStock(e) {
    return ExecuteManager.execute(() => {
      const button = e.target.closest('button');
      if (!button) return;
      const productId = Number(button.dataset.id);
      const action = button.dataset.action;
      const change = action === 'increment' ? 1 : -1;

      const products = LocalStorageManager.getData("products") || [];
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) return;

      let product = products[productIndex];
      let newStock = product.stock + change;
      if (newStock < 0) newStock = 0;
      product.stock = newStock;
      products[productIndex] = product;
      LocalStorageManager.setData("products", products);

      // Actualiza la visualización del stock en la fila correspondiente.
      const row = button.closest('tr');
      if (row) {
        const stockValue = row.querySelector(`.stock-value[data-id="${productId}"]`);
        if (stockValue) stockValue.textContent = newStock;
      }

      // Actualiza la información del carrito para reflejar los cambios de stock.
      CartService.refreshCartStockInfo();
    }, "Stock actualizado", "Error al actualizar stock");
  }

  static renderTableWithData(productsArray) {
    const table = new DynamicTable();
    return ExecuteManager.execute(() => {
      const tbody = document.getElementById("compras-tbody");
      if (!tbody) throw new Error("Contenedor de tabla no encontrado");
      tbody.innerHTML = "";

      const validProducts = productsArray.filter(product =>
        product && product.id != null && product.name && product.price != null && product.stock != null
      );

      validProducts.forEach((product, index) => {
        const row = table.createTableRow(product, index);
        if (row) {
          tbody.appendChild(row);
        }
      });

      DynamicTable.attachStockEventListeners(tbody);
    }, "Tabla renderizada", "Error al renderizar tabla");
  }

  static renderTable(tbodyId) {
    return ExecuteManager.execute(() => {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) throw new Error("Contenedor de tabla no encontrado");
      const products = LocalStorageManager.getData("products") || [];
      DynamicTable.renderTableWithData(products);
    }, "Tabla inicializada", "Error al inicializar tabla");
  }
}

class InventoryService {
  constructor() {
    this.productForm = document.getElementById("product-form");
    this.products = LocalStorageManager.getData("products") || [];
    // Esta propiedad se sincronizará desde AdminPanel
    this.editingProductId = null;
  }

  init() {
    return ExecuteManager.execute(() => {
      if (this.productForm) {
        this.bindForm();
      }
      this.renderTable();
    }, "InventoryService inicializado correctamente", "Error al inicializar InventoryService:");
  }

  bindForm() {
    return ExecuteManager.execute(() => {
      // Se vincula el evento submit solo una vez
      this.productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }, "Formulario enlazado correctamente", "Error al enlazar el formulario:");
  }

  handleFormSubmit() {
    console.log("Form submit triggered");

    const idInput = document.getElementById("product-id").value;
    const nameInput = document.getElementById("product-name").value;
    const priceInput = document.getElementById("product-price").value;
    const stockInput = document.getElementById("product-stock").value;
    const descriptionInput = document.getElementById("product-description").value;
    const imgLinkInput = document.getElementById("product-imgLink").value;

    console.log("Raw form values:", {
      idInput, nameInput, priceInput, stockInput, descriptionInput, imgLinkInput
    });

    let id, name, price, stock, description, imgLink;

    if (idInput && !isNaN(parseInt(idInput))) {
      id = parseInt(idInput);
    } else {
      id = Date.now();
      console.log("Using fallback ID:", id);
    }

    name = nameInput.trim();
    if (!name) {
      console.error("Name is empty");
      NotificationManager.error("El nombre del producto es obligatorio.");
      return;
    }

    if (priceInput && !isNaN(parseFloat(priceInput))) {
      price = parseFloat(priceInput);
    } else {
      console.error("Price is invalid");
      NotificationManager.error("El precio debe ser un número válido.");
      return;
    }

    if (stockInput && !isNaN(parseInt(stockInput))) {
      stock = parseInt(stockInput);
    } else {
      console.error("Stock is invalid");
      NotificationManager.error("El stock debe ser un número entero válido.");
      return;
    }

    description = descriptionInput.trim();
    imgLink = imgLinkInput.trim();

    console.log("Parsed and validated values:", {id, name, price, stock, description, imgLink});

    let products = LocalStorageManager.getData("products") || [];
    console.log("Existing products:", products);

    try {
      if (this.editingProductId !== null) {
        // Actualizar producto existente
        const index = products.findIndex(p => p.id === this.editingProductId);
        console.log("Editing product at index:", index);
        if (index !== -1) {
          const updatedProduct = new Product(id, name, price, stock, description, imgLink);
          console.log("Updated product instance:", updatedProduct);
          products[index] = JSON.parse(JSON.stringify(updatedProduct));
          NotificationManager.success("Producto actualizado correctamente.");
        }
      } else {
        // Crear producto nuevo
        const newProduct = new Product(id, name, price, stock, description, imgLink);
        console.log("New product instance:", newProduct);
        products.push(JSON.parse(JSON.stringify(newProduct)));
        NotificationManager.success("Producto agregado correctamente.");
      }

      console.log("Saving products to localStorage:", products);
      LocalStorageManager.setData("products", products);

      // Se espera que AdminPanel defina estos métodos para actualizar la UI:
      if (typeof this.closeProductModal === "function") this.closeProductModal();
      if (typeof this.loadWidgets === "function") this.loadWidgets();
      if (this.fromInventoryModal && typeof this.openInventoryModal === "function") {
        this.openInventoryModal();
      }
      if (typeof this.renderInventoryTable === "function") this.renderInventoryTable();
    } catch (error) {
      console.error("Error in form submission:", error);
      NotificationManager.error("Error al guardar el producto: " + error.message);
    }
  }

  renderTable() {
    return ExecuteManager.execute(() => {
      const products = LocalStorageManager.getData("products") || [];
      DynamicTable.renderTableWithData(products);
    }, "Tabla de inventario renderizada", "Error al renderizar la tabla");
  }
}

export {InventoryService};