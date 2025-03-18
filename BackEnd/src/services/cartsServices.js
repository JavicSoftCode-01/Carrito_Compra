import { LocalStorageManager } from "../database/localStorage.js";
import { NotificationManager } from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import { ExecuteManager } from "../utils/execute.js";

const CART_KEY = "cart";
const PRODUCTS_KEY = "products";

class CartService {
  // Obtiene el carrito actual desde localStorage
  static getCart() {
    return LocalStorageManager.getData(CART_KEY) || [];
  }

  // Guarda el carrito actualizado
  static saveCart(cart) {
    LocalStorageManager.setData(CART_KEY, cart);
  }

  // Actualiza el stock de un producto en el almacenamiento principal
  static updateProductStock(productId, stockChange) {
    const products = LocalStorageManager.getData(PRODUCTS_KEY) || [];
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      products[productIndex].stock += stockChange;
      if (products[productIndex].stock < 0) {
        products[productIndex].stock = 0;
      }
      LocalStorageManager.setData(PRODUCTS_KEY, products);
      return true;
    }
    return false;
  }

  // Verifica el stock disponible para un producto
  static checkAvailableStock(productId) {
    const products = LocalStorageManager.getData(PRODUCTS_KEY) || [];
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
  }

  // Agrega un producto al carrito (si ya existe, incrementa la cantidad)
  static addToCart(product, quantity = 1) {
    return ExecuteManager.execute(() => {
      const currentStock = CartService.checkAvailableStock(product.id);
      if (quantity > currentStock) {
        NotificationManager.warning("No hay suficiente stock disponible.");
        return;
      }
      let cart = CartService.getCart();
      const existingIndex = cart.findIndex(item => item.id === product.id);
      if (existingIndex !== -1) {
        const newQuantity = cart[existingIndex].quantity + quantity;
        if (newQuantity > currentStock) {
          NotificationManager.warning("No hay suficiente stock para agregar más.");
          return;
        }
        cart[existingIndex].quantity = newQuantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: currentStock,
          quantity: quantity,
          description: product.description,
          imgLink: product.imgLink,
          category: product.category || "General" // Añadido para mostrar la categoría
        });
      }
      // Actualiza el stock en el almacenamiento principal
      CartService.updateProductStock(product.id, -quantity);
      CartService.saveCart(cart);
      NotificationManager.success("Producto agregado al carrito.");
    }, "Producto agregado al carrito", "Error al agregar producto al carrito");
  }

  // Actualiza la cantidad de un producto en el carrito
  static updateCart(productId, newQuantity) {
    return ExecuteManager.execute(() => {
      let cart = CartService.getCart();
      const index = cart.findIndex(item => item.id === productId);
      if (index !== -1) {
        const currentQuantity = cart[index].quantity;
        const quantityChange = newQuantity - currentQuantity;

        if (newQuantity <= 0) {
          // Programar eliminación después de 5 segundos
          NotificationManager.warning(`En 5 segundos este producto "${cart[index].name}" será eliminado de sus compras.`);
          setTimeout(() => {
            CartService.removeFromCart(productId);
          }, 5000);
          return;
        }

        if (quantityChange > 0) {
          const availableStock = CartService.checkAvailableStock(productId);
          if (quantityChange > availableStock) {
            NotificationManager.warning("No hay suficiente stock disponible.");
            return;
          }
        }
        // Actualiza el stock en el almacenamiento principal
        CartService.updateProductStock(productId, -quantityChange);
        cart[index].quantity = newQuantity;
        cart[index].stock = CartService.checkAvailableStock(productId);
        CartService.saveCart(cart);
        NotificationManager.success("Cantidad actualizada.");
      }
    }, "Cantidad actualizada", "Error al actualizar cantidad en el carrito");
  }

  // Elimina un producto del carrito y devuelve la cantidad al stock
  static removeFromCart(productId) {
    return ExecuteManager.execute(() => {
      let cart = CartService.getCart();
      const index = cart.findIndex(item => item.id === productId);
      if (index !== -1) {
        const quantityToReturn = cart[index].quantity;
        CartService.updateProductStock(productId, quantityToReturn);
        cart.splice(index, 1);
        CartService.saveCart(cart);
        NotificationManager.success("Producto eliminado del carrito.");
      }
    }, "Producto eliminado del carrito", "Error al eliminar producto del carrito");
  }

  // Vacía el carrito y devuelve todos los productos al stock
  static clearCart() {
    return ExecuteManager.execute(() => {
      const cart = CartService.getCart();
      cart.forEach(item => {
        CartService.updateProductStock(item.id, item.quantity);
      });
      CartService.saveCart([]);
      NotificationManager.success("Carrito vaciado.");
    }, "Carrito vaciado", "Error al vaciar el carrito");
  }

  // Calcula el total de la compra
  static getCartTotal() {
    const cart = CartService.getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Refresca la información de stock de cada item en el carrito según los datos actuales
  static refreshCartStockInfo() {
    let cart = CartService.getCart();
    const products = LocalStorageManager.getData(PRODUCTS_KEY) || [];
    cart = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        item.stock = product.stock;
        // Asegurarse de que el producto tenga categoría
        if (!item.category && product.category) {
          item.category = product.category;
        }
      }
      return item;
    });
    CartService.saveCart(cart);
  }
}

class CartsPage {
  constructor() {
    this.cartContainer = document.getElementById("cart-container");
    this.cartSummary = document.getElementById("cart-summary");
    this.ivaRate = 12; // Valor predeterminado de IVA
  }

  init() {
    return ExecuteManager.execute(() => {
      CartService.refreshCartStockInfo();
      this.renderCart();
    }, "Carrito de compras inicializado", "Error al inicializar el carrito de compras");
  }

  generateInvoiceNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  getCurrentDateTime() {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
  }

  renderCart() {
    return ExecuteManager.execute(() => {
      const cart = CartService.getCart();
      // Actualiza la información de stock para cada producto en el carrito
      CartService.refreshCartStockInfo();

      this.cartContainer.innerHTML = "";

      if (cart.length === 0) {
        this.cartContainer.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-basket"></i>
            <p>Tu carrito está vacío</p>
            <p>¡Agrega algunos productos increíbles!</p>
          </div>
        `;
        this.cartSummary.innerHTML = "";
        return;
      }

      // Renderizar cada producto en el carrito
      cart.forEach(item => {
        const card = document.createElement("div");
        card.className = "cart-card";

        card.innerHTML = `
          <div class="cart-img">
            <img src="${item.imgLink}" alt="${item.name}">
          </div>
          <div class="cart-details">
            <div class="cart-info">
              <h3 class="product-name">${item.name}</h3>
              <p class="product-category">${item.category || 'General'}</p>
              <p class="product-description">${item.description}</p>
            </div>
            <div class="cart-price">
              <p class="product-price">$${Number(item.price).toFixed(2)}</p>
              <p class="product-stock">Stock disponible: ${item.stock}</p>
              <div class="quantity-control">
                <button class="quantity-btn decrease-btn" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                <input type="text" class="quantity-input" value="${item.quantity}" data-id="${item.id}" readonly>
                <button class="quantity-btn increase-btn" data-id="${item.id}"><i class="fas fa-plus"></i></button>
              </div>
            </div>
          </div>
          <button class="delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
        `;

        this.cartContainer.appendChild(card);
      });

      // Renderizar resumen de factura
      this.renderInvoiceSummary(cart);

      // Adjuntar eventos
      this.attachEvents();

    }, "Carrito renderizado", "Error al renderizar el carrito");
  }

  renderInvoiceSummary(cart) {
    const subtotal = CartService.getCartTotal();
    const iva = (subtotal * this.ivaRate) / 100;
    const total = subtotal + iva;

    // Obtener nombre del usuario
    const userData = LocalStorageManager.getData("currentUser") || {};
    const userName = userData.fullName || "Cliente";

    this.cartSummary.innerHTML = `
      <div class="invoice-header">
        <h2 class="invoice-title">Resumen de Compra</h2>
        <div class="invoice-details">
          <p>Cliente: ${userName}</p>
          <p>Factura #: ${this.generateInvoiceNumber()}</p>
          <p>Fecha: ${this.getCurrentDateTime()}</p>
        </div>
      </div>
      
      <h3 style="margin-top: 0">Detalle de Factura</h3>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${cart.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${Number(item.price).toFixed(2)}</td>
              <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">$${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="total-row">
          <span class="total-label">
            IVA:
            <div class="iva-control">
              <input type="number" id="iva-rate" class="iva-input" value="${this.ivaRate}" min="0" max="100">%
            </div>
          </span>
          <span class="total-value">$${iva.toFixed(2)}</span>
        </div>
        
        <div class="total-row grand-total">
          <span class="total-label">Total:</span>
          <span class="total-value">$${total.toFixed(2)}</span>
        </div>
      </div>
      
      <button id="btn-clear-cart" class="clear-cart-btn">
        <i class="fas fa-trash-alt"></i> Vaciar carrito
      </button>
    `;
  }

  attachEvents() {
    // Eventos para los botones de incrementar/decrementar cantidad
    this.cartContainer.querySelectorAll(".increase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = Number(btn.dataset.id);
        const quantityInput = this.cartContainer.querySelector(`.quantity-input[data-id="${productId}"]`);
        const newQuantity = parseInt(quantityInput.value) + 1;
        CartService.updateCart(productId, newQuantity);
        this.renderCart();
      });
    });

    this.cartContainer.querySelectorAll(".decrease-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = Number(btn.dataset.id);
        const quantityInput = this.cartContainer.querySelector(`.quantity-input[data-id="${productId}"]`);
        const newQuantity = parseInt(quantityInput.value) - 1;
        CartService.updateCart(productId, newQuantity);
        this.renderCart();
      });
    });

    // Evento para eliminar producto
    this.cartContainer.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = Number(btn.dataset.id);
        CartService.removeFromCart(productId);
        this.renderCart();
      });
    });

    // Evento para vaciar el carrito
    const clearBtn = document.getElementById("btn-clear-cart");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        CartService.clearCart();
        this.renderCart();
      });
    }

    // Evento para cambiar el IVA
    const ivaInput = document.getElementById("iva-rate");
    if (ivaInput) {
      ivaInput.addEventListener("change", (e) => {
        this.ivaRate = parseFloat(e.target.value);
        this.renderCart();
      });
    }
  }
}

export { CartService, CartsPage };