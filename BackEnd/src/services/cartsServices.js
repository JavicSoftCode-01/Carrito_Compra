import {ProductService} from "./productServices.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
import {AuthManager} from "./authServices.js";
import {CategoryService} from "./categoryServices.js";
import {LocalStorageManager} from "../database/localStorage.js";

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
    return `FAC-${year}${month}${day}-${random}`;
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
    const invoiceNumber = this.invoiceNumber;

    // Se renderiza la factura
    this.cartSummary.innerHTML = `
    <div class="invoice-header">
      <h2 class="invoice-title">Compra</h2>
      <div class="invoice-details">
        <div class="invoice-client-info">
          <p><strong>Cliente:</strong> ${currentUser && currentUser.full_name ? currentUser.full_name : 'Cliente'}</p>
          <p class="invoice-number">${invoiceNumber}</p>
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

    <div class="button-container">
      <button class="purchase-btn">
        Realizar compra <i class="fa-brands fa-square-whatsapp fa-lg"></i>
      </button>
      <button class="clear-cart-btn">
        <i class="fa-solid fa-trash-can fa-lg"></i> Vaciar carrito  
    </div>
  `;

    // Estilos para los botones (se puede ajustar según necesidad)
    const styles = `
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 15px;
    }
    .purchase-btn {
      background-color: #25D366;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 15px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color 0.3s;
    }
    .purchase-btn:hover {
      background-color: #128C7E;
    }
  `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Datos de la factura a utilizar en los flujos posteriores
    const invoiceData = {
      clientName: (currentUser && currentUser.full_name) ? currentUser.full_name : 'Cliente',
      invoiceNumber: invoiceNumber,
      date: formattedDate,
      time: formattedTime,
      items: items,
      subtotal: subtotal,
      ivaPercentage: this.ivaPercentage,
      ivaAmount: ivaAmount,
      total: total
    };

    // --- NUEVO: FUNCIONALIDAD CON MODALES ---

    // Variable para guardar el temporizador global
    let purchaseTimer = null;

    // Función para mostrar el modal de información de compra
    const showPurchaseInfoModal = () => {
      const modal = document.createElement('div');
      modal.id = 'purchase-info-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '9999';

      // Contenido del modal con 3 botones centrados horizontalmente
      modal.innerHTML = `
      <div style="background-color: white; padding: 20px; border-radius: 8px; width: 400px; text-align: center;">
        <h3 style="color: #2196F3;">Información de Compra</h3>
        <p>Antes de proceder, por favor lee la información y elige una opción:</p>
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
          <button id="btn-download" style="background-color: #4CAF50; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Descargar PDF</button>
          <button id="btn-chat" style="background-color: #25D366; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Chat WhatsApp</button>
          <button id="btn-cancel" style="background-color: #757575; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Cancelar</button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);

      // Evento para el botón de cancelar: cierra el modal sin hacer nada
      document.getElementById('btn-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
      });

      // Evento para el botón de chat: abre WhatsApp con mensaje predeterminado
      document.getElementById('btn-chat').addEventListener('click', () => {
        document.body.removeChild(modal);
        const message = "Hola, deseo obtener ayuda con mi compra.";
        shareToWhatsApp(message, '+593995336523');
      });

      // Evento para el botón de descargar PDF: inicia el flujo de compra
      document.getElementById('btn-download').addEventListener('click', () => {
        document.body.removeChild(modal);
        NotificationManager.info("Compra en proceso. Tiene 2 minutos para cancelar la orden de compra.");

        handleDownloadFlow(invoiceData);
      });
    };

    // Función que maneja el flujo cuando se pulsa “Descargar PDF”
    const handleDownloadFlow = (invoiceData) => {
      // Generar y descargar el PDF (se usa la función ya implementada en el código original)
      generateInvoicePDF(invoiceData)
        .then(({fileName, pdfBlob, pdfBase64}) => {
          // Descargar PDF
          return downloadPDF(fileName, pdfBlob)
            .then(success => {
              if (!success) {
                fallbackDownload(fileName, pdfBase64);
              }
              // Después de descargar, mostrar modal de confirmación
              showConfirmationModal(fileName, invoiceData);
            })
            .catch(() => {
              fallbackDownload(fileName, pdfBase64);
              showConfirmationModal(fileName, invoiceData);
            });
        })
        .catch(error => {
          console.error('Error al generar o descargar el PDF:', error);
          NotificationManager.error('Error al generar o descargar el PDF. Por favor, intenta de nuevo.');
        });
    };

    // Modal de confirmación: "Seguir" o "Cancelar" la compra
    // Modal de confirmación: "Seguir" o "Cancelar" la compra
    const showConfirmationModal = (fileName, invoiceData) => {
      const modal = document.createElement('div');
      modal.id = 'confirmation-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '9999';

      modal.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 8px; width: 350px; text-align: center;">
      <p>Si deseas cancelar la compra, haz clic en "Cancelar".<br>Si deseas continuar, haz clic en "Seguir".</p>
      <div style="display: flex; justify-content: space-around; margin-top: 20px;">
        <button id="confirm-seguir" style="background-color: #4CAF50; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Seguir</button>
        <button id="confirm-cancelar" style="background-color: #F44336; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Cancelar</button>
      </div>
    </div>
  `;
      document.body.appendChild(modal);

      // Si el usuario decide seguir con la compra:
      document.getElementById('confirm-seguir').addEventListener('click', () => {
        document.body.removeChild(modal);
        // Inicia temporizador de 1 minuto para actualizar stock y limpiar el carrito
        purchaseTimer = setTimeout(() => {
          // Actualizar el stock en localStorage o en la lógica de negocio según corresponda
          cartItemIds.forEach(productId => {
            // Ejemplo: localStorage.removeItem(`stock_${productId}_${this.cartItems[productId]}`);
          });
          // Limpiar el carrito y actualizar tanto la factura como las tarjetas de items
          this.cartItems = {};
          LocalStorageManager.removeData(this.CART_STORAGE_KEY)
          this.renderCartSummary();
          this.renderCartItems();
          NotificationManager.success("Compra finalizada.");
        }, 5000); // 60000 milisegundos = 1 minuto
      });

      // Si el usuario decide cancelar la compra:
      document.getElementById('confirm-cancelar').addEventListener('click', () => {
        document.body.removeChild(modal);
        // Cancelar el temporizador si está en curso
        if (purchaseTimer) {
          clearTimeout(purchaseTimer);
          purchaseTimer = null;
        }
        // Mostrar modal informativo de cancelación
        showCancellationModal();
      });
    };


    // Modal para informar la cancelación de la compra
    const showCancellationModal = () => {
      const modal = document.createElement('div');
      modal.id = 'cancelation-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.display = 'flex';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '9999';

      modal.innerHTML = `
      <div style="background-color: white; padding: 20px; border-radius: 8px; width: 350px; text-align: center;">
        <h3 style="color: #F44336;">Compra Cancelada</h3>
        <p>Has cancelado la compra. ¿Deseas informar el motivo?</p>
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
          <button id="cancel-whatsapp" style="background-color: #25D366; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">WhatsApp</button>
          <button id="cancel-close" style="background-color: #757575; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer;">Cerrar</button>
        </div>
      </div>
    `;
      document.body.appendChild(modal);

      document.getElementById('cancel-whatsapp').addEventListener('click', () => {
        document.body.removeChild(modal);
        const message = "He cancelado mi compra. Motivo: [escribe tu motivo aquí]";
        shareToWhatsApp(message, '+593995336523');
      });
      document.getElementById('cancel-close').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    };

    // --- FIN DE NUEVA FUNCIONALIDAD CON MODALES ---

    // Asignar el evento al botón “Realizar compra” para que abra el modal de información
    const purchaseBtn = this.cartSummary.querySelector('.purchase-btn');
    if (purchaseBtn) {
      // Para evitar duplicados, se reemplaza el nodo y se agrega el listener
      purchaseBtn.replaceWith(purchaseBtn.cloneNode(true));
      this.cartSummary.querySelector('.purchase-btn').addEventListener('click', () => {
        showPurchaseInfoModal();
      });
    }

    // --- Funciones ya existentes: generateInvoicePDF, downloadPDF, fallbackDownload, shareToWhatsApp, showNotification ---
    // Estas funciones se mantienen (o se adaptan levemente) según el código original.

    // Función para generar el PDF de la factura con mejor manejo de errores
    function generateInvoicePDF(invoiceData) {
      return new Promise((resolve, reject) => {
        try {
          // Verificar si jsPDF ya está disponible
          if (typeof window.jspdf === 'undefined') {
            console.log("cargando jsPDF...");
            // Cargar jsPDF dinámicamente
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.async = true;

            script.onload = () => {
              console.log("jsPDF cargado, cargando autoTable...");
              // Una vez cargado jsPDF, cargar autoTable
              const autoTableScript = document.createElement('script');
              autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
              autoTableScript.async = true;

              autoTableScript.onload = () => {
                console.log("autoTable cargado, generando PDF...");
                // Una vez cargados ambos, crear el PDF
                createPDF(invoiceData, resolve, reject);
              };

              autoTableScript.onerror = (e) => {
                console.error("Error cargando autoTable:", e);
                reject(new Error('No se pudo cargar la biblioteca jspdf-autotable'));
              };

              document.head.appendChild(autoTableScript);
            };

            script.onerror = (e) => {
              console.error("Error cargando jsPDF:", e);
              reject(new Error('No se pudo cargar la biblioteca jsPDF'));
            };

            document.head.appendChild(script);
          } else {
            console.log("jsPDF ya disponible, generando PDF directamente");
            // Si jsPDF ya está disponible, crear el PDF directamente
            createPDF(invoiceData, resolve, reject);
          }
        } catch (error) {
          console.error("Error general en generateInvoicePDF:", error);
          reject(error);
        }
      });
    }


    // Función simplificada para descargar el PDF
    function downloadPDF(fileName, pdfBlob) {
      return new Promise((resolve, reject) => {
        try {
          console.log("Iniciando descarga del PDF...");

          // Crear URL del blob
          const blobUrl = URL.createObjectURL(pdfBlob);
          console.log("URL del blob creada:", blobUrl);

          // Crear elemento para descarga
          const downloadLink = document.createElement('a');
          downloadLink.href = blobUrl;
          downloadLink.download = fileName;
          downloadLink.target = '_blank'; // Abrir en nueva pestaña (ayuda en algunos móviles)

          console.log("Elemento de descarga creado, añadiendo al DOM...");
          document.body.appendChild(downloadLink);

          console.log("Haciendo clic en el enlace de descarga...");
          downloadLink.click();

          // Limpiar recursos después de un tiempo
          setTimeout(() => {
            if (document.body.contains(downloadLink)) {
              document.body.removeChild(downloadLink);
            }
            URL.revokeObjectURL(blobUrl);
            console.log("Recursos de descarga liberados");
            resolve(true);
          }, 1000);

        } catch (error) {
          console.error("Error en downloadPDF:", error);
          reject(error);
        }
      });
    }


    // Solución alternativa para navegadores que no soportan a.download
    function fallbackDownload(fileName, pdfBase64) {
      try {
        console.log("Usando método alternativo de descarga...");
        // Abrir en nueva ventana
        const newWindow = window.open();
        if (!newWindow) {
          alert("Por favor, permite las ventanas emergentes para descargar el PDF");
          return false;
        }

        newWindow.document.write(`
      <html>
        <head>
          <title>Descargando ${fileName}</title>
        </head>
        <body>
          <p>El PDF se está descargando. Si no comienza automáticamente, haz clic derecho en la imagen y selecciona "Guardar como..."</p>
          <iframe src="${pdfBase64}" style="width:100%; height:90vh;"></iframe>
        </body>
      </html>
    `);

        return true;
      } catch (error) {
        console.error("Error en fallbackDownload:", error);
        return false;
      }
    }


    // Función para compartir a WhatsApp
    function shareToWhatsApp(message, phoneNumber) {
      // Formato de número para WhatsApp
      const formattedNumber = phoneNumber.replace(/\D/g, '');

      // Crear mensaje para WhatsApp
      const encodedMessage = encodeURIComponent(message);

      // Intentar abrir WhatsApp
      try {
        window.open(`whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`, '_blank');

        // Fallback para navegadores web después de un pequeño retraso
        setTimeout(() => {
          window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
        }, 2000);
      } catch (error) {
        console.error("Error al abrir WhatsApp:", error);
        window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
      }
    }




    // Función separada para crear el PDF
    function createPDF(invoiceData, resolve, reject) {
      try {
        // Verificar que jsPDF esté disponible
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
          throw new Error('jsPDF no está disponible en el contexto global');
        }

        const {jsPDF} = window.jspdf;
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'pt',
          format: 'letter' // o 'a4' según prefieras
        });

        // Márgenes y posiciones base
        const pageWidth = doc.internal.pageSize.getWidth();
        let cursorY = 40;  // Posición vertical inicial
        const marginX = 40;

        // ==========================
        // ENCABEZADO PRINCIPAL
        // ==========================

        // Dibujar un recuadro “tipo tarjeta” en la parte superior (opcional)
        // Cambia los valores de color fill si quieres otro tono
        // Relleno gris claro
        doc.setFillColor(245, 245, 245);
// Dibuja el rectángulo sin esquinas redondeadas
        doc.rect(
          marginX - 10,
          cursorY - 15,
          pageWidth - (marginX - 10) * 2,
          80,
          'F'
        );


        // Título principal: "Compra"
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold'); doc.text("Compra", pageWidth / 2, cursorY, {align: 'center'}); doc.setFont(undefined, 'normal');

        // Subir un poco cursorY para acomodar textos debajo
        cursorY += 15;

        // Información del cliente a la izquierda
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${invoiceData.clientName}`, marginX, cursorY);

        // Información de factura a la derecha
        // Alineamos el texto hacia la derecha para que se vea “FAC-xxxx” en el lado opuesto
        doc.text(`${invoiceData.invoiceNumber}`, pageWidth - marginX, cursorY, {align: 'right'});
        cursorY += 15;

        // Fecha y hora (podrías ponerlos en la misma línea o en líneas separadas)
        doc.text(`Fecha: ${invoiceData.date}`, marginX, cursorY);
        cursorY += 12;
        doc.text(`Hora: ${invoiceData.time}`, marginX, cursorY);
        cursorY += 30; // Dejamos un espacio antes del detalle

        // ==========================
        // DETALLE DE COMPRA
        // ==========================
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold'); doc.text("Detalle de Compra", marginX, cursorY); doc.setFont(undefined, 'normal');
        cursorY += 10;

        // Preparamos columnas para la tabla
        const tableColumn = ["Producto", "Cant.", "Precio", "Total"];
        const tableRows = [];

        invoiceData.items.forEach(item => {
          const itemData = [
            item.name,
            item.quantity,
            `$${item.price.toFixed(2)}`,
            `$${item.total.toFixed(2)}`
          ];
          tableRows.push(itemData);
        });

        // Renderizamos la tabla con autoTable
        // Ajustamos startY para que aparezca debajo del título "Detalle de Compra"
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: cursorY,
          theme: 'striped', // prueba también 'grid' o 'plain'
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [240, 240, 240], // color de fondo del encabezado
            textColor: [0, 0, 0],
            lineWidth: 0.5,
          }
        });

        // Obtenemos la posición final de la tabla para imprimir los totales debajo
        let finalY = doc.lastAutoTable.finalY + 20;

        // ==========================
        // SECCIÓN DE TOTALES
        // ==========================
        doc.setFontSize(12);
        // Subtotal
        doc.text(`Subtotal:`, pageWidth - 200, finalY);
        doc.text(`$${invoiceData.subtotal.toFixed(2)}`, pageWidth - 40, finalY, {align: 'right'});

        // IVA
        finalY += 30;
        doc.text(`IVA (${invoiceData.ivaPercentage}%):`, pageWidth - 200, finalY);
        doc.text(`$${invoiceData.ivaAmount.toFixed(2)}`, pageWidth - 40, finalY, {align: 'right'});

        // Total (en verde y un poco más grande)
        finalY += 30;
        doc.setFontSize(14);
        doc.text(`Total:`, pageWidth - 200, finalY);
        doc.setTextColor(0, 128, 0); // Color verde
        doc.text(`$${invoiceData.total.toFixed(2)}`, pageWidth - 40, finalY, {align: 'right'});
        // Restablecemos color a negro
        doc.setTextColor(0, 0, 0);

        // ==========================
        // CREACIÓN DEL BLOB Y RESOLVER
        // ==========================
        const timestamp = new Date().getTime();
        const cleanClientName = invoiceData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
        // Asegúrate de que invoiceData.invoiceNumber esté disponible como variable
        const fileName = `Factura_${cleanClientName}_${invoiceData.invoiceNumber}.pdf`;

        const pdfBlob = doc.output('blob');

        resolve({
          fileName,
          pdfBlob,
          pdfBase64: doc.output('datauristring')
        });

      } catch (error) {
        reject(error);
      }
    }

    // function createPDF(invoiceData, resolve, reject) {
    //   try {
    //     console.log("Iniciando creación del PDF...");
    //
    //     // Verificar que jsPDF esté disponible
    //     if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    //       throw new Error('jsPDF no está disponible en el contexto global');
    //     }
    //
    //     const {jsPDF} = window.jspdf;
    //     const doc = new jsPDF();
    //
    //     console.log("Creando documento PDF...");
    //
    //     // Encabezado del documento
    //     doc.setFontSize(22);
    //     doc.text("Compra", 105, 20, {align: 'center'});
    //
    //     // Información del cliente y factura
    //     doc.setFontSize(12);
    //     doc.text(`Cliente: ${invoiceData.clientName}`, 20, 35);
    //     doc.text(`${invoiceData.invoiceNumber}`, 20, 42);
    //     doc.text(`Fecha: ${invoiceData.date}`, 20, 49);
    //     doc.text(`Hora: ${invoiceData.time}`, 20, 56);
    //
    //     // Título de detalle de compra
    //     doc.setFontSize(16);
    //     doc.text("Detalle de Compra", 20, 70);
    //
    //     // Tabla de productos
    //     const tableColumn = ["Producto", "Cant.", "Precio", "Total"];
    //     const tableRows = [];
    //
    //     invoiceData.items.forEach(item => {
    //       const itemData = [
    //         item.name,
    //         item.quantity,
    //         `$${item.price.toFixed(2)}`,
    //         `$${item.total.toFixed(2)}`
    //       ];
    //       tableRows.push(itemData);
    //     });
    //
    //     // Verificar que autoTable esté disponible
    //     if (typeof doc.autoTable !== 'function') {
    //       throw new Error('autoTable no está disponible en el objeto jsPDF');
    //     }
    //
    //     doc.autoTable({
    //       head: [tableColumn],
    //       body: tableRows,
    //       startY: 75,
    //       theme: 'striped',
    //       styles: {
    //         fontSize: 10,
    //         cellPadding: 3,
    //       },
    //     });
    //
    //     // Información de totales
    //     const finalY = doc.lastAutoTable.finalY + 10;
    //     doc.text(`Subtotal:`, 130, finalY);
    //     doc.text(`$${invoiceData.subtotal.toFixed(2)}`, 170, finalY, {align: 'right'});
    //     doc.text(`IVA (${invoiceData.ivaPercentage}%):`, 130, finalY + 7);
    //     doc.text(`$${invoiceData.ivaAmount.toFixed(2)}`, 170, finalY + 7, {align: 'right'});
    //     doc.setFontSize(14);
    //     doc.text(`Total:`, 130, finalY + 15);
    //     doc.setTextColor(0, 128, 0); // Color verde para el total
    //     doc.text(`$${invoiceData.total.toFixed(2)}`, 170, finalY + 15, {align: 'right'});
    //     doc.setTextColor(0, 0, 0); // Restablecer color
    //
    //     // Nombre del archivo limpio para evitar problemas
    //     const timestamp = new Date().getTime();
    //     const cleanClientName = invoiceData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
    //     const fileName = `Factura_${cleanClientName}_${invoiceNumber}.pdf`;
    //
    //     console.log("PDF generado, creando blob...");
    //
    //     // Crear blob del PDF y resolver la promesa
    //     try {
    //       const pdfBlob = doc.output('blob');
    //       console.log("Blob creado correctamente");
    //       resolve({
    //         fileName,
    //         pdfBlob,
    //         pdfBase64: doc.output('datauristring')
    //       });
    //     } catch (e) {
    //       console.error("Error al crear blob:", e);
    //       reject(e);
    //     }
    //
    //   } catch (error) {
    //     console.error("Error en createPDF:", error);
    //     reject(error);
    //   }
    // }


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
      // Actualizar la cantidad a cero para reflejar en el input
      this.cartItems[productId] = 0;
      this.saveCartToStorage();

      // Notificar al usuario
      const product = this.products.find(p => p.id === productId);
      if (product) {
        NotificationManager.info(`Producto "${product.name}" no tiene cantidad elegida, puede eliminarlo.`);
      }

      // Actualizar la interfaz para que se muestre el 0
      this.renderCartItems();
      this.renderCartSummary();

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
    //if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
    //  return;
    //}

    // Devolver el stock de cada producto
    Object.keys(this.cartItems).forEach(productId => {
      const quantity = this.cartItems[productId];
      this.updateProductStock(productId, quantity);
    });

    // Vaciar el carrito
    this.cartItems = {};
    this.saveCartToStorage();

    // Notificar al usuario
    NotificationManager.info('Sin productos en el Carrito');

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