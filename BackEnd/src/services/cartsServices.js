// import {ProductService} from "./productServices.js";
// import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
// import {AuthManager} from "./authServices.js";
// import {CategoryService} from "./categoryServices.js";
//
// /**
//  * Clase para gestionar el carrito de compras
//  */
// class CartsPage {
//   constructor() {
//     // Elementos del DOM
//     this.cartContainer = document.getElementById('cart-container');
//     this.cartSummary = document.getElementById('cart-summary');
//
//     // Datos del carrito
//     this.cartItems = {};
//     this.products = [];
//     this.ivaPercentage = 0; // IVA por defecto (12%)
//
//     // Datos de factura
//     this.invoiceNumber = this.generateInvoiceNumber();
//
//     // Constantes
//     this.CART_STORAGE_KEY = 'shopping_cart';
//   }
//
//   /**
//    * Inicializa la página del carrito
//    */
//   init() {
//     this.loadCartFromStorage();
//     this.loadProducts();
//     this.renderCartItems();
//     this.renderCartSummary();
//
//     // Eventos globales
//     document.addEventListener('click', (e) => {
//       if (e.target.closest('.clear-cart-btn')) {
//         this.clearCart();
//       }
//     });
//   }
//
//   /**
//    * Genera un número de factura único
//    */
//   generateInvoiceNumber() {
//     const date = new Date();
//     const year = date.getFullYear().toString().substr(-2);
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
//     return `<strong>FAC-</strong>${year}${month}${day}-${random}`;
//   }
//
//   /**
//    * Carga los productos desde el servicio de productos
//    */
//   loadProducts() {
//     try {
//       this.products = ProductService.getAllProducts();
//     } catch (error) {
//       console.error("Error al cargar productos:", error);
//       NotificationManager.error("Error al cargar productos");
//     }
//   }
//
//   /**
//    * Carga el carrito desde localStorage
//    */
//   loadCartFromStorage() {
//     const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
//     if (savedCart) {
//       this.cartItems = JSON.parse(savedCart);
//     }
//   }
//
//   /**
//    * Guarda el carrito en localStorage
//    */
//   saveCartToStorage() {
//     localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
//   }
//
//   /**
//    * Renderiza los items del carrito
//    */
//   renderCartItems() {
//     if (!this.cartContainer) return;
//     this.cartContainer.innerHTML = '';
//
//     const cartItemIds = Object.keys(this.cartItems);
//
//     if (cartItemIds.length === 0) {
//       this.cartContainer.innerHTML = `
//         <div class="empty-cart">
//           <i class="fa-solid fa-cart-shopping"></i>
//           <p>Tu carrito está vacío</p>
//           <p>Agrega productos desde la página de productos</p>
//         </div>
//       `;
//       return;
//     }
//
//     cartItemIds.forEach(productId => {
//       const product = this.products.find(p => p.id === productId);
//       if (product) {
//         const cartItem = this.createCartItemCard(product, this.cartItems[productId]);
//         this.cartContainer.appendChild(cartItem);
//       }
//     });
//   }
//
//   /**
//    * Crea una tarjeta para un item del carrito
//    */
//   createCartItemCard(product, quantity) {
//     // Asegurarse de que la categoría esté cargada
//     if (!product.category && product.categoryId) {
//       product.category = CategoryService.getCategoryById(product.categoryId);
//     }
//
//     const card = document.createElement('div');
//     card.className = 'cart-card';
//     card.dataset.productId = product.id;
//
//     card.innerHTML = `
//     <!-- Botón de eliminar arriba a la derecha -->
//     <button class="delete-btn" aria-label="Eliminar producto">
//       <i class="fa-solid fa-trash fa-lg" style="color: red;"></i>
//     </button>
//     <!-- Imagen del producto a la izquierda -->
//     <div class="cart-img">
//       <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
//     </div>
//     <!-- Contenedor central con la info principal -->
//     <div class="cart-content" style="margin-left: 5%">
//       <h3 class="product-name">${product.name}</h3>
//       <p class="product-description">${product.description || 'Sin descripción'}</p>
//       <p class="product-category">${product.category ? product.category.name : 'Sin categoría'}</p>
//     </div>
//     <!-- Sección de precio/subtotal a la derecha -->
//     <div class="cart-price" style="margin-right: 10%">
//       <p class="product-price">$${product.pvp.toFixed(2)} / unidad</p>
//       <p class="product-stock">Stock disponible: ${product.stock}</p>
//       <!-- Control de cantidad -->
//       <div class="quantity-control">
//         <button class="quantity-btn btn-decrement">
//           <i class="fa-solid fa-minus"></i>
//         </button>
//         <input type="text" class="quantity-input" value="${quantity}" readonly>
//         <button class="quantity-btn btn-increment" ${product.stock <= 0 ? 'disabled' : ''}>
//           <i class="fa-solid fa-plus"></i>
//         </button>
//       </div>
//     </div>
//   `;
//
//     // Event listeners
//     const btnDecrement = card.querySelector('.btn-decrement');
//     const btnIncrement = card.querySelector('.btn-increment');
//     const deleteBtn = card.querySelector('.delete-btn');
//
//     btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
//     btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
//     deleteBtn.addEventListener('click', () => this.removeFromCart(product.id));
//
//     return card;
//   }
//
//   /**
//    * Renderiza el resumen del carrito y la factura
//    */
//   renderCartSummary() {
//     if (!this.cartSummary) return;
//
//     const cartItemIds = Object.keys(this.cartItems);
//
//     if (cartItemIds.length === 0) {
//       this.cartSummary.innerHTML = `
//         <div class="invoice-header">
//           <h2 class="invoice-title">Resumen de compra</h2>
//           <p class="invoice-details">No hay productos en el carrito</p>
//         </div>
//       `;
//       return;
//     }
//
//     // Calcular totales
//     let subtotal = 0;
//     const items = [];
//
//     cartItemIds.forEach(productId => {
//       const product = this.products.find(p => p.id === productId);
//       if (product) {
//         const quantity = this.cartItems[productId];
//         const itemTotal = product.pvp * quantity;
//         subtotal += itemTotal;
//
//         items.push({
//           name: product.name,
//           price: product.pvp,
//           quantity: quantity,
//           total: itemTotal
//         });
//       }
//     });
//
//     const ivaAmount = subtotal * (this.ivaPercentage / 100);
//     const total = subtotal + ivaAmount;
//     const currentDate = new Date();
//     const formattedDate = `${currentDate.getDate()} de ${this.getMonthName(currentDate.getMonth())} de ${currentDate.getFullYear()}`;
//     const hours = currentDate.getHours();
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     const formattedTime = `${formattedHours}:${String(currentDate.getMinutes()).padStart(2, '0')} ${ampm}`;
//     const currentUser = AuthManager.getCurrentSession();
//
//     this.cartSummary.innerHTML = `
//       <div class="invoice-header">
//           <h2 class="invoice-title">Compra</h2>
//           <div class="invoice-details">
//             <div style="display: flex; justify-content: space-between; align-items: center;">
//               <p><strong>Cliente:</strong> ${currentUser && currentUser.full_name ? currentUser.full_name : 'Cliente'}</p>
//               <p> ${this.invoiceNumber}</p>
//             </div>
//             <p><strong>Fecha:</strong> ${formattedDate}</p>
//             <p><strong>Hora:</strong> ${formattedTime}</p>
//           </div>
//         </div>
//
//       <h4 class="invoice-title" style="margin-top: -5%">Detalle de Compra</h4>
//
// <div class="invoice-table-container" style="max-height: 300px; overflow-y: auto; margin-top: -5%">
//   <table class="invoice-table" style="width: 100%; border-collapse: collapse;">
//     <thead style="position: sticky; top: 0; background-color: white; z-index: 0;">
//       <tr>
//         <th>Producto</th>
//         <th>Cant.</th>
//         <th>Precio</th>
//         <th>Total</th>
//       </tr>
//     </thead>
//     <tbody>
//       ${items.map(item => `
//         <tr>
//           <td>${item.name}</td>
//           <td style="text-align: center">${item.quantity}</td>
//           <td style="text-align: center">$${item.price.toFixed(2)}</td>
//           <td style="text-align: center">$${item.total.toFixed(2)}</td>
//         </tr>
//       `).join('')}
//     </tbody>
//   </table>
// </div>
//       <div class="total-section" style="margin-left: 0.2rem; margin-top: -3%">
//         <div class="total-row">
//           <span class="total-label">Subtotal:</span>
//           <span class="total-value">$${subtotal.toFixed(2)}</span>
//         </div>
//
//         <div class="iva-control total-row">
//           <span class="total-label">IVA (%):</span>
//           <input type="number" class="iva-input" value="${this.ivaPercentage}" min="0" max="100" id="iva-percentage" style="margin-left: -40%" readonly>
//           <span class="total-value">$${ivaAmount.toFixed(2)}</span>
//         </div>
//
//         <div class="total-row grand-total">
//           <span class="total-label">Total:</span>
//           <span class="total-value" style="color: #18b918; text-decoration: underline">$${total.toFixed(2)}</span>
//         </div>
//       </div>
//
//       <button class="clear-cart-btn" style="background-color: red">
//         <i class="fa-solid fa-trash-can fa-lg" style="margin-right: 8px; color: white"></i> Vaciar carrito
//       </button>
//     `;
//
//     // Añadir event listener para el cambio de IVA
//     const ivaInput = this.cartSummary.querySelector('#iva-percentage');
//     if (ivaInput) {
//       ivaInput.addEventListener('change', (e) => {
//         this.ivaPercentage = parseFloat(e.target.value) || 0;
//         this.renderCartSummary();
//       });
//     }
//   }
//
//   /**
//    * Obtiene el nombre del mes en español
//    */
//   getMonthName(monthIndex) {
//     const months = [
//       'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
//       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
//     ];
//     return months[monthIndex];
//   }
//
//   /**
//    * Incrementa la cantidad de un producto en el carrito
//    */
//   incrementQuantity(productId) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     const currentQuantity = this.cartItems[productId] || 0;
//
//     // Verificar si hay stock suficiente
//     if (product.stock <= 0) {
//       NotificationManager.warning(`No hay suficiente stock de "${product.name}"`);
//       return;
//     }
//
//     this.cartItems[productId] = currentQuantity + 1;
//     this.saveCartToStorage();
//     this.updateProductStock(productId, -1); // Restar 1 al stock
//     this.renderCartItems();
//     this.renderCartSummary();
//   }
//
//   /**
//    * Decrementa la cantidad de un producto en el carrito
//    */
//   decrementQuantity(productId) {
//     const currentQuantity = this.cartItems[productId] || 0;
//
//     if (currentQuantity <= 1) {
//       // Si la cantidad es 1 o menos, eliminar el producto del carrito
//       this.removeFromCart(productId);
//       return;
//     }
//
//     this.cartItems[productId] = currentQuantity - 1;
//     this.saveCartToStorage();
//     this.updateProductStock(productId, 1); // Sumar 1 al stock
//     this.renderCartItems();
//     this.renderCartSummary();
//   }
//
//   /**
//    * Elimina un producto del carrito
//    */
//   removeFromCart(productId) {
//     const quantity = this.cartItems[productId] || 0;
//
//     if (quantity > 0) {
//       // Devolver el stock
//       this.updateProductStock(productId, quantity);
//
//       // Eliminar del carrito
//       delete this.cartItems[productId];
//       this.saveCartToStorage();
//
//       // Notificar al usuario
//       const product = this.products.find(p => p.id === productId);
//       if (product) {
//         NotificationManager.info(`Producto "${product.name}" eliminado del carrito`);
//       }
//
//       // Actualizar la interfaz
//       this.renderCartItems();
//       this.renderCartSummary();
//     }
//   }
//
//   /**
//    * Vacía todo el carrito y devuelve el stock
//    */
//   clearCart() {
//     // Confirmar antes de vaciar
//     if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
//       return;
//     }
//
//     // Devolver el stock de cada producto
//     Object.keys(this.cartItems).forEach(productId => {
//       const quantity = this.cartItems[productId];
//       this.updateProductStock(productId, quantity);
//     });
//
//     // Vaciar el carrito
//     this.cartItems = {};
//     this.saveCartToStorage();
//
//     // Notificar al usuario
//     NotificationManager.info('Carrito vaciado correctamente');
//
//     // Actualizar la interfaz
//     this.renderCartItems();
//     this.renderCartSummary();
//   }
//
//   /**
//    * Actualiza el stock de un producto y guarda en localStorage
//    */
//   updateProductStock(productId, quantityToAdd) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     // Actualizar el stock
//     product.stock += quantityToAdd;
//
//     // Guardar en localStorage
//     localStorage.setItem(ProductService.STORAGE_KEY, JSON.stringify(this.products));
//   }
// }
//
// export {CartsPage};

import {ProductService} from "./productServices.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {AuthManager} from "./authServices.js";
import {CategoryService} from "./categoryServices.js";

/**
 * Clase para gestionar el carrito de compras
 */
class CartsPage {
  constructor() {
    // Elementos del DOM
    this.cartContainer = document.getElementById('cart-container');
    this.cartSummary = document.getElementById('cart-summary');

    // Datos del carrito
    this.cartItems = {};
    this.products = [];
    this.ivaPercentage = 0; // IVA por defecto (12%)

    // Datos de factura
    this.invoiceNumber = this.generateInvoiceNumber();

    // Constantes
    this.CART_STORAGE_KEY = 'shopping_cart';
  }

  /**
   * Inicializa la página del carrito
   */
  init() {
    this.loadCartFromStorage();
    this.loadProducts();
    this.renderCartItems();
    this.renderCartSummary();

    // Eventos globales
    document.addEventListener('click', (e) => {
      if (e.target.closest('.clear-cart-btn')) {
        this.clearCart();
      }
    });

    // Añadir evento de redimensionado para ajustar el layout
    window.addEventListener('resize', () => {
      this.adjustLayoutForScreenSize();
    });

    // Ajustar layout inicial
    this.adjustLayoutForScreenSize();
  }

  /**
   * Ajusta el layout basado en el tamaño de la pantalla
   */
  adjustLayoutForScreenSize() {
    const cartLayout = document.querySelector('.cart-layout');
    const isMobile = window.innerWidth <= 768;

    if (cartLayout) {
      cartLayout.style.flexDirection = isMobile ? 'column' : 'row';
    }

    if (this.cartSummary) {
      this.cartSummary.style.position = isMobile ? 'static' : 'sticky';
    }
  }

  /**
   * Genera un número de factura único
   */
  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
    return `<strong>FAC-</strong>${year}${month}${day}-${random}`;
  }

  /**
   * Carga los productos desde el servicio de productos
   */
  loadProducts() {
    try {
      this.products = ProductService.getAllProducts();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      NotificationManager.error("Error al cargar productos");
    }
  }

  /**
   * Carga el carrito desde localStorage
   */
  loadCartFromStorage() {
    const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  }

  /**
   * Guarda el carrito en localStorage
   */
  saveCartToStorage() {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
  }

  /**
   * Renderiza los items del carrito
   */
  renderCartItems() {
    if (!this.cartContainer) return;
    this.cartContainer.innerHTML = '';

    const cartItemIds = Object.keys(this.cartItems);

    if (cartItemIds.length === 0) {
      this.cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Tu carrito está vacío</p>
          <p>Agrega productos desde la página de productos</p>
        </div>
      `;
      return;
    }

    cartItemIds.forEach(productId => {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        const cartItem = this.createCartItemCard(product, this.cartItems[productId]);
        this.cartContainer.appendChild(cartItem);
      }
    });
  }

  /**
   * Crea una tarjeta para un item del carrito
   */
  createCartItemCard(product, quantity) {
    // Asegurarse de que la categoría esté cargada
    if (!product.category && product.categoryId) {
      product.category = CategoryService.getCategoryById(product.categoryId);
    }

    const card = document.createElement('div');
    card.className = 'cart-card';
    card.dataset.productId = product.id;

    card.innerHTML = `
    <div class="cart-card-inner">
      <!-- Botón de eliminar arriba a la derecha -->
      <button class="delete-btn" aria-label="Eliminar producto">
        <i class="fa-solid fa-trash fa-lg" style="color: red;"></i>
      </button>
      
      <!-- Imagen del producto -->
      <div class="cart-img">
        <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
      </div>
      
      <!-- Contenedor con la info principal -->
      <div class="cart-content">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || 'Sin descripción'}</p>
        <p class="product-category">${product.category ? product.category.name : 'Sin categoría'}</p>
      </div>
      
      <!-- Sección de precio -->
      <div class="cart-price">
        <p class="product-price">$${product.pvp.toFixed(2)}</p>
        <p class="product-stock">Stock disponible: ${product.stock}</p>
        <!-- Control de cantidad -->
        <div class="quantity-control">
          <button class="quantity-btn btn-decrement">
            <i class="fa-solid fa-minus"></i>
          </button>
          <input type="text" class="quantity-input" value="${quantity}" readonly>
          <button class="quantity-btn btn-increment" ${product.stock <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `;

    // Event listeners
    const btnDecrement = card.querySelector('.btn-decrement');
    const btnIncrement = card.querySelector('.btn-increment');
    const deleteBtn = card.querySelector('.delete-btn');

    btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
    btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
    deleteBtn.addEventListener('click', () => this.removeFromCart(product.id));

    return card;
  }

  /**
   * Renderiza el resumen del carrito y la factura
   */
  renderCartSummary() {
    if (!this.cartSummary) return;

    const cartItemIds = Object.keys(this.cartItems);

    if (cartItemIds.length === 0) {
      this.cartSummary.innerHTML = `
        <div class="invoice-header">
          <h2 class="invoice-title">Resumen de compra</h2>
          <p class="invoice-details">No hay productos en el carrito</p>
        </div>
      `;
      return;
    }

    // Calcular totales
    let subtotal = 0;
    const items = [];

    cartItemIds.forEach(productId => {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        const quantity = this.cartItems[productId];
        const itemTotal = product.pvp * quantity;
        subtotal += itemTotal;

        items.push({
          name: product.name,
          price: product.pvp,
          quantity: quantity,
          total: itemTotal
        });
      }
    });

    const ivaAmount = subtotal * (this.ivaPercentage / 100);
    const total = subtotal + ivaAmount;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} de ${this.getMonthName(currentDate.getMonth())} de ${currentDate.getFullYear()}`;
    const hours = currentDate.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${String(currentDate.getMinutes()).padStart(2, '0')} ${ampm}`;
    const currentUser = AuthManager.getCurrentSession();

    this.cartSummary.innerHTML = `
      <div class="invoice-header">
        <h2 class="invoice-title">Compra</h2>
        <div class="invoice-details">
          <div class="invoice-client-info">
            <p><strong>Cliente:</strong> ${currentUser && currentUser.full_name ? currentUser.full_name : 'Cliente'}</p>
            <p class="invoice-number">${this.invoiceNumber}</p>
          </div>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
        </div>
      </div>

      <h4 class="invoice-subtitle">Detalle de Compra</h4>

      <div class="invoice-table-container">
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
            ${items.map(item => `
              <tr>
                <td class="item-name">${item.name}</td>
                <td class="item-quantity">${item.quantity}</td>
                <td class="item-price">$${item.price.toFixed(2)}</td>
                <td class="item-total">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">$${subtotal.toFixed(2)}</span>
        </div>

        <div class="iva-control total-row">
          <span class="total-label">IVA (%):</span>
          <input type="number" class="iva-input" value="${this.ivaPercentage}" min="0" max="100" id="iva-percentage" readonly>
          <span class="total-value">$${ivaAmount.toFixed(2)}</span>
        </div>

        <div class="total-row grand-total">
          <span class="total-label">Total:</span>
          <span class="total-value total-highlight">$${total.toFixed(2)}</span>
        </div>
      </div>

      <button class="clear-cart-btn">
        <i class="fa-solid fa-trash-can fa-lg"></i> Vaciar carrito
      </button>
    `;

    // Añadir event listener para el cambio de IVA
    const ivaInput = this.cartSummary.querySelector('#iva-percentage');
    if (ivaInput) {
      ivaInput.addEventListener('change', (e) => {
        this.ivaPercentage = parseFloat(e.target.value) || 0;
        this.renderCartSummary();
      });
    }

    // Ajustar el layout según el tamaño de la pantalla
    this.adjustLayoutForScreenSize();
  }

  /**
   * Obtiene el nombre del mes en español
   */
  getMonthName(monthIndex) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months[monthIndex];
  }

  /**
   * Incrementa la cantidad de un producto en el carrito
   */
  incrementQuantity(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const currentQuantity = this.cartItems[productId] || 0;

    // Verificar si hay stock suficiente
    if (product.stock <= 0) {
      NotificationManager.warning(`No hay suficiente stock de "${product.name}"`);
      return;
    }

    this.cartItems[productId] = currentQuantity + 1;
    this.saveCartToStorage();
    this.updateProductStock(productId, -1); // Restar 1 al stock
    this.renderCartItems();
    this.renderCartSummary();
  }

  /**
   * Decrementa la cantidad de un producto en el carrito
   */
  decrementQuantity(productId) {
    const currentQuantity = this.cartItems[productId] || 0;

    if (currentQuantity <= 1) {
      // Si la cantidad es 1 o menos, eliminar el producto del carrito
      this.removeFromCart(productId);
      return;
    }

    this.cartItems[productId] = currentQuantity - 1;
    this.saveCartToStorage();
    this.updateProductStock(productId, 1); // Sumar 1 al stock
    this.renderCartItems();
    this.renderCartSummary();
  }

  /**
   * Elimina un producto del carrito
   */
  removeFromCart(productId) {
    const quantity = this.cartItems[productId] || 0;

    if (quantity > 0) {
      // Devolver el stock
      this.updateProductStock(productId, quantity);

      // Eliminar del carrito
      delete this.cartItems[productId];
      this.saveCartToStorage();

      // Notificar al usuario
      const product = this.products.find(p => p.id === productId);
      if (product) {
        NotificationManager.info(`Producto "${product.name}" eliminado del carrito`);
      }

      // Actualizar la interfaz
      this.renderCartItems();
      this.renderCartSummary();
    }
  }

  /**
   * Vacía todo el carrito y devuelve el stock
   */
  clearCart() {
    // Confirmar antes de vaciar
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      return;
    }

    // Devolver el stock de cada producto
    Object.keys(this.cartItems).forEach(productId => {
      const quantity = this.cartItems[productId];
      this.updateProductStock(productId, quantity);
    });

    // Vaciar el carrito
    this.cartItems = {};
    this.saveCartToStorage();

    // Notificar al usuario
    NotificationManager.info('Carrito vaciado correctamente');

    // Actualizar la interfaz
    this.renderCartItems();
    this.renderCartSummary();
  }

  /**
   * Actualiza el stock de un producto y guarda en localStorage
   */
  updateProductStock(productId, quantityToAdd) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Actualizar el stock
    product.stock += quantityToAdd;

    // Guardar en localStorage
    localStorage.setItem(ProductService.STORAGE_KEY, JSON.stringify(this.products));
  }
}

export {CartsPage};