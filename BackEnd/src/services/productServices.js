import {LocalStorageManager} from "../database/localStorage.js";
import {ExecuteManager} from "../utils/execute.js";
// import { addToCart, refreshCartStockInfo } from "../../../FrontEnd/public/assets/scripts/CartManager.js";
import {CartService} from "./cartsServices.js";

class ProductServices {
  constructor() {
    this.productsContainer = document.getElementById("products-container");
  }

  init() {
    return ExecuteManager.execute(() => {
      this.renderProducts();
    }, "Página de productos inicializada", "Error inicializando la página de productos:");
  }

  renderProducts() {
    return ExecuteManager.execute(() => {
      // Actualiza la información del carrito para reflejar los cambios de stock
      CartService.refreshCartStockInfo();

      const products = LocalStorageManager.getData("products") || [];
      // Filtrar productos válidos
      const validProducts = products.filter(product =>
        product && product.id != null && product.name && product.price != null && product.stock != null
      );

      this.productsContainer.innerHTML = "";
      if (validProducts.length === 0) {
        this.productsContainer.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
      }

      validProducts.forEach(product => {
        const price = Number(product.price) ? Number(product.price).toFixed(2) : "0.00";
        const card = document.createElement("div");
        card.className = "product-card";

        // Mostrar mensaje de sin stock si el stock es 0
        const stockMessage = product.stock > 0
          ? `<p class="product-stock">Stock: ${product.stock}</p>`
          : `<p class="product-stock out-of-stock">Sin stock</p>`;

        // Deshabilitar el botón si no hay stock
        const buttonDisabled = product.stock <= 0 ? 'disabled' : '';

        card.innerHTML = `
          <img src="${product.imgLink}" alt="${product.name}" class="product-image"/>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description || ""}</p>
          <p class="product-price">$${price}</p>
          ${stockMessage}
          <button class="btn-add-to-cart" data-id="${product.id}" ${buttonDisabled}>
            <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
          </button>
        `;

        // Agregar evento al botón de carrito solo si hay stock
        if (product.stock > 0) {
          card.querySelector(".btn-add-to-cart").addEventListener("click", () => {
            // Añadir producto al carrito y actualizar la vista
            CartService.addToCart(product, 1);
            this.renderProducts(); // Volver a renderizar para actualizar el stock mostrado
          });
        }

        this.productsContainer.appendChild(card);
      });
    }, "Productos renderizados", "Error al renderizar productos:");
  }
}

export { ProductServices };