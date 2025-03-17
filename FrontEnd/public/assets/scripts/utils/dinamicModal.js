class DynamicModal {
  constructor() {
    // Modales
    this.formModal = document.getElementById('form-modal');
    this.tableModal = document.getElementById('table-modal');
    this.deleteModal = document.getElementById('delete-confirmation-modal');

    // Contenedores
    this.formContainer = document.getElementById('form-container');
    this.tableContainer = document.getElementById('table-container');

    // Títulos
    this.formModalTitle = document.getElementById('form-modal-title');
    this.tableModalTitle = document.getElementById('table-modal-title');
    this.deleteConfirmationMessage = document.getElementById('delete-confirmation-message');

    // Botones
    this.formModalClose = document.getElementById('form-modal-close');
    this.tableModalClose = document.getElementById('table-modal-close');
    this.deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    this.deleteCancelBtn = document.getElementById('delete-cancel-btn');

    // Inicializar eventos
    this.initEvents();
  }

  initEvents() {
    // Cerrar modales
    this.formModalClose.addEventListener('click', () => this.closeFormModal());
    this.tableModalClose.addEventListener('click', () => this.closeTableModal());
    this.deleteCancelBtn.addEventListener('click', () => this.closeDeleteModal());

    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', (event) => {
      if (event.target === this.formModal) this.closeFormModal();
      if (event.target === this.tableModal) this.closeTableModal();
      if (event.target === this.deleteModal) this.closeDeleteModal();
    });
  }

  // Métodos para mostrar modales con animación
  showFormModal(title, formContent) {
    this.formModalTitle.textContent = title;
    this.formContainer.innerHTML = formContent;
    
    // Mostrar el modal con animación
    this.formModal.style.display = 'block';
    
    // Forzar reflow para garantizar que la animación funcione
    void this.formModal.offsetWidth;
    
    // Agregar clase para activar la animación
    this.formModal.classList.add('active');
  }

  closeFormModal() {
    // Agregar clase para iniciar animación de cierre
    this.formModal.classList.add('closing');
    this.formModal.classList.remove('active');
    
    // Esperar a que la animación termine antes de ocultar
    setTimeout(() => {
      this.formModal.style.display = 'none';
      this.formModal.classList.remove('closing');
      this.formContainer.innerHTML = '';
    }, 300); // Debe coincidir con la duración de la animación en CSS
  }

  showTableModal(title, tableContent) {
    this.tableModalTitle.textContent = title;
    this.tableContainer.innerHTML = tableContent;
    
    // Mostrar el modal con animación
    this.tableModal.style.display = 'block';
    
    // Forzar reflow para garantizar que la animación funcione
    void this.tableModal.offsetWidth;
    
    // Agregar clase para activar la animación
    this.tableModal.classList.add('active');
  }

  closeTableModal() {
    // Agregar clase para iniciar animación de cierre
    this.tableModal.classList.add('closing');
    this.tableModal.classList.remove('active');
    
    // Esperar a que la animación termine antes de ocultar
    setTimeout(() => {
      this.tableModal.style.display = 'none';
      this.tableModal.classList.remove('closing');
      this.tableContainer.innerHTML = '';
    }, 300); // Debe coincidir con la duración de la animación en CSS
  }

  showDeleteModal(message, onConfirm) {
    this.deleteConfirmationMessage.textContent = message;
    
    // Asignar nueva función de confirmación
    this.deleteConfirmBtn.onclick = () => {
      onConfirm();
      this.closeDeleteModal();
    };
    
    // Mostrar el modal con animación
    this.deleteModal.style.display = 'block';
    
    // Forzar reflow para garantizar que la animación funcione
    void this.deleteModal.offsetWidth;
    
    // Agregar clase para activar la animación
    this.deleteModal.classList.add('active');
  }

  closeDeleteModal() {
    // Agregar clase para iniciar animación de cierre
    this.deleteModal.classList.add('closing');
    this.deleteModal.classList.remove('active');
    
    // Esperar a que la animación termine antes de ocultar
    setTimeout(() => {
      this.deleteModal.style.display = 'none';
      this.deleteModal.classList.remove('closing');
    }, 300); // Debe coincidir con la duración de la animación en CSS
  }

  // Métodos para crear formularios
  createProductForm(product = null) {
    const isEdit = product !== null;
    const categories = this.getCategories(); // Obtener categorías
    const suppliers = this.getSuppliers(); // Obtener proveedores

    return `
        <form id="product-form" class="dynamic-form">
          <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
          <div class="form-group">
            <label for="product-name">Nombre:</label>
            <input type="text" id="product-name" value="${isEdit ? product.name : ''}" required>
          </div>
          <div class="form-group">
            <label for="product-price">Precio:</label>
            <input type="number" id="product-price" step="0.01" value="${isEdit ? product.price : ''}" required>
          </div>
          <div class="form-group">
            <label for="product-quantity">Cantidad:</label>
            <input type="number" id="product-quantity" value="${isEdit ? product.quantity : ''}" required>
          </div>
         <div class="form-group">
            <label for="product-pvp">PVP:</label>
            <input type="number" id="product-pvp" step="0.01" value="${isEdit ? product.pvp : ''}" required>
          </div> 
          <div class="form-group">
            <label for="product-category">Categoría:</label>
            <select id="product-category">
              <option value="">Seleccionar</option>
              ${categories.map(category =>
      `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>${category.name}</option>`
    ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="product-supplier">Proveedor:</label>
            <select id="product-supplier">
              <option value="">Seleccionar</option>
              ${suppliers.map(supplier =>
      `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>${supplier.name}</option>`
    ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="product-description">Descripción:</label>
            <textarea id="product-description">${isEdit ? product.description : ''}</textarea>
          </div>
          <div class="form-group">
            <label for="product-imgLink">Link de Imagen:</label>
            <input type="url" id="product-imgLink" value="${isEdit ? product.imgLink : ''}" required>
          </div>
          <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Producto</button>
        </form>
      `;
  }

  // Métodos para crear formularios
  updateProductForm(product = null) {
    const isEdit = product !== null;
    const categories = this.getCategories(); // Obtener categorías
    const suppliers = this.getSuppliers(); // Obtener proveedores

    return `
          <form id="product-form" class="dynamic-form">
            <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
            <div class="form-group">
              <label for="product-name">Nombre:</label>
              <input type="text" id="product-name" value="${isEdit ? product.name : ''}" required>
            </div>
            <div class="form-group">
              <label for="product-price">Precio:</label>
              <input type="number" id="product-price" step="0.01" value="${isEdit ? product.price : ''}" required>
            </div>
            <div class="form-group">
              <label for="product-quantity">Cantidad:</label>
              <input type="number" id="product-quantity" value="${isEdit ? product.quantity : ''}" required>
            </div>
           <div class="form-group">
              <label for="product-pvp">PVP:</label>
              <input type="number" id="product-pvp" step="0.01" value="${isEdit ? product.pvp : ''}" required>
            </div> 
            <div class="form-group">
              <label for="product-stock">Stock:</label>
              <input type="number" id="product-stock" value="${isEdit ? product.stock : ''}" required readonly>
            </div>
            <div class="form-group">
              <label for="product-category">Categoría:</label>
              <select id="product-category">
                <option value="">Seleccionar</option>
                ${categories.map(category =>
      `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>${category.name}</option>`
    ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="product-supplier">Proveedor:</label>
              <select id="product-supplier">
                <option value="">Seleccionar</option>
                ${suppliers.map(supplier =>
      `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>${supplier.name}</option>`
    ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="product-description">Descripción:</label>
              <textarea id="product-description" cols="1" rows="1">${isEdit ? product.description : ''}</textarea>
            </div>
            <div class="form-group">
              <label for="product-imgLink">Link de Imagen:</label>
              <input type="url" id="product-imgLink" value="${isEdit ? product.imgLink : ''}" required>
            </div>
            <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Producto</button>
          </form>
        `;
  }

  createCategoryForm(category = null) {
    const isEdit = category !== null;

    return `
        <form id="category-form" class="dynamic-form">
          <input type="hidden" id="category-id" value="${isEdit ? category.id : ''}">
          <div class="form-group">
            <label for="category-name">Nombre:</label>
            <input type="text" id="category-name" value="${isEdit ? category.name : ''}" required>
          </div>
          <div class="form-group">
            <label for="category-description">Descripción:</label>
            <textarea id="category-description" cols="1" rows="1">${isEdit ? category.description : ''}</textarea>
          </div>
          <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Categoría</button>
        </form>
      `;
  }

  createSupplierForm(supplier = null) {
    const isEdit = supplier !== null;

    return `
        <form id="supplier-form" class="dynamic-form">
          <input type="hidden" id="supplier-id" value="${isEdit ? supplier.id : ''}">
          <div class="form-group">
            <label for="supplier-name">Nombre:</label>
            <input type="text" id="supplier-name" value="${isEdit ? supplier.name : ''}" required>
          </div>
          <div class="form-group">
            <label for="supplier-phone">Teléfono:</label>
            <input type="tel" id="supplier-phone" value="${isEdit ? supplier.phone : ''}" required>
          </div>
          <div class="form-group">
            <label for="supplier-email">Email:</label>
            <input type="email" id="supplier-email" value="${isEdit ? supplier.email : ''}" required>
          </div>
          <div class="form-group">
            <label for="supplier-address">Dirección:</label>
            <textarea id="supplier-address" cols="1" rows="1">${isEdit ? supplier.address : ''}</textarea>
          </div>
          <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Proveedor</button>
        </form>
      `;
  }

  // Métodos auxiliares
  getCategories() {
    // Aquí iría la lógica para obtener las categorías del almacenamiento
    // Por ahora devuelvo un array de ejemplo
    return JSON.parse(localStorage.getItem('categories') || '[]');
  }

  getSuppliers() {
    // Aquí iría la lógica para obtener los proveedores del almacenamiento
    // Por ahora devuelvo un array de ejemplo
    return JSON.parse(localStorage.getItem('suppliers') || '[]');
  }
}

export { DynamicModal };