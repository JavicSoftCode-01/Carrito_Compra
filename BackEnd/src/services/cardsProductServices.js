// // // import {ProductService} from "./productServices.js";
// // // import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
// // //
// // // /**
// // //  * Servicio para gestionar la visualización y funcionalidad de las cards de productos
// // //  */
// // // class CardsProductService {
// // //   constructor() {
// // //     this.products = [];
// // //     this.cartItems = {};
// // //     this.productsContainer = document.getElementById('products-container');
// // //   }
// // //
// // //   /**
// // //    * Inicializa el servicio de cards de productos
// // //    */
// // //   init() {
// // //     this.loadProducts();
// // //     this.renderProducts();
// // //     // Actualizar la vista cuando cambia el tamaño de la ventana
// // //     window.addEventListener('resize', () => this.adjustLayout());
// // //   }
// // //
// // //   /**
// // //    * Carga los productos desde el servicio de productos
// // //    */
// // //   loadProducts() {
// // //     try {
// // //       this.products = ProductService.getAllProducts(true);
// // //     } catch (error) {
// // //       NotificationManager.error(`Error al cargar productos: ${error.message}`);
// // //     }
// // //   }
// // //
// // //   /**
// // //    * Renderiza los productos en el contenedor
// // //    */
// // //   renderProducts() {
// // //     if (!this.productsContainer) return;
// // //
// // //     this.productsContainer.innerHTML = '';
// // //
// // //     if (this.products.length === 0) {
// // //       this.productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
// // //       return;
// // //     }
// // //
// // //     this.products.forEach(product => {
// // //       const card = this.createProductCard(product);
// // //       this.productsContainer.appendChild(card);
// // //     });
// // //
// // //     this.adjustLayout();
// // //   }
// // //
// // //   /**
// // //    * Crea una card para un producto
// // //    * @param {Object} product - Producto a mostrar
// // //    * @returns {HTMLElement} - Elemento de la card
// // //    */
// // //   createProductCard(product) {
// // //     const card = document.createElement('div');
// // //     card.className = 'product-card';
// // //     card.dataset.productId = product.id;
// // //
// // //     // Determinar estado del stock
// // //     const stockStatus = product.stock > 10 ? 'alto' : product.stock > 5 ? 'medio' : 'bajo';
// // //
// // //     card.innerHTML = `
// // //       <div class="product-image">
// // //         <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
// // //       </div>
// // //       <div class="product-info">
// // //         <h3 class="product-name">${product.name}</h3>
// // //         <p class="product-description">${product.description || 'Sin descripción'}</p>
// // //         <div class="product-details">
// // //           <p class="product-price">$${product.pvp.toFixed(2)}</p>
// // //           <p class="product-stock ${stockStatus}">Stock: ${product.stock}</p>
// // //           ${product.category ? `<p class="product-category">${product.category.name}</p>` : ''}
// // //         </div>
// // //         <div class="product-cart-control">
// // //           <button class="btn-decrement" ${this.getCartQuantity(product.id) <= 0 ? 'disabled' : ''}>
// // //             <i class="fa-solid fa-minus"></i>
// // //           </button>
// // //           <span class="cart-quantity">${this.getCartQuantity(product.id) || 0}</span>
// // //           <button class="btn-increment" ${product.stock <= this.getCartQuantity(product.id) ? 'disabled' : ''}>
// // //             <i class="fa-solid fa-plus"></i>
// // //           </button>
// // //         </div>
// // //         <button class="btn-add-to-cart">
// // //           Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>
// // //         </button>
// // //       </div>
// // //     `;
// // //
// // //     // Añadir event listeners
// // //     const btnDecrement = card.querySelector('.btn-decrement');
// // //     const btnIncrement = card.querySelector('.btn-increment');
// // //     const btnAddToCart = card.querySelector('.btn-add-to-cart');
// // //
// // //     btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
// // //     btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
// // //     btnAddToCart.addEventListener('click', () => this.addToCart(product.id));
// // //
// // //     return card;
// // //   }
// // //
// // //   /**
// // //    * Ajusta el layout de las cards según el tamaño de la pantalla
// // //    */
// // //   adjustLayout() {
// // //     const cards = document.querySelectorAll('.product-card');
// // //     if (!cards.length) return;
// // //
// // //     // Ajustar el número de cards por fila según el ancho de la pantalla
// // //     const containerWidth = this.productsContainer.offsetWidth;
// // //     let cardsPerRow = 4; // Por defecto 4 cards en pantallas grandes
// // //
// // //     if (containerWidth < 1200) cardsPerRow = 4;
// // //     if (containerWidth < 992) cardsPerRow = 3;
// // //     if (containerWidth < 768) cardsPerRow = 2;
// // //     if (containerWidth < 576) cardsPerRow = 1;
// // //
// // //     cards.forEach(card => {
// // //       card.style.width = `calc(${100 / cardsPerRow}% - 20px)`;
// // //     });
// // //   }
// // //
// // //   /**
// // //    * Obtiene la cantidad de un producto en el carrito
// // //    * @param {string} productId - ID del producto
// // //    * @returns {number} - Cantidad en el carrito
// // //    */
// // //   getCartQuantity(productId) {
// // //     return this.cartItems[productId] || 0;
// // //   }
// // //
// // //   /**
// // //    * Incrementa la cantidad de un producto en el carrito
// // //    * @param {string} productId - ID del producto
// // //    */
// // //   incrementQuantity(productId) {
// // //     const product = this.products.find(p => p.id === productId);
// // //     if (!product) return;
// // //
// // //     const currentQuantity = this.getCartQuantity(productId);
// // //     if (currentQuantity >= product.stock) {
// // //       NotificationManager.warning('Stock agotado');
// // //       return;
// // //     }
// // //
// // //     this.cartItems[productId] = currentQuantity + 1;
// // //     this.updateProductCard(productId);
// // //   }
// // //
// // //   /**
// // //    * Decrementa la cantidad de un producto en el carrito
// // //    * @param {string} productId - ID del producto
// // //    */
// // //   decrementQuantity(productId) {
// // //     const currentQuantity = this.getCartQuantity(productId);
// // //     if (currentQuantity <= 0) return;
// // //
// // //     this.cartItems[productId] = currentQuantity - 1;
// // //
// // //     // Se elimina la notificación al llegar a cero
// // //     if (this.cartItems[productId] === 0) {
// // //       delete this.cartItems[productId];
// // //     }
// // //
// // //     this.updateProductCard(productId);
// // //   }
// // //
// // //   /**
// // //    * Añade un producto al carrito
// // //    * @param {string} productId - ID del producto
// // //    */
// // //   addToCart(productId) {
// // //     const product = this.products.find(p => p.id === productId);
// // //     if (!product) return;
// // //
// // //     const currentQuantity = this.getCartQuantity(productId);
// // //     if (currentQuantity >= product.stock) {
// // //       NotificationManager.warning('Stock agotado');
// // //       return;
// // //     }
// // //
// // //     // Si no hay cantidad seleccionada, se añade 1
// // //     if (currentQuantity === 0) {
// // //       this.cartItems[productId] = 1;
// // //     }
// // //
// // //     // Actualizar visualización
// // //     this.updateProductCard(productId);
// // //
// // //     NotificationManager.success(`${product.name} añadido al carrito`);
// // //
// // //     // Aquí podrías implementar el guardado del carrito en localStorage o enviarlo al backend
// // //   }
// // //
// // //   /**
// // //    * Actualiza la visualización de una card de producto
// // //    * @param {string} productId - ID del producto
// // //    */
// // //   updateProductCard(productId) {
// // //     const product = this.products.find(p => p.id === productId);
// // //     if (!product) return;
// // //
// // //     const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
// // //     if (!card) return;
// // //
// // //     const cartQuantity = this.getCartQuantity(productId);
// // //     const stockRemaining = product.stock - cartQuantity;
// // //
// // //     // Actualizar contador de cantidad
// // //     const quantityElement = card.querySelector('.cart-quantity');
// // //     if (quantityElement) {
// // //       quantityElement.textContent = cartQuantity;
// // //     }
// // //
// // //     // Actualizar botones de incremento/decremento
// // //     const btnDecrement = card.querySelector('.btn-decrement');
// // //     const btnIncrement = card.querySelector('.btn-increment');
// // //     const btnAddToCart = card.querySelector('.btn-add-to-cart');
// // //
// // //     if (btnDecrement) {
// // //       btnDecrement.disabled = cartQuantity <= 0;
// // //     }
// // //
// // //     if (btnIncrement) {
// // //       btnIncrement.disabled = stockRemaining <= 0;
// // //     }
// // //
// // //     // Se mantiene el botón de agregar siempre activo y con el mismo texto
// // //     if (btnAddToCart) {
// // //       btnAddToCart.disabled = false;
// // //       btnAddToCart.innerHTML = 'Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>';
// // //     }
// // //
// // //     // Actualizar visualización de stock
// // //     const stockElement = card.querySelector('.product-stock');
// // //     if (stockElement) {
// // //       stockElement.textContent = `Stock: ${stockRemaining}`;
// // //
// // //       // Actualizar clase de estado de stock
// // //       stockElement.className = 'product-stock';
// // //       if (stockRemaining > 50) {
// // //         stockElement.classList.add('alto');
// // //       } else if (stockRemaining > 20) {
// // //         stockElement.classList.add('medio');
// // //       } else {
// // //         stockElement.classList.add('bajo');
// // //       }
// // //     }
// // //   }
// // // }
// // //
// // // export {CardsProductService};
// //
// // import {ProductService} from "./productServices.js";
// // import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
// //
// // /**
// //  * Servicio para gestionar la visualización y funcionalidad de las cards de productos
// //  */
// // class CardsProductService {
// //   constructor() {
// //     this.products = [];
// //     this.cartItems = {};
// //     this.productsContainer = document.getElementById('products-container');
// //     this.notificationDebounceTimeout = null;
// //     this.pendingNotifications = {};
// //   }
// //
// //   /**
// //    * Inicializa el servicio de cards de productos
// //    */
// //   init() {
// //     this.loadProducts();
// //     this.renderProducts();
// //     // Actualizar la vista cuando cambia el tamaño de la ventana
// //     window.addEventListener('resize', () => this.adjustLayout());
// //   }
// //
// //   /**
// //    * Carga los productos desde el servicio de productos
// //    */
// //   loadProducts() {
// //     try {
// //       this.products = ProductService.getAllProducts(true);
// //     } catch (error) {
// //       NotificationManager.error(`Error al cargar productos: ${error.message}`);
// //     }
// //   }
// //
// //   /**
// //    * Renderiza los productos en el contenedor
// //    */
// //   renderProducts() {
// //     if (!this.productsContainer) return;
// //
// //     this.productsContainer.innerHTML = '';
// //
// //     if (this.products.length === 0) {
// //       this.productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
// //       return;
// //     }
// //
// //     this.products.forEach(product => {
// //       const card = this.createProductCard(product);
// //       this.productsContainer.appendChild(card);
// //     });
// //
// //     this.adjustLayout();
// //   }
// //
// //   /**
// //    * Crea una card para un producto
// //    * @param {Object} product - Producto a mostrar
// //    * @returns {HTMLElement} - Elemento de la card
// //    */
// //   createProductCard(product) {
// //     const card = document.createElement('div');
// //     card.className = 'product-card';
// //     card.dataset.productId = product.id;
// //
// //     // Determinar estado del stock
// //     const stockStatus = product.stock > 10 ? 'alto' : product.stock > 5 ? 'medio' : 'bajo';
// //
// //     card.innerHTML = `
// //       <div class="product-image">
// //         <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
// //       </div>
// //       <div class="product-info">
// //         <h3 class="product-name">${product.name}</h3>
// //         <p class="product-description">${product.description || 'Sin descripción'}</p>
// //         <div class="product-details">
// //           <p class="product-price">$${product.pvp.toFixed(2)}</p>
// //           <p class="product-stock ${stockStatus}">Stock: ${product.stock}</p>
// //           ${product.category ? `<p class="product-category">${product.category.name}</p>` : ''}
// //         </div>
// //         <div class="product-cart-control">
// //           <button class="btn-decrement" ${this.getCartQuantity(product.id) <= 0 ? 'disabled' : ''}>
// //             <i class="fa-solid fa-minus"></i>
// //           </button>
// //           <span class="cart-quantity">${this.getCartQuantity(product.id) || 0}</span>
// //           <button class="btn-increment" ${product.stock <= this.getCartQuantity(product.id) ? 'disabled' : ''}>
// //             <i class="fa-solid fa-plus"></i>
// //           </button>
// //         </div>
// //         <button class="btn-add-to-cart">
// //           Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>
// //         </button>
// //       </div>
// //     `;
// //
// //     // Añadir event listeners
// //     const btnDecrement = card.querySelector('.btn-decrement');
// //     const btnIncrement = card.querySelector('.btn-increment');
// //     const btnAddToCart = card.querySelector('.btn-add-to-cart');
// //
// //     btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
// //     btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
// //     btnAddToCart.addEventListener('click', () => this.addToCart(product.id));
// //
// //     return card;
// //   }
// //
// //   /**
// //    * Ajusta el layout de las cards según el tamaño de la pantalla
// //    */
// //   adjustLayout() {
// //     const cards = document.querySelectorAll('.product-card');
// //     if (!cards.length) return;
// //
// //     // Ajustar el número de cards por fila según el ancho de la pantalla
// //     const containerWidth = this.productsContainer.offsetWidth;
// //     let cardsPerRow = 4; // Por defecto 4 cards en pantallas grandes
// //
// //     if (containerWidth < 1200) cardsPerRow = 4;
// //     if (containerWidth < 992) cardsPerRow = 3;
// //     if (containerWidth < 768) cardsPerRow = 2;
// //     if (containerWidth < 576) cardsPerRow = 1;
// //
// //     cards.forEach(card => {
// //       card.style.width = `calc(${100 / cardsPerRow}% - 20px)`;
// //     });
// //   }
// //
// //   /**
// //    * Obtiene la cantidad de un producto en el carrito
// //    * @param {string} productId - ID del producto
// //    * @returns {number} - Cantidad en el carrito
// //    */
// //   getCartQuantity(productId) {
// //     return this.cartItems[productId] || 0;
// //   }
// //
// //   /**
// //    * Incrementa la cantidad de un producto en el carrito
// //    * @param {string} productId - ID del producto
// //    */
// //   incrementQuantity(productId) {
// //     const product = this.products.find(p => p.id === productId);
// //     if (!product) return;
// //
// //     const currentQuantity = this.getCartQuantity(productId);
// //     if (currentQuantity >= product.stock) {
// //       NotificationManager.warning(`STOCK AGOTADO`);
// //       return;
// //     }
// //
// //     this.cartItems[productId] = currentQuantity + 1;
// //     this.updateProductCard(productId);
// //   }
// //
// //   /**
// //    * Decrementa la cantidad de un producto en el carrito
// //    * @param {string} productId - ID del producto
// //    */
// //   decrementQuantity(productId) {
// //     const currentQuantity = this.getCartQuantity(productId);
// //     if (currentQuantity <= 0) return;
// //
// //     this.cartItems[productId] = currentQuantity - 1;
// //
// //     // Se elimina la entrada del carrito al llegar a cero
// //     if (this.cartItems[productId] === 0) {
// //       delete this.cartItems[productId];
// //     }
// //
// //     this.updateProductCard(productId);
// //   }
// //
// //   /**
// //    * Muestra notificaciones de manera controlada
// //    * @param {string} productId - ID del producto
// //    * @param {string} message - Mensaje a mostrar
// //    */
// //   showNotification(productId, message) {
// //     // Cancelar cualquier notificación pendiente
// //     if (this.notificationDebounceTimeout) {
// //       clearTimeout(this.notificationDebounceTimeout);
// //     }
// //
// //     // Agrupar notificaciones del mismo producto
// //     if (!this.pendingNotifications[productId]) {
// //       this.pendingNotifications[productId] = {
// //         count: 1,
// //         message
// //       };
// //     } else {
// //       this.pendingNotifications[productId].count++;
// //     }
// //
// //     // Mostrar la notificación después de un breve retraso
// //     this.notificationDebounceTimeout = setTimeout(() => {
// //       Object.keys(this.pendingNotifications).forEach(id => {
// //         const notification = this.pendingNotifications[id];
// //         NotificationManager.success(notification.message);
// //       });
// //
// //       // Limpiar las notificaciones pendientes
// //       this.pendingNotifications = {};
// //     }, 300);
// //   }
// //
// //   /**
// //    * Añade un producto al carrito
// //    * @param {string} productId - ID del producto
// //    */
// //   addToCart(productId) {
// //     const product = this.products.find(p => p.id === productId);
// //     if (!product) return;
// //
// //     const currentQuantity = this.getCartQuantity(productId);
// //
// //     // Verificar si se ha seleccionado alguna cantidad
// //     if (currentQuantity === 0) {
// //       NotificationManager.warning(`ELEGIR PRODUCTO`);
// //       return;
// //     }
// //
// //     // Verificar si hay stock suficiente
// //     if (product.stock === 0) {
// //       NotificationManager.warning(`STOCK AGOTADO`);
// //       return;
// //     }
// //
// //     // Si se intenta añadir más productos de los disponibles
// //     if (currentQuantity > product.stock) {
// //       NotificationManager.warning(`STOCK DEL PRODUCTO "${product.name}" INSUFICIENTE, ACTUALMENTE SOLO DISPONEMOS DE (${product.stock}) PRODUCTOS`);
// //
// //       // Ajustar la cantidad seleccionada al stock disponible
// //       this.cartItems[productId] = product.stock;
// //       this.updateProductCard(productId);
// //       return;
// //     }
// //
// //     // Añadir al carrito
// //     const message = `PRODUCTO "${product.name}" AÑADIDO (${currentQuantity}) CANTIDADES`;
// //     this.showNotification(productId, message);
// //
// //     // Actualizar stock del producto
// //     product.stock -= currentQuantity;
// //
// //     // Resetear cantidad seleccionada
// //     delete this.cartItems[productId];
// //
// //     // Actualizar visualización
// //     this.updateProductCard(productId);
// //   }
// //
// //   /**
// //    * Actualiza la visualización de una card de producto
// //    * @param {string} productId - ID del producto
// //    */
// //   updateProductCard(productId) {
// //     const product = this.products.find(p => p.id === productId);
// //     if (!product) return;
// //
// //     const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
// //     if (!card) return;
// //
// //     const cartQuantity = this.getCartQuantity(productId);
// //
// //     // Actualizar contador de cantidad
// //     const quantityElement = card.querySelector('.cart-quantity');
// //     if (quantityElement) {
// //       quantityElement.textContent = cartQuantity;
// //     }
// //
// //     // Actualizar botones de incremento/decremento
// //     const btnDecrement = card.querySelector('.btn-decrement');
// //     const btnIncrement = card.querySelector('.btn-increment');
// //
// //     if (btnDecrement) {
// //       btnDecrement.disabled = cartQuantity <= 0;
// //     }
// //
// //     if (btnIncrement) {
// //       btnIncrement.disabled = product.stock <= 0;
// //     }
// //
// //     // Actualizar visualización de stock
// //     const stockElement = card.querySelector('.product-stock');
// //     if (stockElement) {
// //       stockElement.textContent = `Stock: ${product.stock}`;
// //
// //       // Actualizar clase de estado de stock
// //       stockElement.className = 'product-stock';
// //       if (product.stock > 10) {
// //         stockElement.classList.add('alto');
// //       } else if (product.stock > 5) {
// //         stockElement.classList.add('medio');
// //       } else {
// //         stockElement.classList.add('bajo');
// //       }
// //     }
// //   }
// // }
// //
// // export {CardsProductService};
//
// import {ProductService} from "./productServices.js";
// import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
//
// /**
//  * Servicio para gestionar la visualización y funcionalidad de las cards de productos
//  */
// class CardsProductService {
//   constructor() {
//     this.products = [];
//     this.cartItems = {};
//     this.productsContainer = document.getElementById('products-container');
//     this.notificationTimeout = null; // Para controlar el tiempo entre notificaciones
//   }
//
//   /**
//    * Inicializa el servicio de cards de productos
//    */
//   init() {
//     this.loadProducts();
//     this.renderProducts();
//     // Actualizar la vista cuando cambia el tamaño de la ventana
//     window.addEventListener('resize', () => this.adjustLayout());
//   }
//
//   /**
//    * Carga los productos desde el servicio de productos
//    */
//   loadProducts() {
//     try {
//       this.products = ProductService.getAllProducts(true);
//     } catch (error) {
//       NotificationManager.error(`Error al cargar productos: ${error.message}`);
//     }
//   }
//
//   /**
//    * Renderiza los productos en el contenedor
//    */
//   renderProducts() {
//     if (!this.productsContainer) return;
//
//     this.productsContainer.innerHTML = '';
//
//     if (this.products.length === 0) {
//       this.productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
//       return;
//     }
//
//     this.products.forEach(product => {
//       const card = this.createProductCard(product);
//       this.productsContainer.appendChild(card);
//     });
//
//     this.adjustLayout();
//   }
//
//   /**
//    * Crea una card para un producto
//    * @param {Object} product - Producto a mostrar
//    * @returns {HTMLElement} - Elemento de la card
//    */
//   createProductCard(product) {
//     const card = document.createElement('div');
//     card.className = 'product-card';
//     card.dataset.productId = product.id;
//
//     // Determinar estado del stock
//     const stockStatus = product.stock > 10 ? 'alto' : product.stock > 5 ? 'medio' : 'bajo';
//
//     card.innerHTML = `
//       <div class="product-image">
//         <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
//       </div>
//       <div class="product-info">
//         <h3 class="product-name">${product.name}</h3>
//         <p class="product-description">${product.description || 'Sin descripción'}</p>
//         <div class="product-details">
//           <p class="product-price">$${product.pvp.toFixed(2)}</p>
//           <p class="product-stock ${stockStatus}">Stock: ${product.stock}</p>
//           ${product.category ? `<p class="product-category">${product.category.name}</p>` : ''}
//         </div>
//         <div class="product-cart-control">
//           <button class="btn-decrement" ${this.getCartQuantity(product.id) <= 0 ? 'disabled' : ''}>
//             <i class="fa-solid fa-minus"></i>
//           </button>
//           <span class="cart-quantity">${this.getCartQuantity(product.id) || 0}</span>
//           <button class="btn-increment" ${product.stock <= this.getCartQuantity(product.id) ? 'disabled' : ''}>
//             <i class="fa-solid fa-plus"></i>
//           </button>
//         </div>
//         <button class="btn-add-to-cart">
//           Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>
//         </button>
//       </div>
//     `;
//
//     // Añadir event listeners
//     const btnDecrement = card.querySelector('.btn-decrement');
//     const btnIncrement = card.querySelector('.btn-increment');
//     const btnAddToCart = card.querySelector('.btn-add-to-cart');
//
//     btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
//     btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
//     btnAddToCart.addEventListener('click', () => this.addToCart(product.id));
//
//     return card;
//   }
//
//   /**
//    * Ajusta el layout de las cards según el tamaño de la pantalla
//    */
//   adjustLayout() {
//     const cards = document.querySelectorAll('.product-card');
//     if (!cards.length) return;
//
//     // Ajustar el número de cards por fila según el ancho de la pantalla
//     const containerWidth = this.productsContainer.offsetWidth;
//     let cardsPerRow = 4; // Por defecto 4 cards en pantallas grandes
//
//     if (containerWidth < 1200) cardsPerRow = 4;
//     if (containerWidth < 992) cardsPerRow = 3;
//     if (containerWidth < 768) cardsPerRow = 2;
//     if (containerWidth < 576) cardsPerRow = 1;
//
//     cards.forEach(card => {
//       card.style.width = `calc(${100 / cardsPerRow}% - 20px)`;
//     });
//   }
//
//   /**
//    * Obtiene la cantidad de un producto en el carrito
//    * @param {string} productId - ID del producto
//    * @returns {number} - Cantidad en el carrito
//    */
//   getCartQuantity(productId) {
//     return this.cartItems[productId] || 0;
//   }
//
//   /**
//    * Incrementa la cantidad de un producto en el carrito
//    * @param {string} productId - ID del producto
//    */
//   incrementQuantity(productId) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     const currentQuantity = this.getCartQuantity(productId);
//     if (currentQuantity >= product.stock) {
//       NotificationManager.warning(`STOCK AGOTADO`);
//       return;
//     }
//
//     this.cartItems[productId] = currentQuantity + 1;
//     this.updateProductCard(productId);
//   }
//
//   /**
//    * Decrementa la cantidad de un producto en el carrito
//    * @param {string} productId - ID del producto
//    */
//   decrementQuantity(productId) {
//     const currentQuantity = this.getCartQuantity(productId);
//     if (currentQuantity <= 0) return;
//
//     this.cartItems[productId] = currentQuantity - 1;
//
//     // Se elimina la notificación al llegar a cero
//     if (this.cartItems[productId] === 0) {
//       delete this.cartItems[productId];
//     }
//
//     this.updateProductCard(productId);
//   }
//
//   /**
//    * Añade un producto al carrito
//    * @param {string} productId - ID del producto
//    */
//   addToCart(productId) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     const currentQuantity = this.getCartQuantity(productId);
//
//     // Si no hay cantidad seleccionada, mostrar notificación
//     if (currentQuantity === 0) {
//       NotificationManager.warning(`ELEGIR PRODUCTO`);
//       return;
//     }
//
//     // Verificar si hay suficiente stock
//     if (currentQuantity > product.stock) {
//       NotificationManager.warning(`STOCK DEL PRODUCTO "${product.name}" INSUFICIENTE, ACTUALMENTE SOLO DISPONEMOS DE (${product.stock}) PRODUCTOS`);
//       return;
//     }
//
//     // Clear any existing timeout to prevent notification overlap
//     if (this.notificationTimeout) {
//       clearTimeout(this.notificationTimeout);
//       this.notificationTimeout = null;
//     }
//
//     // Simular la adición al carrito y mostrar notificación
//     this.notificationTimeout = setTimeout(() => {
//       // Aquí iría la lógica para añadir al carrito (API call, localStorage, etc.)
//       NotificationManager.success(`PRODUCTO "${product.name}" AÑADIDO (${currentQuantity}) CANTIDADES`);
//
//       // Reducir el stock del producto
//       this.updateProductStock(productId, product.stock - currentQuantity);
//
//       // Resetear la cantidad seleccionada
//       delete this.cartItems[productId];
//       this.updateProductCard(productId);
//     }, 300); // Pequeño retraso para evitar notificaciones repetidas
//   }
//
//   /**
//    * Actualiza el stock de un producto
//    * @param {string} productId - ID del producto
//    * @param {number} newStock - Nuevo valor de stock
//    */
//   updateProductStock(productId, newStock) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     // Actualizar stock en el objeto producto
//     product.stock = newStock;
//
//     // Actualizar visualización de la card
//     this.updateProductCard(productId);
//
//     // Si el stock llega a cero, mostrar notificación
//     if (newStock === 0) {
//       NotificationManager.warning(`STOCK AGOTADO`);
//     }
//   }
//
//   /**
//    * Actualiza la visualización de una card de producto
//    * @param {string} productId - ID del producto
//    */
//   updateProductCard(productId) {
//     const product = this.products.find(p => p.id === productId);
//     if (!product) return;
//
//     const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
//     if (!card) return;
//
//     const cartQuantity = this.getCartQuantity(productId);
//
//     // Actualizar contador de cantidad
//     const quantityElement = card.querySelector('.cart-quantity');
//     if (quantityElement) {
//       quantityElement.textContent = cartQuantity;
//     }
//
//     // Actualizar botones de incremento/decremento
//     const btnDecrement = card.querySelector('.btn-decrement');
//     const btnIncrement = card.querySelector('.btn-increment');
//     const btnAddToCart = card.querySelector('.btn-add-to-cart');
//
//     if (btnDecrement) {
//       btnDecrement.disabled = cartQuantity <= 0;
//     }
//
//     if (btnIncrement) {
//       btnIncrement.disabled = product.stock <= 0 || cartQuantity >= product.stock;
//     }
//
//     // Mantener el botón de agregar siempre activo
//     if (btnAddToCart) {
//       btnAddToCart.disabled = false;
//       btnAddToCart.innerHTML = 'Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>';
//     }
//
//     // Actualizar visualización de stock
//     const stockElement = card.querySelector('.product-stock');
//     if (stockElement) {
//       stockElement.textContent = `Stock: ${product.stock}`;
//
//       // Actualizar clase de estado de stock
//       stockElement.className = 'product-stock';
//       if (product.stock > 10) {
//         stockElement.classList.add('alto');
//       } else if (product.stock > 5) {
//         stockElement.classList.add('medio');
//       } else {
//         stockElement.classList.add('bajo');
//       }
//     }
//   }
// }
//
// export {CardsProductService};

import {ProductService} from "./productServices.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Función de debounce para agrupar ejecuciones en un intervalo
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Servicio para gestionar la visualización y funcionalidad de las cards de productos
 */
class CardsProductService {
  constructor() {
    this.products = [];
    this.cartItems = {};       // Cantidad seleccionada actualmente (por incrementos y decrementos)
    this.confirmedCart = {};   // Cantidad confirmada (ya agregada al carrito)
    this.productsContainer = document.getElementById('products-container');
  }

  /**
   * Inicializa el servicio de cards de productos
   */
  init() {
    this.loadProducts();
    this.renderProducts();
    window.addEventListener('resize', () => this.adjustLayout());
  }

  /**
   * Carga los productos desde el servicio de productos
   */
  loadProducts() {
    try {
      this.products = ProductService.getAllProducts(true);
    } catch (error) {
      NotificationManager.error(`Error al cargar productos: ${error.message}`);
    }
  }

  /**
   * Renderiza los productos en el contenedor
   */
  renderProducts() {
    if (!this.productsContainer) return;
    this.productsContainer.innerHTML = '';

    if (this.products.length === 0) {
      this.productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
      return;
    }

    this.products.forEach(product => {
      const card = this.createProductCard(product);
      this.productsContainer.appendChild(card);
    });

    this.adjustLayout();
  }

  /**
   * Crea una card para un producto
   * @param {Object} product - Producto a mostrar
   * @returns {HTMLElement} - Elemento de la card
   */
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    // Determinar estado del stock (según el stock actual del producto)
    const stockStatus = product.stock > 10 ? 'alto' : product.stock > 5 ? 'medio' : 'bajo';

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.imgLink || '/api/placeholder/300/200'}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description || 'Sin descripción'}</p>
        <div class="product-details">
          <p class="product-price">$${product.pvp.toFixed(2)}</p>
          <p class="product-stock ${stockStatus}">Stock: ${product.stock}</p>
          ${product.category ? `<p class="product-category">${product.category.name}</p>` : ''}
        </div>
        <div class="product-cart-control">
          <button class="btn-decrement" ${this.getCartQuantity(product.id) <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="cart-quantity">${this.getCartQuantity(product.id) || 0}</span>
          <button class="btn-increment" ${product.stock <= this.getCartQuantity(product.id) ? 'disabled' : ''}>
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <button class="btn-add-to-cart">
          Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>
        </button>
      </div>
    `;

    // Añadir event listeners
    const btnDecrement = card.querySelector('.btn-decrement');
    const btnIncrement = card.querySelector('.btn-increment');
    const btnAddToCart = card.querySelector('.btn-add-to-cart');

    btnDecrement.addEventListener('click', () => this.decrementQuantity(product.id));
    btnIncrement.addEventListener('click', () => this.incrementQuantity(product.id));
    // Se usa debounce para agrupar múltiples clics en el botón de carrito
    btnAddToCart.addEventListener('click', debounce(() => this.addToCart(product.id), 500));

    return card;
  }

  /**
   * Ajusta el layout de las cards según el tamaño de la pantalla
   */
  adjustLayout() {
    const cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;
    const containerWidth = this.productsContainer.offsetWidth;
    let cardsPerRow = 4; // Por defecto 4 cards en pantallas grandes

    if (containerWidth < 1200) cardsPerRow = 4;
    if (containerWidth < 992) cardsPerRow = 3;
    if (containerWidth < 768) cardsPerRow = 2;
    if (containerWidth < 576) cardsPerRow = 1;

    cards.forEach(card => {
      card.style.width = `calc(${100 / cardsPerRow}% - 20px)`;
    });
  }

  /**
   * Obtiene la cantidad de un producto en el carrito (seleccionado pero no confirmado)
   * @param {string} productId - ID del producto
   * @returns {number} - Cantidad seleccionada
   */
  getCartQuantity(productId) {
    return this.cartItems[productId] || 0;
  }

  /**
   * Incrementa la cantidad seleccionada de un producto
   * @param {string} productId - ID del producto
   */
  incrementQuantity(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const currentQuantity = this.getCartQuantity(productId);
    // Permite incrementar mientras la cantidad seleccionada sea menor al stock actual
    if (currentQuantity >= product.stock) {
      NotificationManager.warning('Stock agotado');
      return;
    }
    this.cartItems[productId] = currentQuantity + 1;
    this.updateProductCard(productId);
  }

  /**
   * Decrementa la cantidad seleccionada de un producto
   * @param {string} productId - ID del producto
   */
  decrementQuantity(productId) {
    const currentQuantity = this.getCartQuantity(productId);
    if (currentQuantity <= 0) return;
    this.cartItems[productId] = currentQuantity - 1;
    if (this.cartItems[productId] === 0) {
      delete this.cartItems[productId];
    }
    this.updateProductCard(productId);
  }

  /**
   * Agrega la cantidad seleccionada al carrito (confirma la compra)
   * @param {string} productId - ID del producto
   */
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const selectedQuantity = this.getCartQuantity(productId);

    // Si no se ha seleccionado cantidad, se muestra "ELEGIR PRODUCTO"
    if (selectedQuantity === 0) {
      NotificationManager.warning('ELEGIR PRODUCTO');
      return;
    }

    // Verificar que la cantidad seleccionada no exceda el stock disponible
    if (selectedQuantity > product.stock) {
      NotificationManager.warning(`STOCK DEL PRODUCTO "${product.name}" INSUFICIENTE, ACTUALMENTE SOLO DISPONEMOS DE (${product.stock}) PRODUCTOS`);
      return;
    }

    // Acumular la cantidad confirmada (si se han agregado previamente, se suma)
    if (!this.confirmedCart[productId]) {
      this.confirmedCart[productId] = 0;
    }
    this.confirmedCart[productId] += selectedQuantity;

    // Reducir el stock del producto en base a la cantidad confirmada
    product.stock -= selectedQuantity;

    // Reiniciar la cantidad seleccionada para ese producto
    delete this.cartItems[productId];
    this.updateProductCard(productId);

    NotificationManager.success(`PRODUCTO "${product.name}" AÑADIDO (${this.confirmedCart[productId]}) CANTIDADES`);
  }

  /**
   * Actualiza la visualización de una card de producto
   * @param {string} productId - ID del producto
   */
  updateProductCard(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    const selectedQuantity = this.getCartQuantity(productId);
    // El stock restante es el stock actual del producto (ya se descontaron los confirmados)
    const stockRemaining = product.stock;

    // Actualizar contador de cantidad seleccionado
    const quantityElement = card.querySelector('.cart-quantity');
    if (quantityElement) {
      quantityElement.textContent = selectedQuantity;
    }

    // Actualizar botones de incremento/decremento
    const btnDecrement = card.querySelector('.btn-decrement');
    const btnIncrement = card.querySelector('.btn-increment');
    const btnAddToCart = card.querySelector('.btn-add-to-cart');

    if (btnDecrement) {
      btnDecrement.disabled = selectedQuantity <= 0;
    }

    if (btnIncrement) {
      btnIncrement.disabled = stockRemaining <= 0;
    }

    if (btnAddToCart) {
      btnAddToCart.disabled = false;
      btnAddToCart.innerHTML = 'Agregar Al Carrito <i class="fa-solid fa-cart-plus fa-lg" style="color: white"></i>';
    }

    // Actualizar visualización del stock
    const stockElement = card.querySelector('.product-stock');
    if (stockElement) {
      stockElement.textContent = `Stock: ${stockRemaining}`;
      stockElement.className = 'product-stock';
      if (stockRemaining > 50) {
        stockElement.classList.add('alto');
      } else if (stockRemaining > 20) {
        stockElement.classList.add('medio');
      } else {
        stockElement.classList.add('bajo');
      }
    }
  }
}

export {CardsProductService};
