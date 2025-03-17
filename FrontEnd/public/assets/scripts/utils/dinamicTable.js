class DynamicTable {
  constructor(modalManager) {
    this.modalManager = modalManager;
  }

  // Generar tabla de proveedores
  generateSupplierTable(suppliers, editCallback, deleteCallback) {
    if (!suppliers || suppliers.length === 0) {
      return `<div class="no-data">No hay proveedores registrados</div>`;
    }

    return `
        <div class="table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map(supplier => `
                <tr>
                  <td data-label="Nombre">${supplier.name}</td>
                  <td data-label="Teléfono">${supplier.phone}</td>
                  <td data-label="Email">${supplier.email}</td>
                  <td data-label="Dirección">${supplier.address}</td>
                  <td data-label="Acciones">
                    <button class="btn-edit" data-id="${supplier.id}">
                      <i class="fa-solid fa-pencil fa-lg"></i>
                    </button>
                    <button class="btn-delete" data-id="${supplier.id}">
                      <i class="fa-solid fa-trash fa-lg"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
  }

  // Generar tabla de categorías
  generateCategoryTable(categories, editCallback, deleteCallback) {
    if (!categories || categories.length === 0) {
      return `<div class="no-data">No hay categorías registradas</div>`;
    }

    return `
        <div class="table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(category => `
                <tr>
                  <td data-label="Nombre">${category.name}</td>
                  <td data-label="Descripción">${category.description || '-'}</td>
                  <td data-label="Acciones">
                    <button class="btn-edit" data-id="${category.id}">
                      <i class="fa-solid fa-pencil fa-lg"></i>
                    </button>
                    <button class="btn-delete" data-id="${category.id}">
                      <i class="fa-solid fa-trash fa-lg"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
  }

  // Generar tabla de productos
  generateProductTable(products, categories = [], suppliers = [], editCallback, deleteCallback) {
    if (!products || products.length === 0) {
      return `<div class="no-data">No hay productos registrados</div>`;
    }

    // Crear mapas para búsqueda rápida de nombres
    const categoryMap = {};
    const supplierMap = {};

    categories.forEach(category => {
      categoryMap[category.id] = category.name;
    });
    suppliers.forEach(supplier => {
      supplierMap[supplier.id] = supplier.name;
    });

    return `
    <div class="table-responsive">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>IMG</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>PVP</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td data-label="IMG"><img src="${product.imgLink}" alt="${product.name}" style="width:50px; height:50px; border-radius:50%; border: 1px solid red"></td>
              <td data-label="Nombre">${product.name}</td>
              <td data-label="Precio">$${parseFloat(product.price).toFixed(2)}</td>
              <td data-label="Cantidad">${product.quantity}</td>
              <td data-label="PVP">$${parseFloat(product.pvp).toFixed(2)}</td>
              <td data-label="Stock">${product.stock}</td>
              <td data-label="Categoría">${categoryMap[product.categoryId] || '-'}</td>
              <td data-label="Proveedor">${supplierMap[product.supplierId] || '-'}</td>
              <td data-label="Acciones">
                <button class="btn-edit" data-id="${product.id}">
                  <i class="fa-solid fa-pencil fa-lg"></i>
                </button>
                <button class="btn-delete" data-id="${product.id}">
                  <i class="fa-solid fa-trash fa-lg"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  }

}

export { DynamicTable };