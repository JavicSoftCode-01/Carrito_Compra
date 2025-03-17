class Product {
  constructor(id, name, price, quantity, pvp, stock, categoryId = null, supplierId = null, description = "", imgLink = "", createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.pvp = pvp;
    this.stock = stock;
    this.categoryId = categoryId;    // ID de la categoría a la que pertenece el producto
    this.supplierId = supplierId;    // ID del proveedor que suministra el producto
    this.description = description;
    this.imgLink = imgLink;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();

    console.log("Product constructor called with:", {id, name, price, quantity, pvp, stock, categoryId, supplierId});
    console.log("Product instance created:", this);
  }

  // Método para aplicar un descuento porcentual
  applyDiscount(percent) {
    if (percent < 0 || percent > 100) throw new Error("Porcentaje de descuento inválido.");
    const discount = (this.price * percent) / 100;
    return this.price - discount;
  }

  // Método para actualizar el stock
  updateStock(quantity) {
    if (quantity < 0) throw new Error("La cantidad no puede ser negativa.");
    this.quantity = quantity;
  }

  // Método para obtener detalles del producto
  getDetails() {
    return `${this.name}: $${this.price.toFixed(2)} (${this.stock} disponibles)`;
  }

  // Método para asignar una categoría
  setCategory(categoryId) {
    this.categoryId = categoryId;
  }

  // Método para asignar un proveedor
  setSupplier(supplierId) {
    this.supplierId = supplierId;
  }
}

export {Product};