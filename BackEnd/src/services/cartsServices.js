import {LocalStorageManager} from "../database/localStorage.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {ExecuteManager} from "../utils/execute.js";
import {AuthManager} from "./authServices.js";

const CART_KEY = "cart";
const PRODUCTS_KEY = "products";

class CartsPage {
  constructor() {
    this.cartContainer = document.getElementById("cart-container");
    this.cartSummary = document.getElementById("cart-summary");
    this.ivaRate = 12; // Valor predeterminado de IVA
    this.invoiceNumber = this.generateInvoiceNumber();
    this.removeTimers = {}; // Para manejar los temporizadores de eliminación

    // Se adjunta la delegación de eventos una sola vez
    this.attachDelegationEvents();
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
      // Actualizamos la información de stock de cada item
      CartService.refreshCartStockInfo();

      this.cartContainer.innerHTML = "";

      if (cart.length === 0) {
        this.cartContainer.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-basket fa-lg"></i>
            <p>Tu carrito está vacío</p>
            <p>¡Agrega algunos productos increíbles!</p>
          </div>
        `;
        this.cartSummary.innerHTML = "";
        return;
      }

      cart.forEach(item => {
        const card = document.createElement("div");
        card.className = "cart-card";
        card.dataset.id = item.id; // Aseguramos que el id se asigne correctamente

        if (item.quantity <= 0) {
          card.classList.add('removing');
        }

        card.innerHTML = `
          <div class="cart-img">
            <img src="${item.imgLink}" alt="${item.name}">
          </div>
          <div class="cart-details">
            <div class="cart-info">
              <h3 class="product-name">${item.name}</h3>
              <p class="product-description">${item.description || 'Sin descripción'}</p>
              <p class="product-category">${item.category && item.category.name ? item.category.name.toUpperCase() : ''}</p>
            </div>
            <div class="cart-price">
              <p class="product-price">$${Number(item.price).toFixed(2)}</p>
              <p class="product-stock">Stock disponible: ${item.stock}</p>
              <div class="quantity-control">
                <button class="quantity-btn decrease-btn" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}"><i class="fas fa-plus"></i></button>
              </div>
              ${item.quantity <= 0 ? '<p class="removal-notice">Se eliminará en <span class="countdown">5</span> segundos</p>' : ''}
            </div>
          </div>
          <a class="btn delete-btn" data-id="${item.id}"><i class="fas fa-trash fa-lg"></i></a>
        `;

        this.cartContainer.appendChild(card);

        if (item.quantity <= 0 && !this.removeTimers[item.id]) {
          this.startRemovalCountdown(item.id);
        }
      });

      // Renderizamos el resumen/factura
      this.renderInvoiceSummary(cart);
      // No se requiere volver a adjuntar eventos, ya que se usa delegación
    }, "Carrito renderizado", "Error al renderizar el carrito");
  }

  startRemovalCountdown(productId) {
    // Si ya existe un temporizador para este producto, lo cancelamos
    if (this.removeTimers[productId]) {
      clearInterval(this.removeTimers[productId].interval);
      clearTimeout(this.removeTimers[productId].timeout);
    }

    let secondsLeft = 5;
    const countdownElement = this.cartContainer.querySelector(`.cart-card[data-id="${productId}"] .countdown`);
    if (!countdownElement) return;

    const intervalId = setInterval(() => {
      secondsLeft--;
      if (countdownElement) {
        countdownElement.textContent = secondsLeft;
      }
    }, 1000);

    const timeoutId = setTimeout(() => {
      CartService.removeFromCart(productId);
      this.renderCart();
      delete this.removeTimers[productId];
      NotificationManager.info(`Producto eliminado automáticamente por cantidad cero.`);
    }, 5000);

    this.removeTimers[productId] = {
      interval: intervalId,
      timeout: timeoutId
    };
  }

  cancelRemovalCountdown(productId) {
    if (this.removeTimers[productId]) {
      clearInterval(this.removeTimers[productId].interval);
      clearTimeout(this.removeTimers[productId].timeout);
      delete this.removeTimers[productId];
    }
  }

  renderInvoiceSummary(cart) {
    const subtotal = CartService.getCartTotal();
    const iva = (subtotal * this.ivaRate) / 100;
    const total = subtotal + iva;
    const currentUser = AuthManager.getCurrentSession();
    const userName = currentUser && currentUser.first_name && currentUser.last_name
      ? currentUser.full_name
      : "Cliente";

    this.cartSummary.innerHTML = `
      <div class="invoice-header">
        <h2 class="invoice-title">Compra</h2>
        <div class="invoice-details">
          <p>Cliente: ${userName}</p>
          <p>Factura #: ${this.invoiceNumber}</p>
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
              <input type="number" id="iva-rate" class="iva-input" value="${this.ivaRate}" min="0" max="100" step="0.1">%
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
        <i class="fas fa-trash-alt fa-lg"></i> Vaciar carrito
      </button>
    `;
    this.attachIvaEvent();
  }

  attachIvaEvent() {
    const ivaInput = document.getElementById("iva-rate");
    if (ivaInput) {
      ivaInput.addEventListener("input", (e) => {
        let value = e.target.value.trim();
        if (value === "") return;
        value = parseFloat(value);
        if (isNaN(value)) {
          e.target.value = this.ivaRate;
          NotificationManager.warning("Por favor ingrese un valor numérico válido");
          return;
        }
        if (value < 0) {
          e.target.value = this.ivaRate;
          this.ivaRate = 0;
          NotificationManager.warning("El IVA no puede ser negativo");
        } else if (value > 100) {
          e.target.value = this.ivaRate;
          this.ivaRate = 100;
          NotificationManager.warning("El IVA no puede ser mayor a 100%");
        } else {
          this.ivaRate = value;
        }
        const subtotal = CartService.getCartTotal();
        const iva = (subtotal * this.ivaRate) / 100;
        const total = subtotal + iva;
        const ivaValueElement = ivaInput.closest('.total-row').querySelector('.total-value');
        if (ivaValueElement) {
          ivaValueElement.textContent = `$${iva.toFixed(2)}`;
        }
        const totalValueElement = document.querySelector('.grand-total .total-value');
        if (totalValueElement) {
          totalValueElement.textContent = `$${total.toFixed(2)}`;
        }
      });

      ivaInput.addEventListener("blur", (e) => {
        let value = e.target.value.trim();
        if (value === "" || isNaN(parseFloat(value))) {
          e.target.value = 12;
          this.ivaRate = 12;
          NotificationManager.info("Valor de IVA restaurado al 12%");
          const subtotal = CartService.getCartTotal();
          const iva = (subtotal * this.ivaRate) / 100;
          const total = subtotal + iva;
          const ivaValueElement = ivaInput.closest('.total-row').querySelector('.total-value');
          if (ivaValueElement) {
            ivaValueElement.textContent = `$${iva.toFixed(2)}`;
          }
          const totalValueElement = document.querySelector('.grand-total .total-value');
          if (totalValueElement) {
            totalValueElement.textContent = `$${total.toFixed(2)}`;
          }
        }
      });
    }
  }

  attachDelegationEvents() {
    // Adjuntamos la delegación de eventos en el contenedor del carrito
    this.cartContainer.addEventListener("click", this.handleCartClick.bind(this));

  }

  deleteProduct(productId) {
    return ExecuteManager.execute(() => {
      // Obtener el carrito y la lista de productos desde localStorage
      let cart = LocalStorageManager.getData("cart") || [];
      let products = LocalStorageManager.getData("products") || [];

      // Buscar el producto en el carrito según su id
      const productIndex = cart.findIndex(item => item.id === productId);
      if (productIndex === -1) {
        NotificationManager.warning("El producto no existe en el carrito");
        return;
      }

      // Guardar el producto a eliminar para poder acceder a su nombre y cantidad
      const deletedProduct = cart[productIndex];

      // Eliminar el producto del carrito
      cart.splice(productIndex, 1);

      // Buscar el producto en la lista de productos y devolver el stock
      const productInStock = products.find(p => p.id === productId);
      if (productInStock) {
        productInStock.stock += deletedProduct.quantity;
      }

      // Guardar los cambios en localStorage
      LocalStorageManager.setData("cart", cart);
      LocalStorageManager.setData("products", products);

      NotificationManager.success(`Se eliminó ${deletedProduct.name} del carrito y se devolvieron ${deletedProduct.quantity} unidades al stock.`);
      this.renderCart();
    }, "Producto eliminado correctamente", "Error al eliminar el producto");
  }


  handleCartClick(e) {
    // Botón para incrementar cantidad
    const increaseBtn = e.target.closest(".increase-btn");
    if (increaseBtn) {
      e.preventDefault();
      const productId = Number(increaseBtn.dataset.id);
      this.cancelRemovalCountdown(productId);
      const card = this.cartContainer.querySelector(`.cart-card[data-id="${productId}"]`);
      if (card) {
        const quantityDisplay = card.querySelector(".quantity-display");
        const currentQuantity = parseInt(quantityDisplay.textContent);
        const newQuantity = currentQuantity + 1;
        CartService.updateCart(productId, newQuantity);
        this.renderCart();
      }
      return;
    }

    // Botón para disminuir cantidad
    const decreaseBtn = e.target.closest(".decrease-btn");
    if (decreaseBtn) {
      e.preventDefault();
      const productId = Number(decreaseBtn.dataset.id);
      const card = this.cartContainer.querySelector(`.cart-card[data-id="${productId}"]`);
      if (card) {
        const quantityDisplay = card.querySelector(".quantity-display");
        const currentQuantity = parseInt(quantityDisplay.textContent);
        const newQuantity = currentQuantity - 1;
        // Si llega a cero se actualiza y se inicia la cuenta regresiva
        CartService.updateCart(productId, newQuantity <= 0 ? 0 : newQuantity);
        this.renderCart();
      }
      return;
    }

    this.cartContainer.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      if (deleteBtn) {
        e.preventDefault();
        const productId = deleteBtn.dataset.id; // En este caso productId es una cadena
        this.deleteProduct(productId);
      }
    });


    // Evento para vaciar el carrito ()
    const clearBtn = document.getElementById("btn-clear-cart");
    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        CartService.clearCart();
        this.renderCart();
      });
    }
  }
}


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
          stock: currentStock - quantity, // Update stock correctly
          quantity: quantity,
          description: product.description,
          imgLink: product.imgLink,
          category: product.category || "General"
        });
      }
      // Actualiza el stock en el almacenamiento principal
      CartService.updateProductStock(product.id, -quantity);
      CartService.saveCart(cart);
      NotificationManager.success("Producto agregado al carrito.");
    }, "Producto agregado al carrito", "Error al agregar producto al carrito");
  }

  static updateCart(productId, newQuantity) {
    return ExecuteManager.execute(() => {
      let cart = CartService.getCart();
      const index = cart.findIndex(item => item.id === productId);
      if (index !== -1) {
        const currentQuantity = cart[index].quantity;
        const quantityChange = newQuantity - currentQuantity;

        if (newQuantity < 0) {
          newQuantity = 0; // No permitir cantidades negativas
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

        // Actualizar el stock en el item del carrito para mostrar el valor correcto
        cart[index].stock = CartService.checkAvailableStock(productId);

        CartService.saveCart(cart);

        if (newQuantity === 0) {
          NotificationManager.warning(`El producto se eliminará en 5 segundos si la cantidad es cero.`);
        } else {
          NotificationManager.success("Cantidad actualizada.");
        }
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

    let updated = false;
    cart = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        // The stock shown in cart should be the AVAILABLE stock (after subtracting what's in cart)
        item.stock = product.stock;

        // Asegurarse de que el producto tenga categoría
        if (!item.category && product.category) {
          item.category = product.category;
        }

        // Verificar si la cantidad en carrito es mayor que el stock disponible
        // if (item.quantity > product.stock) {
        //   // Adjust quantity if more than available
        //   item.quantity = product.stock > 0 ? product.stock : 0;
        //   updated = true;
        //   NotificationManager.warning(`Cantidad de "${item.name}" ajustada al stock disponible.`);
        // }
        if (product) {
          item.stock = product.stock;
          // NotificationManager.warning(`Cantidad de "${item.name}" ajustada al stock disponible.`);

        }
      }
      return item;
    });

    if (updated) {
      CartService.saveCart(cart);
    }

    return cart;
  }
}

export {CartService, CartsPage};