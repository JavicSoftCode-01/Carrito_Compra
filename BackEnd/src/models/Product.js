class Product {
  constructor(id, name, price, stock, description = "") {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.description = description;
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
    this.stock = quantity;
  }

  // Método para obtener detalles del producto
  getDetails() {
    return `${this.name}: $${this.price.toFixed(2)} (${this.stock} disponibles)`;
  }
}

export default Product;