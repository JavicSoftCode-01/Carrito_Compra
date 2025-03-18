import { CrudGeneric } from "../Crud/CrudGeneric.js";
import { Product } from "../models/Product.js";
import { CategoryService } from "./categoryServices.js";
import { SupplierService } from "./supplierServices.js";
import { NotificationManager } from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Servicio para gestionar operaciones CRUD de productos
 */
class ProductService {
  static STORAGE_KEY = "products";

  /**
   * Valida los datos de un producto
   * @param {Object} productData - Datos del producto a validar
   * @returns {boolean} - True si los datos son válidos, false en caso contrario
   */
  static validateProduct(productData) {
    try {
      if (!productData.name || productData.name.trim() === "") {
        NotificationManager.warning("El nombre del producto es obligatorio");
        return false;
      }
      if (isNaN(productData.price) || productData.price <= 0) {
        NotificationManager.warning("El precio debe ser un número positivo");
        return false;
      }
      if (isNaN(productData.quantity) || productData.quantity < 0) {
        NotificationManager.warning("La cantidad debe ser un número no negativo");
        return false;
      }
      if (isNaN(productData.pvp) || productData.pvp <= 0) {
        NotificationManager.warning("El PVP debe ser un número positivo");
        return false;
      }
      if (isNaN(productData.stock) || productData.stock < 0) {
        NotificationManager.warning("El stock debe ser un número no negativo");
        return false;
      }
      if (productData.categoryId) {
        const category = CategoryService.getCategoryById(productData.categoryId);
        if (!category) {
          NotificationManager.warning("La categoría seleccionada no existe");
          return false;
        }
      }
      if (productData.supplierId) {
        const supplier = SupplierService.getSupplierById(productData.supplierId);
        if (!supplier) {
          NotificationManager.warning("El proveedor seleccionado no existe");
          return false;
        }
      }
      return true;
    } catch (error) {
      NotificationManager.error(`Error al validar producto: ${error.message}`);
      return false;
    }
  }

  /**
   * Crea un nuevo producto
   */

  static createProduct(name, price, quantity, pvp, stock, categoryId = null, supplierId = null, description = "", imgLink = "") {
    try {
      const productData = {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        pvp: parseFloat(pvp),
        stock: parseInt(stock),
        categoryId,
        supplierId,
        description,
        imgLink,
        createdAt: new Date().toISOString()
      };

      return CrudGeneric.create(this.STORAGE_KEY, productData, this.validateProduct);
    } catch (error) {
      NotificationManager.error(`Error al crear producto: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene todos los productos
   */
  static getAllProducts(includeRelations = false) {
    try {
      const productsData = CrudGeneric.readAll(this.STORAGE_KEY);
      const products = productsData.map(data =>
        new Product(
          data.id,
          data.name,
          data.price,
          data.quantity,
          data.pvp,
          data.stock,
          data.categoryId,
          data.supplierId,
          data.description,
          data.imgLink,
          data.createdAt,
          data.updatedAt
        )
      );
      if (includeRelations) {
        return this.#loadRelations(products);
      }
      return products;
    } catch (error) {
      NotificationManager.error(`Error al obtener productos: ${error.message}`);
      return [];
    }
  }

  static #loadRelations(products) {
    return products.map(product => {
      const result = { ...product };
      if (product.categoryId) {
        result.category = CategoryService.getCategoryById(product.categoryId);
      }
      if (product.supplierId) {
        result.supplier = SupplierService.getSupplierById(product.supplierId);
      }
      return result;
    });
  }

  /**
   * Obtiene un producto por su ID
   */
  static getProductById(id, includeRelations = false) {
    try {
      const productData = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!productData) return null;
      const product = new Product(
        productData.id,
        productData.name,
        productData.price,
        productData.quantity,
        productData.pvp,
        productData.stock,
        productData.categoryId,
        productData.supplierId,
        productData.description,
        productData.imgLink,
        productData.createdAt,
        productData.updatedAt
      );
      if (includeRelations) {
        return this.#loadRelations([product])[0];
      }
      return product;
    } catch (error) {
      NotificationManager.error(`Error al obtener producto: ${error.message}`);
      return null;
    }
  }

  /**
   * Actualiza un producto existente
   */
  static updateProduct(id, updateData) {
    try {
      const existingProduct = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!existingProduct) {
        NotificationManager.error(`No se encontró el producto con ID ${id}`);
        return false;
      }
      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price);
      }
      if (updateData.quantity !== undefined) {
        updateData.quantity = parseInt(updateData.quantity);
      }
      if (updateData.pvp !== undefined) {
        updateData.pvp = parseFloat(updateData.pvp);
      }
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock);
      }
      updateData.updatedAt = new Date().toISOString();

      return CrudGeneric.update(this.STORAGE_KEY, id, updateData, "id", this.validateProduct);
    } catch (error) {
      NotificationManager.error(`Error al actualizar producto: ${error.message}`);
      return false;
    }
  }

  /**
   * Elimina un producto por su ID
   */
  static deleteProduct(id) {
    try {
      return CrudGeneric.delete(this.STORAGE_KEY, id);
    } catch (error) {
      NotificationManager.error(`Error al eliminar producto: ${error.message}`);
      return false;
    }
  }

  /**
   * Busca productos por criterios
   */
  static searchProducts(criteria = {}, includeRelations = false) {
    try {
      const allProducts = CrudGeneric.readAll(this.STORAGE_KEY);
      const results = allProducts.filter(product => {
        if (criteria.name && (!product.name || !product.name.toLowerCase().includes(criteria.name.toLowerCase()))) {
          return false;
        }
        if (criteria.minPrice !== undefined && product.price < criteria.minPrice) {
          return false;
        }
        if (criteria.maxPrice !== undefined && product.price > criteria.maxPrice) {
          return false;
        }
        if (criteria.categoryId && product.categoryId !== criteria.categoryId) {
          return false;
        }
        if (criteria.supplierId && product.supplierId !== criteria.supplierId) {
          return false;
        }
        if (criteria.minStock !== undefined && product.stock < criteria.minStock) {
          return false;
        }
        return true;
      });
      const products = results.map(data =>
        new Product(
          data.id,
          data.name,
          data.price,
          data.quantity,
          data.pvp,
          data.stock,
          data.categoryId,
          data.supplierId,
          data.description,
          data.imgLink,
          data.createdAt,
          data.updatedAt
        )
      );
      if (includeRelations) {
        return this.#loadRelations(products);
      }
      return products;
    } catch (error) {
      NotificationManager.error(`Error al buscar productos: ${error.message}`);
      return [];
    }
  }

  static getProductsByCategory(categoryId, includeRelations = false) {
    return this.searchProducts({ categoryId }, includeRelations);
  }

  static getProductsBySupplier(supplierId, includeRelations = false) {
    return this.searchProducts({ supplierId }, includeRelations);
  }

  static getAvailableCategories() {
    return CategoryService.getAllCategories();
  }

  static getAvailableSuppliers() {
    return SupplierService.getAllSuppliers();
  }
}

export { ProductService };