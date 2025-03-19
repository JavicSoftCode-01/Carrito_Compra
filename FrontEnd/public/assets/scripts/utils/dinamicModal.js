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
  // createProductForm(product = null) {
  //   const isEdit = product !== null;
  //   const categories = this.getCategories(); // Obtener categorías
  //   const suppliers = this.getSuppliers(); // Obtener proveedores
  //
  //   return `
  //       <form id="product-form" class="dynamic-form">
  //         <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
  //         <div class="form-group">
  //           <label for="product-name">Nombre:</label>
  //           <input type="text" id="product-name" value="${isEdit ? product.name : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-price">Precio:</label>
  //           <input type="number" id="product-price" step="0.01" value="${isEdit ? product.price : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-quantity">Cantidad:</label>
  //           <input type="number" id="product-quantity" value="${isEdit ? product.quantity : ''}" required>
  //         </div>
  //        <div class="form-group">
  //           <label for="product-pvp">PVP:</label>
  //           <input type="number" id="product-pvp" step="0.01" value="${isEdit ? product.pvp : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-category">Categoría:</label>
  //           <select id="product-category">
  //             <option value="">Seleccionar</option>
  //             ${categories.map(category =>
  //     `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>${category.name}</option>`
  //   ).join('')}
  //           </select>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-supplier">Proveedor:</label>
  //           <select id="product-supplier">
  //             <option value="">Seleccionar</option>
  //             ${suppliers.map(supplier =>
  //     `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>${supplier.name}</option>`
  //   ).join('')}
  //           </select>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-description">Descripción:</label>
  //           <textarea id="product-description">${isEdit ? product.description : ''}</textarea>
  //         </div>
  //         <div class="form-group">
  //           <label for="product-imgLink">Link de Imagen:</label>
  //           <input type="url" id="product-imgLink" value="${isEdit ? product.imgLink : ''}" required>
  //         </div>
  //         <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Producto</button>
  //       </form>
  //     `;
  // }
  createProductForm(product = null) {
    const isEdit = product !== null;
    const categories = this.getCategories(); // Obtener categorías
    const suppliers = this.getSuppliers(); // Obtener proveedores

    return `
    <form id="product-form" class="dynamic-form">
      <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
      
      <div class="form-group">
        <label for="product-name" class="form-label">Producto:</label>
        <input type="text" id="product-name" name="producto" class="form-input" 
          value="${isEdit ? product.name : ''}" required
          pattern="^[a-zA-Z0-9À-ÿ\\s]{3,50}$" placeholder="Nombre del producto"
          title="Ingrese entre 3 y 50 caracteres, solo letras, números y espacios" />
      </div>

      <div class="form-group">
        <label for="product-price" class="form-label">Precio del Producto ($):</label>
        <input type="number" id="product-price" name="precio" class="form-input" 
          step="0.01" min="0.01" value="${isEdit ? product.price : ''}" required
          placeholder="0.00" title="Ingrese un precio válido mayor a 0" />
      </div>

      <div class="form-group">
        <label for="product-quantity" class="form-label">Cantidad:</label>
        <input type="number" id="product-quantity" name="cantidad" class="form-input" 
          min="1" value="${isEdit ? product.quantity : ''}" required
          placeholder="Cantidad" title="Ingrese una cantidad mínima de 1" />
      </div>

      <div class="form-group">
        <label for="product-pvp" class="form-label">Precio Venta al Público ($):</label>
        <input type="number" id="product-pvp" name="precio_venta" class="form-input" 
          step="0.01" min="0.01" value="${isEdit ? product.pvp : ''}" required
          placeholder="0.00" title="Ingrese un precio válido mayor a 0" />
      </div>

      <div class="form-group">
        <label for="product-category" class="form-label">Categoría:</label>
        <select id="product-category" name="categoria" class="form-input" required>
          <option value="">Seleccionar</option>
          ${categories.map(category =>
      `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>
              ${category.name}
            </option>`
    ).join('')}
        </select>
      </div>

      <div class="form-group">
        <label for="product-supplier" class="form-label">Proveedor:</label>
        <select id="product-supplier" name="proveedor" class="form-input" required>
          <option value="">Seleccionar</option>
          ${suppliers.map(supplier =>
      `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>
              ${supplier.name}
            </option>`
    ).join('')}
        </select>
      </div>

      <div class="form-group">
        <label for="product-description" class="form-label">Descripción:</label>
        <input id="product-description" name="descripcion" class="form-input" 
          cols="3" rows="3" placeholder="Descripción del producto">${isEdit ? product.description : ''}</input>
      </div>

      <div class="form-group">
        <label for="product-imgLink" class="form-label">Link de Imagen:</label>
        <input type="url" id="product-imgLink" name="imgLink" class="form-input" 
          value="${isEdit ? product.imgLink : ''}" required
          placeholder="http://example.com/imagen.jpg" title="Ingrese una URL de imagen válida" />
      </div>

      <button type="submit" class="btn-submit">
        ${isEdit ? 'Actualizar' : 'Guardar'} Producto
      </button>
    </form>
  `;
  }

  // updateProductForm(product = null) {
  //   const isEdit = product !== null;
  //   const categories = this.getCategories(); // Obtener categorías
  //   const suppliers = this.getSuppliers(); // Obtener proveedores
  //
  //   return `
  //         <form id="product-form" class="dynamic-form">
  //           <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
  //           <div class="form-group">
  //             <label for="product-name">Nombre:</label>
  //             <input type="text" id="product-name" value="${isEdit ? product.name : ''}" required>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-price">Precio:</label>
  //             <input type="number" id="product-price" step="0.01" value="${isEdit ? product.price : ''}" required>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-quantity">Cantidad:</label>
  //             <input type="number" id="product-quantity" value="${isEdit ? product.quantity : ''}" required>
  //           </div>
  //          <div class="form-group">
  //             <label for="product-pvp">PVP:</label>
  //             <input type="number" id="product-pvp" step="0.01" value="${isEdit ? product.pvp : ''}" required>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-stock">Stock:</label>
  //             <input type="number" id="product-stock" value="${isEdit ? product.stock : ''}" required readonly>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-category">Categoría:</label>
  //             <select id="product-category">
  //               <option value="">Seleccionar</option>
  //               ${categories.map(category =>
  //     `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>${category.name}</option>`
  //   ).join('')}
  //             </select>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-supplier">Proveedor:</label>
  //             <select id="product-supplier">
  //               <option value="">Seleccionar</option>
  //               ${suppliers.map(supplier =>
  //     `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>${supplier.name}</option>`
  //   ).join('')}
  //             </select>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-description">Descripción:</label>
  //             <textarea id="product-description" cols="1" rows="1">${isEdit ? product.description : ''}</textarea>
  //           </div>
  //           <div class="form-group">
  //             <label for="product-imgLink">Link de Imagen:</label>
  //             <input type="url" id="product-imgLink" value="${isEdit ? product.imgLink : ''}" required>
  //           </div>
  //           <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Producto</button>
  //         </form>
  //       `;
  // }
  updateProductForm(product = null) {
    const isEdit = product !== null;
    const categories = this.getCategories(); // Obtener categorías
    const suppliers = this.getSuppliers(); // Obtener proveedores

    return `
    <form id="product-form" class="dynamic-form">
      <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
      
      <div class="form-group">
        <label for="product-name" class="form-label">Producto:</label>
        <input type="text" id="product-name" name="producto" class="form-input" 
          value="${isEdit ? product.name : ''}" required
          pattern="^[a-zA-Z0-9À-ÿ\\s]{3,50}$" placeholder="Nombre del producto"
          title="Ingrese entre 3 y 50 caracteres, solo letras, números y espacios" />
      </div>

      <div class="form-group">
        <label for="product-price" class="form-label">Precio del Producto ($):</label>
        <input type="number" id="product-price" name="precio" class="form-input" 
          step="0.01" min="0.01" value="${isEdit ? product.price : ''}" required
          placeholder="0.00" title="Ingrese un precio válido mayor a 0" />
      </div>

      <div class="form-group">
        <label for="product-quantity" class="form-label">Cantidad:</label>
        <input type="number" id="product-quantity" name="cantidad" class="form-input" 
          min="1" value="${isEdit ? product.quantity : ''}" required
          placeholder="Cantidad" title="Ingrese una cantidad mínima de 1" />
      </div>

      <div class="form-group">
        <label for="product-pvp" class="form-label">Precio Venta al Público ($):</label>
        <input type="number" id="product-pvp" name="precio_venta" class="form-input" 
          step="0.01" min="0.01" value="${isEdit ? product.pvp : ''}" required
          placeholder="0.00" title="Ingrese un precio válido mayor a 0" />
      </div>

   <!--   <div class="form-group">
        <label for="product-stock" class="form-label">Stock:</label>
        <input type="number" id="product-stock" name="stock" class="form-input" 
          value="${isEdit ? product.stock : ''}" required readonly />
      </div>         -->

      <div class="form-group">
        <label for="product-category" class="form-label">Categoría:</label>
        <select id="product-category" name="categoria" class="form-input" required>
          <option value="">Seleccionar</option>
          ${categories.map(category =>
      `<option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>
              ${category.name}
            </option>`
    ).join('')}
        </select>
      </div>

      <div class="form-group">
        <label for="product-supplier" class="form-label">Proveedor:</label>
        <select id="product-supplier" name="proveedor" class="form-input" required>
          <option value="">Seleccionar</option>
          ${suppliers.map(supplier =>
      `<option value="${supplier.id}" ${isEdit && product.supplierId === supplier.id ? 'selected' : ''}>
              ${supplier.name}
            </option>`
    ).join('')}
        </select>
      </div>

      <div class="form-group">
        <label for="product-description" class="form-label">Descripción:</label>
        <input id="product-description" name="descripcion" class="form-input" 
          cols="3" rows="3" placeholder="Descripción del producto">${isEdit ? product.description : ''}</input>
      </div>

      <div class="form-group">
        <label for="product-imgLink" class="form-label">Link de Imagen:</label>
        <input type="url" id="product-imgLink" name="imgLink" class="form-input" 
          value="${isEdit ? product.imgLink : ''}" required
          placeholder="http://example.com/imagen.jpg" title="Ingrese una URL de imagen válida" />
      </div>

      <button type="submit" class="btn-submit">
        ${isEdit ? 'Actualizar' : 'Guardar'} Producto
      </button>
    </form>
  `;
  }

  // createCategoryForm(category = null) {
  //   const isEdit = category !== null;
  //
  //   return `
  //       <form id="category-form" class="dynamic-form">
  //         <input type="hidden" id="category-id" value="${isEdit ? category.id : ''}">
  //         <div class="form-group">
  //           <label for="category-name">Nombre:</label>
  //           <input type="text" id="category-name" value="${isEdit ? category.name : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="category-description">Descripción:</label>
  //           <textarea id="category-description" cols="1" rows="1">${isEdit ? category.description : ''}</textarea>
  //         </div>
  //         <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Categoría</button>
  //       </form>
  //     `;
  // }
  //
  // createSupplierForm(supplier = null) {
  //   const isEdit = supplier !== null;
  //
  //   return `
  //       <form id="supplier-form" class="dynamic-form">
  //         <input type="hidden" id="supplier-id" value="${isEdit ? supplier.id : ''}">
  //         <div class="form-group">
  //           <label for="supplier-name">Nombre:</label>
  //           <input type="text" id="supplier-name" value="${isEdit ? supplier.name : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="supplier-phone">Teléfono:</label>
  //           <input type="tel" id="supplier-phone" value="${isEdit ? supplier.phone : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="supplier-email">Email:</label>
  //           <input type="email" id="supplier-email" value="${isEdit ? supplier.email : ''}" required>
  //         </div>
  //         <div class="form-group">
  //           <label for="supplier-address">Dirección:</label>
  //           <textarea id="supplier-address" cols="1" rows="1">${isEdit ? supplier.address : ''}</textarea>
  //         </div>
  //         <button type="submit" class="btn-submit">${isEdit ? 'Actualizar' : 'Guardar'} Proveedor</button>
  //       </form>
  //     `;
  // }

  createCategoryForm(category = null) {
    const isEdit = category !== null;
    return `
    <form id="category-form" class="dynamic-form">
      <input type="hidden" id="category-id" value="${isEdit ? category.id : ''}">
      <div class="form-group">
        <label for="category-name" class="form-label">Nombre:</label>
        <input type="text" id="category-name" name="nombre" class="form-input"
          value="${isEdit ? category.name : ''}" required
          pattern="^[a-zA-ZÀ-ÿ\\s]{3,50}$" placeholder="Ingresar nombre de la categoría"
          autocomplete="off" title="Ingrese entre 3 y 50 caracteres, solo letras y espacios" />
      </div>
      
      <div class="form-group">
        <label for="category-description" class="form-label">Descripción:</label>
        <input id="category-description" name="descripcion" class="form-input" cols="1" rows="1"
          placeholder="Descripción de la categoría">${isEdit ? category.description : ''}</input>
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
        <label for="supplier-name" class="form-label">Nombre:</label>
        <input type="text" id="supplier-name" name="nombre" class="form-input"
          value="${isEdit ? supplier.name : ''}" required
          pattern="^[a-zA-ZÀ-ÿ\\s]{3,50}$" placeholder="Ingresar nombre"
          autocomplete="off" title="Ingrese entre 3 y 50 caracteres, solo letras y espacios" />
      </div>
      
      <div class="form-group">
        <label for="supplier-phone" class="form-label">Teléfono:</label>
        <input type="tel" id="supplier-phone" name="telefono" class="form-input"
          value="${isEdit ? supplier.phone : ''}" required
          pattern="(^[0-9]{7}$)|(^09[0-9]{8}$)" maxlength="10"
          placeholder="Ingresar número fijo o celular" autocomplete="off"
          title="Ingrese un número fijo (7 dígitos) o celular (10 dígitos, comenzando con 09)" />
      </div>
      
      <div class="form-group">
        <label for="supplier-email" class="form-label">Email:</label>
        <input type="email" id="supplier-email" name="correo" class="form-input"
          value="${isEdit ? supplier.email : ''}" required
          pattern="[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$" placeholder="Ingrese su correo electrónico"
          autocomplete="off" title="Ingrese un correo válido, por ejemplo: usuario@example.com" />
      </div>
      
      <div class="form-group">
        <label for="supplier-address" class="form-label">Dirección:</label>
        <input id="supplier-address" name="direccion" class="form-input" cols="3" rows="3"
          placeholder="Ingresar dirección">${isEdit ? supplier.address : ''}</input>
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

export {DynamicModal};