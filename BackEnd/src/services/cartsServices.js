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
          imgLink: product.imgLink
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
          CartService.removeFromCart(productId);
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
  }

  init() {
    return ExecuteManager.execute(() => {
      CartService.refreshCartStockInfo();
      this.renderCart();
    }, "Carrito de compras inicializado", "Error al inicializar el carrito de compras");
  }

  renderCart() {
    return ExecuteManager.execute(() => {
      const cart = CartService.getCart();
      // Actualiza la información de stock para cada producto en el carrito
      CartService.refreshCartStockInfo();
      this.cartContainer.innerHTML = "";
      if (cart.length === 0) {
        this.cartContainer.innerHTML = "<p style='text-align:center;'>Sin compras</p>";
        this.cartSummary.innerHTML = "";
        return;
      }
      // Se obtienen los productos para conocer el stock actual
      const products = LocalStorageManager.getData(PRODUCTS_KEY) || [];
      cart.forEach(item => {
        const currentProduct = products.find(p => p.id === item.id);
        const currentStock = currentProduct ? currentProduct.stock : 0;
        const card = document.createElement("div");
        card.className = "cart-card";
        card.style.border = "1px solid #ddd";
        card.style.padding = "15px";
        card.style.marginBottom = "15px";
        card.style.display = "flex";
        card.style.justifyContent = "space-between";
        card.style.alignItems = "center";
        card.innerHTML = `
          <div style="display: flex; align-items: flex-start;">
            <div style="flex: 0 0 40%; padding-right: 20px;">
              <img src="${item.imgLink}" alt="${item.name}" style="width: 100%; max-width: 150px; display: block;">
            </div>
            <div style="flex: 1;">
              <h2 style="margin-top: 0;">${item.name}</h2>
              <p>Precio: $${Number(item.price).toFixed(2)}</p>
              <p>Cantidad: 
                <input type="number" min="1" max="${item.quantity + currentStock}" value="${item.quantity}" data-id="${item.id}" class="cart-quantity" style="width:60px;">
              </p>
              <p>Stock actual: ${currentStock}</p>
            </div>
            <button class="btn-remove" data-id="${item.id}" style="background-color:red; color:#fff; border:none; padding:10px; border-radius:4px; cursor:pointer; margin-top: 10px;">
              Eliminar
            </button>
          </div>
        `;
        this.cartContainer.appendChild(card);
      });
      const total = CartService.getCartTotal();
      this.cartSummary.innerHTML = `
        <h2>Total: $${total.toFixed(2)}</h2>
        <button id="btn-clear-cart" style="background-color:#ff9aa2; color:#fff; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">
          Vaciar carrito de compra
        </button>
      `;
      this.attachEvents();
    }, "Carrito renderizado", "Error al renderizar el carrito");
  }

  attachEvents() {
    // Asigna eventos a los inputs de cantidad
    this.cartContainer.querySelectorAll(".cart-quantity").forEach(input => {
      input.addEventListener("change", (e) => {
        const newQuantity = parseInt(e.target.value);
        const productId = Number(e.target.dataset.id);
        CartService.updateCart(productId, newQuantity);
        this.renderCart();
      });
    });
    // Evento para eliminar producto
    this.cartContainer.querySelectorAll(".btn-remove").forEach(btn => {
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
  }
}

export { CartService, CartsPage };