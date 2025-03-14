// FrontEnd/static/scripts/inventory.js

// Importa las dependencias necesarias (ajusta la ruta según tu estructura)
import Product from "../../src/models/Product";
import { LocalStorageManager } from "../database/localStorage";

class InventoryPage {
  constructor() {
    this.productsContainer = document.getElementById("products-container");
    this.productForm = document.getElementById("product-form");

    // Intenta cargar los productos desde localStorage o inicia con un array vacío
    this.products = LocalStorageManager.getData("products") || [];
  }

  init() {
    this.renderProducts();
    this.bindForm();
  }

  bindForm() {
    this.productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }
  handleFormSubmit() {
    // Obtén los valores del formulario
    const id = parseInt(document.getElementById("product-id").value);
    const name = document.getElementById("product-name").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const stock = parseInt(document.getElementById("product-stock").value);
    const description = document.getElementById("product-description").value;
    const imgLink = document.getElementById("product-imgLink").value;

    // Crea una nueva instancia de Product
    const newProduct = new Product(id, name, price, stock, description, imgLink);

    // Agrega el nuevo producto a la lista
    this.products.push(newProduct);

    // Guarda la lista actualizada en localStorage
    LocalStorageManager.setData("products", this.products);

    // Limpia el formulario
    this.productForm.reset();

    // Vuelve a renderizar la lista de productos
    this.renderProducts();

    // Muestra una notificación
    this.showNotification("Producto agregado correctamente.");
  }

  renderProducts() {
    // Limpia el contenedor
    this.productsContainer.innerHTML = "";

    // Si no hay productos, muestra un mensaje
    if (this.products.length === 0) {
      this.productsContainer.innerHTML = "<p>No hay productos en el inventario.</p>";
      return;
    }

    // Recorre el array de productos y crea una tarjeta para cada uno
    this.products.forEach(product => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <img src="${product.imgLink}" alt="${product.name}" class="product-image"/>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <p class="product-stock">Stock: ${product.stock}</p>
      `;
      this.productsContainer.appendChild(productCard);
    });
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

document.addEventListener("DOMContentLoaded", () => {
  const inventoryPage = new InventoryPage();
  inventoryPage.init();
});
