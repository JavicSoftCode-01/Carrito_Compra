// BackEnd/src/admin/AdminPanel.js

import { CategoryService } from '../services/categoryServices.js';
import { ProductService } from '../services/productServices.js';
import { SupplierService } from '../services/supplierServices.js';
// Se asume que LocalStorageManager se encuentra implementado en el proyecto
import { LocalStorageManager } from '../database/localStorage.js';
import { DynamicModal } from '../../../FrontEnd/public/assets/scripts/utils/dinamicModal.js';
import { DynamicTable } from '../../../FrontEnd/public/assets/scripts/utils/dinamicTable.js';
import { NotificationManager } from '../../../FrontEnd/public/assets/scripts/utils/showNotifications.js';

// La librería Chart.js se carga desde el HTML

class AdminPanel {
  constructor() {
    // Instanciamos los gestores de modales y tablas
    this.modalManager = new DynamicModal();
    this.tableManager = new DynamicTable(this.modalManager);
    // Para almacenar el tipo de tabla actual ('product', 'category' o 'supplier')
    this.currentTableType = null;
    // Callback para reabrir el modal de tabla luego de cerrar el modal de formulario
    this.lastTableModalCallback = null;
    // Variables para guardar las instancias de los gráficos
    this.chartBar = null;
    this.chartLine = null;
    this.init();
  }

  /**
   * Inicializa el panel: asocia los eventos y carga widgets y gráficos.
   */
  init() {
    this.bindUIActions();
    this.loadWidgets();
    this.initCharts();
  }

  /**
   * Asocia los eventos de la interfaz.
   */
  bindUIActions() {
    // Botón de Cerrar Sesión
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
      });
    }

    // Botón para Agregar Producto
    const btnOpenProductModal = document.getElementById("btn-open-product-modal");
    if (btnOpenProductModal) {
      btnOpenProductModal.addEventListener("click", () => {
        const formHTML = this.modalManager.createProductForm();
        this.modalManager.showFormModal("Agregar Producto", formHTML);
        this.attachCancelListener();
        const productForm = document.getElementById("product-form");
        if (productForm) {
          productForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleProductFormSubmit(false);
          }, { once: true });
        }
      });
    }

    // Botón para Ver Productos
    const btnShowProducts = document.getElementById("btn-show-products");
    if (btnShowProducts) {
      btnShowProducts.addEventListener("click", () => {
        const products = ProductService.getAllProducts();
        const categories = CategoryService.getAllCategories();
        const suppliers = SupplierService.getAllSuppliers();
        const tableHTML = this.tableManager.generateProductTable(
          products,
          categories,
          suppliers
        );
        this.currentTableType = 'product';
        this.lastTableModalCallback = () => {
          const productsNew = ProductService.getAllProducts();
          const categoriesNew = CategoryService.getAllCategories();
          const suppliersNew = SupplierService.getAllSuppliers();
          const newTableHTML = this.tableManager.generateProductTable(
            productsNew,
            categoriesNew,
            suppliersNew
          );
          if (productsNew.length > 0) {
            this.modalManager.showTableModal("Listado de Productos", newTableHTML);
            this.configureTableButtons();
          } else {
            this.modalManager.closeTableModal();
          }
        };
        this.modalManager.showTableModal("Listado de Productos", tableHTML);
        this.configureTableButtons();
      });
    }

    // Botón para Agregar Categoría
    const btnOpenCategoryModal = document.getElementById("btn-open-category-modal");
    if (btnOpenCategoryModal) {
      btnOpenCategoryModal.addEventListener("click", () => {
        const formHTML = this.modalManager.createCategoryForm();
        this.modalManager.showFormModal("Agregar Categoría", formHTML);
        this.attachCancelListener();
        const categoryForm = document.getElementById("category-form");
        if (categoryForm) {
          categoryForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleCategoryFormSubmit(false);
          }, { once: true });
        }
      });
    }

    // Botón para Ver Categorías
    const btnShowCategories = document.getElementById("btn-show-categories");
    if (btnShowCategories) {
      btnShowCategories.addEventListener("click", () => {
        const categories = CategoryService.getAllCategories();
        const tableHTML = this.tableManager.generateCategoryTable(categories);
        this.currentTableType = 'category';
        this.lastTableModalCallback = () => {
          const categoriesNew = CategoryService.getAllCategories();
          const newTableHTML = this.tableManager.generateCategoryTable(categoriesNew);
          if (categoriesNew.length > 0) {
            this.modalManager.showTableModal("Listado de Categorías", newTableHTML);
            this.configureTableButtons();
          } else {
            this.modalManager.closeTableModal();
          }
        };
        this.modalManager.showTableModal("Listado de Categorías", tableHTML);
        this.configureTableButtons();
      });
    }

    // Botón para Agregar Proveedor
    const btnOpenSupplierModal = document.getElementById("btn-open-supplier-modal");
    if (btnOpenSupplierModal) {
      btnOpenSupplierModal.addEventListener("click", () => {
        const formHTML = this.modalManager.createSupplierForm();
        this.modalManager.showFormModal("Agregar Proveedor", formHTML);
        this.attachCancelListener();
        const supplierForm = document.getElementById("supplier-form");
        if (supplierForm) {
          supplierForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSupplierFormSubmit(false);
          }, { once: true });
        }
      });
    }

    // Botón para Ver Proveedores
    const btnShowSuppliers = document.getElementById("btn-show-suppliers");
    if (btnShowSuppliers) {
      btnShowSuppliers.addEventListener("click", () => {
        const suppliers = SupplierService.getAllSuppliers();
        const tableHTML = this.tableManager.generateSupplierTable(suppliers);
        this.currentTableType = 'supplier';
        this.lastTableModalCallback = () => {
          const suppliersNew = SupplierService.getAllSuppliers();
          const newTableHTML = this.tableManager.generateSupplierTable(suppliersNew);
          if (suppliersNew.length > 0) {
            this.modalManager.showTableModal("Listado de Proveedores", newTableHTML);
            this.configureTableButtons();
          } else {
            this.modalManager.closeTableModal();
          }
        };
        this.modalManager.showTableModal("Listado de Proveedores", tableHTML);
        this.configureTableButtons();
      });
    }
  }

  /**
   * Asigna listener al botón de cancelar del formulario para cerrar el modal y volver a la tabla (si aplica).
   */
  attachCancelListener() {
    const cancelBtn = document.getElementById("btn-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.modalManager.closeFormModal();
        if (this.lastTableModalCallback) {
          this.lastTableModalCallback();
        }
      }, { once: true });
    }
  }

  /**
   * Configura los botones de editar y eliminar de la tabla usando delegación de eventos.
   */
  configureTableButtons() {
    // Asignar listeners a los botones de editar
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        this.modalManager.closeTableModal();
        if (this.currentTableType === 'category') {
          this.handleEditCategory(id);
        } else if (this.currentTableType === 'supplier') {
          this.handleEditSupplier(id);
        } else if (this.currentTableType === 'product') {
          this.handleEditProduct(id);
        }
      }, { once: true });
    });

    // Delegación para el botón de eliminar en el contenedor de la tabla
    const tableContainer = document.getElementById('table-container');
    if (tableContainer) {
      tableContainer.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.btn-delete');
        if (deleteButton) {
          const id = deleteButton.getAttribute('data-id');
          this.modalManager.closeTableModal();
          // Llamar directamente al método de eliminación según el tipo
          if (this.currentTableType === 'category') {
            this.handleDeleteCategory(id);
          } else if (this.currentTableType === 'supplier') {
            this.handleDeleteSupplier(id);
          } else if (this.currentTableType === 'product') {
            this.handleDeleteProduct(id);
          }
        }
      });
    }
  }

  /**
   * Ejecuta el callback para reabrir la tabla (previa edición o eliminación) si existe.
   */
  reopenTableModal() {
    if (this.lastTableModalCallback) {
      this.lastTableModalCallback();
      this.lastTableModalCallback = null;
    }
  }

  /**
   * Actualiza los widgets con datos actuales.
   */
  //loadWidgets() {
  //  const products = ProductService.getAllProducts();
  //  const categories = CategoryService.getAllCategories();
  //  const suppliers = SupplierService.getAllSuppliers();
//
  //  const productsCountElement = document.getElementById('widget-total-productos');
  //  const categoriesCountElement = document.getElementById('widget-total-categorias');
  //  const suppliersCountElement = document.getElementById('widget-total-proveedores');
  //  const inventoryValueElement = document.getElementById('widget-total-capital');
  //  const capitalInvertidoElement = document.getElementById('widget-capital-invertido');
  //  const productosVendidosElement = document.getElementById('widget-productos-vendidos');
  //  const gananciaTotalElement = document.getElementById('widget-ganancia-total');
//
  //  if (productsCountElement) productsCountElement.textContent = products.length;
  //  if (categoriesCountElement) categoriesCountElement.textContent = categories.length;
  //  if (suppliersCountElement) suppliersCountElement.textContent = suppliers.length;
//
  //  const inventoryValue = products.reduce((total, product) => {
  //    return total + (parseFloat(product.price) * parseInt(product.stock));
  //  }, 0);
  //  if (inventoryValueElement) {
  //    inventoryValueElement.textContent = `${inventoryValue.toFixed(2)}`;
  //  }
//
  //  const capitalInvertido = products.reduce((total, product) => {
  //    return total + (parseFloat(product.price) * parseInt(product.quantity));
  //  }, 0);
  //  if (capitalInvertidoElement) {
  //    capitalInvertidoElement.textContent = `${capitalInvertido.toFixed(2)}`;
  //  }
//
  //  const productosVendidos = products.reduce((sum, product) => {
  //    return sum + (parseInt(product.quantity) - parseInt(product.stock));
  //  }, 0);
  //  if (productosVendidosElement) {
  //    productosVendidosElement.textContent = productosVendidos;
  //  }
//
  //  const gananciaTotal = products.reduce((sum, product) => {
  //    return sum + ((parseInt(product.quantity) - parseInt(product.stock)) * parseFloat(product.pvp));
  //  }, 0);
  //  if (gananciaTotalElement) {
  //    gananciaTotalElement.textContent = `${gananciaTotal.toFixed(2)}`;
  //  }
  //}

  loadWidgets() {
    const products = ProductService.getAllProducts();
    const categories = CategoryService.getAllCategories();
    const suppliers = SupplierService.getAllSuppliers();
  
    const productsCountElement = document.getElementById('widget-total-productos');
    const categoriesCountElement = document.getElementById('widget-total-categorias');
    const suppliersCountElement = document.getElementById('widget-total-proveedores');
    const inventoryValueElement = document.getElementById('widget-total-capital');
    
    // Añadir los widgets nuevos
    const productosVendidosElement = document.getElementById('widget-productos-vendidos');
    const gananciaTotalElement = document.getElementById('widget-ganancia-total');
  
    if (productsCountElement) productsCountElement.textContent = products.length;
    if (categoriesCountElement) categoriesCountElement.textContent = categories.length;
    if (suppliersCountElement) suppliersCountElement.textContent = suppliers.length;
  
    // Cálculo del valor total del inventario (capital actual)
    const inventoryValue = products.reduce((total, product) => {
      return total + (parseFloat(product.price) * parseInt(product.stock));
    }, 0);
    if (inventoryValueElement) {
      inventoryValueElement.textContent = `${inventoryValue.toFixed(2)}`;
    }
  
    // Cálculo del capital invertido
    const capitalInvertido = products.reduce((total, product) => {
      return total + (parseFloat(product.price) * parseInt(product.quantity));
    }, 0);
    
    // Cálculo de productos vendidos
    const productosVendidos = products.reduce((sum, product) => {
      return sum + (parseInt(product.quantity) - parseInt(product.stock));
    }, 0);
    if (productosVendidosElement) {
      productosVendidosElement.textContent = productosVendidos;
    }
  
    // Cálculo de ganancias totales
    const gananciaTotal = products.reduce((sum, product) => {
      return sum + ((parseInt(product.quantity) - parseInt(product.stock)) * parseFloat(product.pvp));
    }, 0);
    if (gananciaTotalElement) {
      gananciaTotalElement.textContent = `${gananciaTotal.toFixed(2)}`;
    }
  }


  /**
   * Inicializa los gráficos usando Chart.js.
   */
  initCharts() {
    const products = LocalStorageManager.getData("products") || [];
    const ctxBar = document.getElementById("chart-barras")?.getContext("2d");
    if (ctxBar) {
      if (this.chartBar) {
        this.chartBar.destroy();
      }
      this.chartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: products.map(product => product.name),
          datasets: [{
            label: 'Productos Adquiridos',
            data: products.map(product => product.quantity),
            backgroundColor: '#FFADDE',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: { 
          scales: { 
            y: { beginAtZero: true } 
          },
          onHover: (event, chartElement) => {
            const canvas = event?.native?.target;
            if (chartElement.length) {
              canvas.style.cursor = "pointer";
            } else {
              canvas.style.cursor = "default";
            }
          }
        }
      });
      
    }
    const ctxLine = document.getElementById("chart-linea")?.getContext("2d");
    if (ctxLine) {
      if (this.chartLine) {
        this.chartLine.destroy();
      }
      this.chartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: products.map(product => product.name),
          datasets: [{
            label: 'Capital Invertido',
            data: products.map(product => product.price * product.quantity),
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.1,
            pointRadius: 10,  // Aumenta el tamaño de los puntos
            pointHoverRadius: 12  // Aumenta el tamaño al pasar el mouse
          }]
        },
        options: { 
          scales: { 
            y: { beginAtZero: true } 
          },
          onHover: (event, chartElement) => {
            const canvas = event?.native?.target;
            if (chartElement.length) {
              canvas.style.cursor = "pointer";
            } else {
              canvas.style.cursor = "default";
            }
          }
        }
      });      
    }
  }

  /**
   * Maneja el envío del formulario de Producto.
   * @param {boolean} isEdit Indica si es edición (true) o creación (false)
   */
//  handleProductFormSubmit(isEdit) {
//    const productId = document.getElementById('product-id').value;
//    const name = document.getElementById('product-name').value;
//    const price = document.getElementById('product-price').value;
//    const quantity = document.getElementById('product-quantity').value;
//    const pvp = document.getElementById('product-pvp').value;
//    const stock = document.getElementById('product-stock').value;
//    const categoryId = document.getElementById('product-category').value || null;
//    const supplierId = document.getElementById('product-supplier').value || null;
//    const description = document.getElementById('product-description').value;
//    const imgLink = document.getElementById('product-imgLink').value;
//  
//    let success = false;
//    if (productId) {
//      success = ProductService.updateProduct(productId, {
//        name,
//        price: parseFloat(price),
//        quantity: parseInt(quantity),
//        pvp: parseFloat(pvp),
//        stock: parseInt(stock),
//        categoryId,
//        supplierId,
//        description,
//        imgLink
//      });
//      if (success) {
//        NotificationManager.success('Producto actualizado correctamente');
//      }
//    } else {
//      success = ProductService.createProduct(
//        name,
//        price,
//        quantity,
//        pvp,
//        stock,
//        categoryId,
//        supplierId,
//        description,
//        imgLink
//      );
//      if (success) {
//        NotificationManager.success('Producto creado correctamente');
//      }
//    }
//    if (success) {
//      this.modalManager.closeFormModal();
//      this.loadWidgets();
//      this.initCharts();
//      if (isEdit && this.lastTableModalCallback) {
//        this.lastTableModalCallback();
//      }
//    }
//  }
handleProductFormSubmit(isEdit) {
  const productId = document.getElementById('product-id').value;
  const name = document.getElementById('product-name').value;
  const price = document.getElementById('product-price').value;
  const quantity = document.getElementById('product-quantity').value;
  const pvp = document.getElementById('product-pvp').value;
  
  // Use quantity value for stock if stock field doesn't exist
  let stock;
  const stockField = document.getElementById('product-stock');
  if (stockField) {
    stock = stockField.value;
  } else {
    // Si el campo stock no existe, usar el valor de quantity
    stock = quantity;
  }
  
  const categoryId = document.getElementById('product-category').value || null;
  const supplierId = document.getElementById('product-supplier').value || null;
  const description = document.getElementById('product-description').value;
  const imgLink = document.getElementById('product-imgLink').value;

  let success = false;
  if (productId) {
    success = ProductService.updateProduct(productId, {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      pvp: parseFloat(pvp),
      stock: parseInt(stock),
      categoryId,
      supplierId,
      description,
      imgLink
    });
    if (success) {
      NotificationManager.success('Producto actualizado correctamente');
    }
  } else {
    // Para productos nuevos, usar quantity como valor inicial de stock
    success = ProductService.createProduct(
      name,
      price,
      quantity,
      pvp,
      quantity, // Usar quantity como valor inicial de stock para productos nuevos
      categoryId,
      supplierId,
      description,
      imgLink
    );
    if (success) {
      NotificationManager.success('Producto creado correctamente');
    }
  }
  if (success) {
    this.modalManager.closeFormModal();
    this.loadWidgets();
    this.initCharts();
    if (isEdit && this.lastTableModalCallback) {
      this.lastTableModalCallback();
    }
  }
}

  /**
   * Maneja el envío del formulario de Categoría.
   * @param {boolean} isEdit Indica si es edición (true) o creación (false)
   */
  handleCategoryFormSubmit(isEdit) {
    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;
    let success = false;
    if (categoryId) {
      success = CategoryService.updateCategory(categoryId, { name, description });
      if (success) {
        NotificationManager.success('Categoría actualizada correctamente');
      }
    } else {
      success = CategoryService.createCategory(name, description);
      if (success) {
        NotificationManager.success('Categoría creada correctamente');
      }
    }
    if (success) {
      this.modalManager.closeFormModal();
      this.loadWidgets();
      if (isEdit && this.lastTableModalCallback) {
        this.lastTableModalCallback();
      }
    }
  }

  /**
   * Maneja el envío del formulario de Proveedor.
   * @param {boolean} isEdit Indica si es edición (true) o creación (false)
   */
  handleSupplierFormSubmit(isEdit) {
    const supplierId = document.getElementById('supplier-id').value;
    const name = document.getElementById('supplier-name').value;
    const phone = document.getElementById('supplier-phone').value;
    const email = document.getElementById('supplier-email').value;
    const address = document.getElementById('supplier-address').value;
    let success = false;
    if (supplierId) {
      success = SupplierService.updateSupplier(supplierId, { name, phone, email, address });
      if (success) {
        NotificationManager.success('Proveedor actualizado correctamente');
      }
    } else {
      success = SupplierService.createSupplier(name, phone, email, address);
      if (success) {
        NotificationManager.success('Proveedor creado correctamente');
      }
    }
    if (success) {
      this.modalManager.closeFormModal();
      this.loadWidgets();
      if (isEdit && this.lastTableModalCallback) {
        this.lastTableModalCallback();
      }
    }
  }

  /**
   * Maneja la edición de un Producto.
   */
  handleEditProduct(id) {
    this.lastTableModalCallback = () => {
      const productsNew = ProductService.getAllProducts();
      const categoriesNew = CategoryService.getAllCategories();
      const suppliersNew = SupplierService.getAllSuppliers();
      const newTableHTML = this.tableManager.generateProductTable(
        productsNew,
        categoriesNew,
        suppliersNew
      );
      if (productsNew.length > 0) {
        this.modalManager.showTableModal("Listado de Productos", newTableHTML);
        this.configureTableButtons();
      } else {
        this.modalManager.closeTableModal();
      }
    };
    this.modalManager.closeTableModal();
    const product = ProductService.getProductById(id);
    if (product) {
      const formHTML = this.modalManager.updateProductForm(product);
      this.modalManager.showFormModal("Editar Producto", formHTML);
      this.attachCancelListener();
      const productForm = document.getElementById("product-form");
      if (productForm) {
        productForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleProductFormSubmit(true);
        }, { once: true });
      }
    }
  }

  /**
   * Maneja la eliminación de un Producto.
   */
  handleDeleteProduct(id) {
    this.modalManager.showDeleteModal("¿Estás seguro de que deseas eliminar este producto?", () => {
      const success = ProductService.deleteProduct(id);
      if (success) {
        NotificationManager.success('Producto eliminado correctamente');
      } else {
        NotificationManager.error('No se puede eliminar el producto porque está en uso.');
      }
      this.loadWidgets();
      this.initCharts();
      this.modalManager.closeDeleteModal();
      if (ProductService.getAllProducts().length > 0 && this.lastTableModalCallback) {
        this.lastTableModalCallback();
      }
    });
    // Listener para el botón cancelar en el modal de eliminación
    const deleteCancelBtn = document.getElementById("delete-cancel-btn");
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        this.modalManager.closeDeleteModal();
        if (this.lastTableModalCallback) {
          this.lastTableModalCallback();
        }
      }, { once: true });
    }
  }

  /**
   * Maneja la edición de una Categoría.
   */
  handleEditCategory(id) {
    this.lastTableModalCallback = () => {
      const categoriesNew = CategoryService.getAllCategories();
      const newTableHTML = this.tableManager.generateCategoryTable(categoriesNew);
      if (categoriesNew.length > 0) {
        this.modalManager.showTableModal("Listado de Categorías", newTableHTML);
        this.configureTableButtons();
      } else {
        this.modalManager.closeTableModal();
      }
    };
    this.modalManager.closeTableModal();
    const category = CategoryService.getCategoryById(id);
    if (category) {
      const formHTML = this.modalManager.createCategoryForm(category);
      this.modalManager.showFormModal("Editar Categoría", formHTML);
      this.attachCancelListener();
      const categoryForm = document.getElementById("category-form");
      if (categoryForm) {
        categoryForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleCategoryFormSubmit(true);
        }, { once: true });
      }
    }
  }

  /**
   * Maneja la eliminación de una Categoría.
   */
  handleDeleteCategory(id) {
    this.modalManager.showDeleteModal("¿Estás seguro de que deseas eliminar esta categoría?", () => {
      const success = CategoryService.deleteCategory(id);
      if (success) {
        NotificationManager.success('Categoría eliminada correctamente');
      } else {
        NotificationManager.error('No se puede eliminar la categoría porque está en uso.');
      }
      this.loadWidgets();
      this.modalManager.closeDeleteModal();
      if (CategoryService.getAllCategories().length > 0 && this.lastTableModalCallback) {
        this.lastTableModalCallback();
      }
    });
    const deleteCancelBtn = document.getElementById("delete-cancel-btn");
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        this.modalManager.closeDeleteModal();
        if (this.lastTableModalCallback) {
          this.lastTableModalCallback();
        }
      }, { once: true });
    }
  }

  /**
   * Maneja la edición de un Proveedor.
   */
  handleEditSupplier(id) {
    this.lastTableModalCallback = () => {
      const suppliersNew = SupplierService.getAllSuppliers();
      const newTableHTML = this.tableManager.generateSupplierTable(suppliersNew);
      if (suppliersNew.length > 0) {
        this.modalManager.showTableModal("Listado de Proveedores", newTableHTML);
        this.configureTableButtons();
      } else {
        this.modalManager.closeTableModal();
      }
    };
    this.modalManager.closeTableModal();
    const supplier = SupplierService.getSupplierById(id);
    if (supplier) {
      const formHTML = this.modalManager.createSupplierForm(supplier);
      this.modalManager.showFormModal("Editar Proveedor", formHTML);
      this.attachCancelListener();
      const supplierForm = document.getElementById("supplier-form");
      if (supplierForm) {
        supplierForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleSupplierFormSubmit(true);
        }, { once: true });
      }
    }
  }

  /**
   * Maneja la eliminación de un Proveedor.
   */
  handleDeleteSupplier(id) {
    this.modalManager.showDeleteModal("¿Estás seguro de que deseas eliminar este proveedor?", () => {
      const success = SupplierService.deleteSupplier(id);
      if (success) {
        NotificationManager.success('Proveedor eliminado correctamente');
      } else {
        NotificationManager.error('No se puede eliminar el proveedor porque está en uso.');
      }
      this.loadWidgets();
      this.modalManager.closeDeleteModal();
      if (SupplierService.getAllSuppliers().length > 0 && this.lastTableModalCallback) {
        this.lastTableModalCallback();
      }
    });
    const deleteCancelBtn = document.getElementById("delete-cancel-btn");
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        this.modalManager.closeDeleteModal();
        if (this.lastTableModalCallback) {
          this.lastTableModalCallback();
        }
      }, { once: true });
    }
  }
}

export { AdminPanel };