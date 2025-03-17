//import { CrudGeneric } from "../Crud/CrudGeneric.js";
//import {Product} from "../models/Product.js";
//import {CategoryService} from "./categoryServices.js";
//import {SupplierService} from "./supplierServices.js";
//import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";
//
///**
// * Servicio para gestionar operaciones CRUD de productos
// */
//class ProductService {
//  // Clave para almacenar los productos en localStorage
//  static STORAGE_KEY = "products";
//
//  /**
//   * Valida los datos de un producto
//   * @param {Object} productData - Datos del producto a validar
//   * @returns {boolean} - True si los datos son válidos, false en caso contrario
//   */
//  static validateProduct(productData) {
//    try {
//      // Verificar que los campos requeridos existen
//      if (!productData.name || productData.name.trim() === "") {
//        NotificationManager.warning("El nombre del producto es obligatorio");
//        return false;
//      }
//
//      // Validar precio
//      if (isNaN(productData.price) || productData.price <= 0) {
//        NotificationManager.warning("El precio debe ser un número positivo");
//        return false;
//      }
//
//      // Validar stock
//      if (isNaN(productData.stock) || productData.stock < 0) {
//        NotificationManager.warning("El stock debe ser un número no negativo");
//        return false;
//      }
//
//      // Validar categoryId si existe
//      if (productData.categoryId) {
//        const category = CategoryService.getCategoryById(productData.categoryId);
//        if (!category) {
//          NotificationManager.warning("La categoría seleccionada no existe");
//          return false;
//        }
//      }
//
//      // Validar supplierId si existe
//      if (productData.supplierId) {
//        const supplier = SupplierService.getSupplierById(productData.supplierId);
//        if (!supplier) {
//          NotificationManager.warning("El proveedor seleccionado no existe");
//          return false;
//        }
//      }
//
//      return true;
//    } catch (error) {
//      NotificationManager.error(`Error al validar producto: ${error.message}`);
//      return false;
//    }
//  }
//
//  /**
//   * Crea un nuevo producto
//   * @param {string} name - Nombre del producto
//   * @param {number} price - Precio del producto
//   * @param {number} stock - Stock disponible
//   * @param {string} categoryId - ID de la categoría (opcional)
//   * @param {string} supplierId - ID del proveedor (opcional)
//   * @param {string} description - Descripción del producto (opcional)
//   * @param {string} imgLink - Enlace a la imagen del producto (opcional)
//   * @returns {boolean} - Éxito de la operación
//   */
//  static createProduct(name, price, quantity, pvp, stock, categoryId = null, supplierId = null, description = "", imgLink = "") {
//    try {
//      const productData = {
//        name,
//        price: parseFloat(price),
//        quantity: parseInt(quantity),
//        pvp: parseFloat(pvp),
//        stock: parseInt(stock),
//        categoryId,
//        supplierId,
//        description,
//        imgLink,
//        createdAt: new Date().toISOString()
//      };
//
//      return CrudGeneric.create(this.STORAGE_KEY, productData, this.validateProduct);
//    } catch (error) {
//      NotificationManager.error(`Error al crear producto: ${error.message}`);
//      return false;
//    }
//  }
//
//  /**
//   * Obtiene todos los productos
//   * @param {boolean} includeRelations - Si es true, incluye objetos de categoría y proveedor completos
//   * @returns {Array<Product>} - Array de objetos Product
//   */
//  static getAllProducts(includeRelations = false) {
//    try {
//      const productsData = CrudGeneric.readAll(this.STORAGE_KEY);
//
//      // Convertir los datos planos a instancias de Product
//      const products = productsData.map(data => new Product(data.id, data.name, data.price, data.quantity, data.pvp, data.stock, data.categoryId, data.supplierId, data.description, data.imgLink, data.createdAt, data.updatedAt));
//
//      // Si se solicitan las relaciones, cargarlas
//      if (includeRelations) {
//        return this.#loadRelations(products);
//      }
//
//      return products;
//    } catch (error) {
//      NotificationManager.error(`Error al obtener productos: ${error.message}`);
//      return [];
//    }
//  }
//
//  /**
//   * Carga las relaciones (category y supplier) para una lista de productos
//   * @param {Array<Product>} products - Lista de productos
//   * @returns {Array<Object>} - Lista de productos con sus relaciones
//   * @private
//   */
//  static #loadRelations(products) {
//    return products.map(product => {
//      const result = {...product};
//
//      // Cargar categoría si existe
//      if (product.categoryId) {
//        result.category = CategoryService.getCategoryById(product.categoryId);
//      }
//
//      // Cargar proveedor si existe
//      if (product.supplierId) {
//        result.supplier = SupplierService.getSupplierById(product.supplierId);
//      }
//
//      return result;
//    });
//  }
//
//  /**
//   * Obtiene un producto por su ID
//   * @param {string} id - ID del producto
//   * @param {boolean} includeRelations - Si es true, incluye objetos de categoría y proveedor completos
//   * @returns {Product|Object|null} - Objeto Product o null si no se encuentra
//   */
//  static getProductById(id, includeRelations = false) {
//    try {
//      const productData = CrudGeneric.readById(this.STORAGE_KEY, id);
//
//      if (!productData) return null;
//
//      const product = new Product(productData.id, productData.name, productData.price, productData.quantity, productData.pvp, productData.stock, productData.categoryId, productData.supplierId, productData.description, productData.imgLink, productData.createdAt, productData.updatedAt);
//
//      // Si se solicitan las relaciones, cargarlas
//      if (includeRelations) {
//        return this.#loadRelations([product])[0];
//      }
//
//      return product;
//    } catch (error) {
//      NotificationManager.error(`Error al obtener producto: ${error.message}`);
//      return null;
//    }
//  }
//
//  /**
//   * Actualiza un producto existente
//   * @param {string} id - ID del producto a actualizar
//   * @param {Object} updateData - Datos para actualizar
//   * @returns {boolean} - Éxito de la operación
//   */
//  static updateProduct(id, updateData) {
//    try {
//      // Verificar si el producto existe
//      const existingProduct = CrudGeneric.readById(this.STORAGE_KEY, id);
//      if (!existingProduct) {
//        NotificationManager.error(`No se encontró el producto con ID ${id}`);
//        return false;
//      }
//
//      // Convertir datos numéricos si están presentes
//      if (updateData.price !== undefined) {
//        updateData.price = parseFloat(updateData.price);
//      }
//
//      if (updateData.stock !== undefined) {
//        updateData.stock = parseInt(updateData.stock);
//      }
//
//      // Añadir timestamp de actualización
//      updateData.updatedAt = new Date().toISOString();
//
//      return CrudGeneric.update(this.STORAGE_KEY, id, updateData, "id", this.validateProduct);
//    } catch (error) {
//      NotificationManager.error(`Error al actualizar producto: ${error.message}`);
//      return false;
//    }
//  }
//
//  /**
//   * Elimina un producto por su ID
//   * @param {string} id - ID del producto a eliminar
//   * @returns {boolean} - Éxito de la operación
//   */
//  static deleteProduct(id) {
//    try {
//      return CrudGeneric.delete(this.STORAGE_KEY, id);
//    } catch (error) {
//      NotificationManager.error(`Error al eliminar producto: ${error.message}`);
//      return false;
//    }
//  }
//
//  /**
//   * Busca productos por diferentes criterios
//   * @param {Object} criteria - Criterios de búsqueda (name, minPrice, maxPrice, categoryId, supplierId)
//   * @param {boolean} includeRelations - Si es true, incluye objetos de categoría y proveedor completos
//   * @returns {Array<Product|Object>} - Array de objetos Product que coinciden
//   */
//  static searchProducts(criteria = {}, includeRelations = false) {
//    try {
//      // Obtener todos los productos para filtrarlos manualmente
//      const allProducts = CrudGeneric.readAll(this.STORAGE_KEY);
//
//      const results = allProducts.filter(product => {
//        // Filtrar por nombre si se especifica
//        if (criteria.name && (!product.name || !product.name.toLowerCase().includes(criteria.name.toLowerCase()))) {
//          return false;
//        }
//
//        // Filtrar por precio mínimo si se especifica
//        if (criteria.minPrice !== undefined && product.price < criteria.minPrice) {
//          return false;
//        }
//
//        // Filtrar por precio máximo si se especifica
//        if (criteria.maxPrice !== undefined && product.price > criteria.maxPrice) {
//          return false;
//        }
//
//        // Filtrar por categoría si se especifica
//        if (criteria.categoryId && product.categoryId !== criteria.categoryId) {
//          return false;
//        }
//
//        // Filtrar por proveedor si se especifica
//        if (criteria.supplierId && product.supplierId !== criteria.supplierId) {
//          return false;
//        }
//
//        // Filtrar por stock mínimo si se especifica
//        if (criteria.minStock !== undefined && product.stock < criteria.minStock) {
//          return false;
//        }
//
//        return true;
//      });
//
//      // Convertir los resultados a instancias de Product
//      const products = results.map(data => new Product(data.id, data.name, data.price, data.stock, data.categoryId, data.supplierId, data.description, data.imgLink));
//
//      // Si se solicitan las relaciones, cargarlas
//      if (includeRelations) {
//        return this.#loadRelations(products);
//      }
//
//      return products;
//    } catch (error) {
//      NotificationManager.error(`Error al buscar productos: ${error.message}`);
//      return [];
//    }
//  }
//
//  /**
//   * Obtiene todos los productos de una categoría específica
//   * @param {string} categoryId - ID de la categoría
//   * @param {boolean} includeRelations - Si es true, incluye objetos de categoría y proveedor completos
//   * @returns {Array<Product|Object>} - Array de objetos Product
//   */
//  static getProductsByCategory(categoryId, includeRelations = false) {
//    return this.searchProducts({categoryId}, includeRelations);
//  }
//
//  /**
//   * Obtiene todos los productos de un proveedor específico
//   * @param {string} supplierId - ID del proveedor
//   * @param {boolean} includeRelations - Si es true, incluye objetos de categoría y proveedor completos
//   * @returns {Array<Product|Object>} - Array de objetos Product
//   */
//  static getProductsBySupplier(supplierId, includeRelations = false) {
//    return this.searchProducts({supplierId}, includeRelations);
//  }
//
//  /**
//   * Obtiene las categorías disponibles para poblar el formulario de producto
//   * @returns {Array} - Array de objetos Category
//   */
//  static getAvailableCategories() {
//    return CategoryService.getAllCategories();
//  }
//
//  /**
//   * Obtiene los proveedores disponibles para poblar el formulario de producto
//   * @returns {Array} - Array de objetos Supplier
//   */
//  static getAvailableSuppliers() {
//    return SupplierService.getAllSuppliers();
//  }
//}
//
//export {ProductService};//

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
  //static createProduct(name, price, quantity, pvp, stock, categoryId = null, supplierId = null, description = "", imgLink = "") {
  //  try {
  //    const productData = {
  //      name,
  //      price: parseFloat(price),
  //      quantity: parseInt(quantity),
  //      pvp: parseFloat(pvp),
  //      stock: parseInt(stock),
  //      categoryId,
  //      supplierId,
  //      description,
  //      imgLink,
  //      createdAt: new Date().toISOString()
  //    };
//
  //    return CrudGeneric.create(this.STORAGE_KEY, productData, this.validateProduct);
  //  } catch (error) {
  //    NotificationManager.error(`Error al crear producto: ${error.message}`);
  //    return false;
  //  }
  //}
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