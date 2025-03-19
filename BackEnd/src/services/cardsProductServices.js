import {ProductService} from "./productServices.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Función de debounce para agrupar ejecuciones en un intervalo
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
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
    this.CART_STORAGE_KEY = 'shopping_cart'; // Clave para localStorage del carrito
  }

  /**
   * Inicializa el servicio de cards de productos
   */
  init() {
    this.loadProducts();
    this.loadCartFromStorage(); // Cargar carrito guardado
    this.renderProducts();
    window.addEventListener('resize', () => this.adjustLayout());
  }

  /**
   * Carga los productos desde el servicio de productos (incluyendo los datos guardados en localStorage)
   */
  loadProducts() {
    try {
      this.products = ProductService.getAllProducts(true);
    } catch (error) {
      NotificationManager.error(`Error de conexión con los productos`);
      console.log("Error al cargar productos: ", error.message);
    }
  }

  /**
   * Carga el carrito desde localStorage
   */
  loadCartFromStorage() {
    const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (savedCart) {
      this.confirmedCart = JSON.parse(savedCart);
    }
  }

  /**
   * Guarda el carrito en localStorage
   */
  saveCartToStorage() {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.confirmedCart));
  }

  /**
   * Guarda los productos actualizados en el localStorage
   */
  updateLocalStorage() {
    localStorage.setItem(ProductService.STORAGE_KEY, JSON.stringify(this.products));
  }

  /**
   * Agrega la cantidad seleccionada al carrito (confirma la compra) y actualiza el stock en localStorage
   * @param {string} productId - ID del producto
   */
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const selectedQuantity = this.getCartQuantity(productId);

    // Si no se ha seleccionado cantidad, se muestra "Agregar producto"
    if (selectedQuantity === 0) {
      NotificationManager.warning('Agregar producto');
      return;
    }

    // Verificar que la cantidad seleccionada no exceda el stock disponible
    if (selectedQuantity > product.stock) {
      NotificationManager.warning(`Producto "${product.name}" con stock insuficiente, disponemos (${product.stock}) productos`);
      return;
    }

    // Acumular la cantidad confirmada (si se han agregado previamente, se suma)
    if (!this.confirmedCart[productId]) {
      this.confirmedCart[productId] = 0;
    }
    this.confirmedCart[productId] += selectedQuantity;

    // Reducir el stock del producto en base a la cantidad confirmada
    product.stock -= selectedQuantity;

    // Guardar en localStorage tanto el stock como el carrito
    this.updateLocalStorage();
    this.saveCartToStorage(); // Añadimos esta línea para guardar el carrito

    // Reiniciar la cantidad seleccionada para ese producto
    delete this.cartItems[productId];
    this.updateProductCard(productId);

    NotificationManager.success(`Producto "${product.name}" agregado (${selectedQuantity}) veces al carrito`);
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
         ${product.category ? `<p class="product-category">${product.category.name.toUpperCase()}</p>` : ''}
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
   * Agrega la cantidad seleccionada al carrito (confirma la compra) y actualiza el stock en localStorage
   * @param {string} productId - ID del producto
   */
  // addToCart(productId) {
  //   const product = this.products.find(p => p.id === productId);
  //   if (!product) return;
  //
  //   const selectedQuantity = this.getCartQuantity(productId);
  //
  //   // Si no se ha seleccionado cantidad, se muestra "Agregar producto"
  //   if (selectedQuantity === 0) {
  //     NotificationManager.warning('Agregar producto');
  //     return;
  //   }
  //
  //   // Verificar que la cantidad seleccionada no exceda el stock disponible
  //   if (selectedQuantity > product.stock) {
  //     NotificationManager.warning(`Producto "${product.name}" con stock insuficiente, disponemos (${product.stock}) productos`);
  //     return;
  //   }
  //
  //   // Acumular la cantidad confirmada (si se han agregado previamente, se suma)
  //   if (!this.confirmedCart[productId]) {
  //     this.confirmedCart[productId] = 0;
  //   }
  //   this.confirmedCart[productId] += selectedQuantity;
  //
  //   // Reducir el stock del producto en base a la cantidad confirmada
  //   product.stock -= selectedQuantity;
  //
  //   // Actualizar el localStorage para que el stock modificado persista
  //   this.updateLocalStorage();
  //
  //
  //
  //   // Reiniciar la cantidad seleccionada para ese producto
  //   delete this.cartItems[productId];
  //   this.updateProductCard(productId);
  //
  //
  //
  //   NotificationManager.success(`Producto "${product.name}" agregado (${this.confirmedCart[productId]}) veces`);
  // }

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