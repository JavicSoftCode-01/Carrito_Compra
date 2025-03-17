import {CrudGeneric} from "../Crud/CrudGeneric.js";
import {Supplier} from "../models/Supplier.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Servicio para gestionar operaciones CRUD de proveedores
 */
class SupplierService {
  // Clave para almacenar los proveedores en localStorage
  static STORAGE_KEY = "suppliers";



  /**
   * Crea un nuevo proveedor
   * @param {string} name - Nombre del proveedor
   * @param {string} phone - Teléfono del proveedor
   * @param {string} email - Email del proveedor
   * @param {string} address - Dirección del proveedor
   * @returns {boolean} - Éxito de la operación
   */
  static createSupplier(name, phone = "", email = "", address = "") {
    try {
      const supplierData = {
        name,
        phone,
        email,
        address,
        createdAt: new Date().toISOString()
      };

      return CrudGeneric.create(
        this.STORAGE_KEY,
        supplierData
      );
    } catch (error) {
      NotificationManager.error(`Error al crear proveedor: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene todos los proveedores
   * @returns {Array<Supplier>} - Array de objetos Supplier
   */
  static getAllSuppliers() {
    try {
      const suppliersData = CrudGeneric.readAll(this.STORAGE_KEY);

      // Convertir los datos planos a instancias de Supplier
      return suppliersData.map(data =>
        new Supplier(data.id, data.name, data.phone, data.email, data.address, data.createdAt, data.updatedAt)
      );
    } catch (error) {
      NotificationManager.error(`Error al obtener proveedores: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene un proveedor por su ID
   * @param {string} id - ID del proveedor
   * @returns {Supplier|null} - Objeto Supplier o null si no se encuentra
   */
  static getSupplierById(id) {
    try {
      const supplierData = CrudGeneric.readById(this.STORAGE_KEY, id);

      if (!supplierData) return null;

      return new Supplier(
        supplierData.id,
        supplierData.name,
        supplierData.phone,
        supplierData.email,
        supplierData.address,
        supplierData.createdAt,
        supplierData.updatedAt
      );
    } catch (error) {
      NotificationManager.error(`Error al obtener proveedor: ${error.message}`);
      return null;
    }
  }

  /**
   * Actualiza un proveedor existente
   * @param {string} id - ID del proveedor a actualizar
   * @param {Object} updateData - Datos para actualizar (name, phone, email, address)
   * @returns {boolean} - Éxito de la operación
   */
  static updateSupplier(id, updateData) {
    try {
      // Verificar si el proveedor existe
      const existingSupplier = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!existingSupplier) {
        NotificationManager.error(`No se encontró el proveedor con ID ${id}`);
        return false;
      }

      // Añadir timestamp de actualización
      updateData.updatedAt = new Date().toISOString();

      return CrudGeneric.update(
        this.STORAGE_KEY,
        id,
        updateData,
        "id"
      );
    } catch (error) {
      NotificationManager.error(`Error al actualizar proveedor: ${error.message}`);
      return false;
    }
  }

  // /**
  //  * Elimina un proveedor por su ID
  //  * @param {string} id - ID del proveedor a eliminar
  //  * @returns {boolean} - Éxito de la operación
  //  */
  // static deleteSupplier(id) {
  //   try {
  //     return CrudGeneric.delete(this.STORAGE_KEY, id);
  //   } catch (error) {
  //     NotificationManager.error(`Error al eliminar proveedor: ${error.message}`);
  //     return false;
  //   }
  // }


  /**
   * Elimina un proveedor por su ID
   * @param {string} id - ID del proveedor a eliminar
   * @returns {boolean} - Éxito de la operación
   */
  static deleteSupplier(id) {
    try {
      // Verificar si el proveedor existe
      const supplier = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!supplier) {
        NotificationManager.error(`No se encontró el proveedor con ID ${id}`);
        return false;
      }

      // Verificar si el proveedor está siendo utilizado en algún producto
      const productsKey = "products"; // La clave donde se almacenan los productos
      const allProducts = CrudGeneric.readAll(productsKey) || [];

      const productsUsingSupplier = allProducts.filter(product => product.supplierId === id);

      if (productsUsingSupplier.length > 0) {
        NotificationManager.error(`No se puede eliminar el proveedor porque está en uso por ${productsUsingSupplier.length} producto(s)`);
        return false;
      }

      // Si no hay productos que usen este proveedor, proceder con la eliminación
      return CrudGeneric.delete(this.STORAGE_KEY, id);
    } catch (error) {
      NotificationManager.error(`Error al eliminar proveedor: ${error.message}`);
      return false;
    }
  }

  /**
   * Busca proveedores por nombre, email o teléfono
   * @param {string} searchTerm - Término de búsqueda
   * @param {string} field - Campo por el cual buscar (name, email, phone). Por defecto busca en todos.
   * @returns {Array<Supplier>} - Array de objetos Supplier que coinciden
   */
  static searchSuppliers(searchTerm, field = null) {
    try {
      let criteria = {};

      // Si se especifica un campo, buscar solo en ese campo
      if (field && ['name', 'email', 'phone'].includes(field)) {
        criteria[field] = searchTerm;
      }
      // Si no, buscar en todos los campos relevantes
      else {
        // Utilizar readAll y filtrar manualmente para buscar en múltiples campos
        const allSuppliers = CrudGeneric.readAll(this.STORAGE_KEY);
        const results = allSuppliers.filter(supplier =>
          (supplier.name && supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.phone && supplier.phone.includes(searchTerm))
        );

        return results.map(data =>
          new Supplier(data.id, data.name, data.phone, data.email, data.address)
        );
      }

      const results = CrudGeneric.search(this.STORAGE_KEY, criteria);

      return results.map(data =>
        new Supplier(data.id, data.name, data.phone, data.email, data.address)
      );
    } catch (error) {
      NotificationManager.error(`Error al buscar proveedores: ${error.message}`);
      return [];
    }
  }
}

export {SupplierService};