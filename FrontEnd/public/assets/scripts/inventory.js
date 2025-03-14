// Importa la clase para manejar el localStorage.
// La ruta se ajusta según la estructura del proyecto.
import { LocalStorageManager } from "../../../../BackEnd/src/utils/localStorageManager.js";

class InventoryPage {
  constructor() {
    this.productsContainer = document.getElementById("products-container");

    // Ejemplo de datos de productos (estos podrían provenir de una API o base de datos)
    this.products = [
      { id: 1, name: "Labial", price: 15.00, description: "Labial de larga duración.", image: "https://via.placeholder.com/150" },
      { id: 2, name: "Rímel", price: 12.50, description: "Rímel para dar volumen.", image: "https://via.placeholder.com/150" },
      { id: 3, name: "Base de maquillaje", price: 20.00, description: "Base para una piel perfecta.", image: "https://via.placeholder.com/150" }
    ];
  }

  init() {
    this.renderProducts();
  }

  renderProducts() {
    if (!this.productsContainer) return;

    this.products.forEach(product => {
      // Crea la tarjeta del producto
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image"/>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="btn-add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
      `;
      this.productsContainer.appendChild(productCard);
    });

    // Agregar evento a cada botón para incorporar el producto al carrito
    this.productsContainer.querySelectorAll(".btn-add-to-cart").forEach(button => {
      button.addEventListener("click", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        this.addToCart(id);
      });
    });
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Recupera el carrito actual desde localStorage (si no existe, crea un arreglo vacío)
    const currentCart = LocalStorageManager.getData("shoppingCart") || [];

    // Verifica si el producto ya se encuentra en el carrito
    const existingProduct = currentCart.find(item => item.id === product.id);
    if (existingProduct) {
      // Si ya existe, incrementa la cantidad
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
      // De lo contrario, agrega el producto con cantidad 1
      product.quantity = 1;
      currentCart.push(product);
    }

    // Guarda el carrito actualizado en localStorage
    LocalStorageManager.setData("shoppingCart", currentCart);
    this.showNotification("Producto agregado al carrito");
  }

  showNotification(message) {
    // Muestra una notificación temporal en la parte superior de la página
    const notificationContainer = document.getElementById("notification-container");
    if (!notificationContainer) return;

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Se elimina la notificación después de 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const inventoryPage = new InventoryPage();
  inventoryPage.init();
});
