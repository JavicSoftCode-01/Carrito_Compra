import {ExecuteManager} from "../utils/execute.js";
import {LocalStorageManager} from "../database/localStorage.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Clase genérica para operaciones CRUD (Create, Read, Update, Delete)
 * Diseñada para ser reutilizable en diferentes modelos
 */
class CrudGeneric {

  /**
   * Crea un nuevo registro en localStorage
   * @param {string} storageKey - Clave para almacenar la colección en localStorage
   * @param {Object} data - Datos del nuevo registro
   * @param {Function} [validateFn] - Función opcional para validar los datos antes de crear
   * @returns {boolean} - Éxito de la operación
   */
  static create(storageKey, data, validateFn = null) {
    return ExecuteManager.execute(() => {
      // Validar datos si se proporciona una función de validación
      if (validateFn && !validateFn(data)) {
        NotificationManager.warning("Los datos no pasaron la validación");
        return false;
      }

      // Verificar si el objeto tiene un ID, si no, generarlo
      if (!data.id) {
        data.id = this.#generateId();
      }

      // Intentar crear el registro
      const result = LocalStorageManager.create(storageKey, data);

      if (result) {
        NotificationManager.success(`Registro creado exitosamente`);
        return true;
      } else {
        NotificationManager.error("No se pudo crear el registro");
        return false;
      }
    }, null, "Error al crear el registro:") ?? false;
  }

  /**
   * Lee todos los registros de una colección
   * @param {string} storageKey - Clave de la colección en localStorage
   * @returns {Array} - Array de registros o array vacío si ocurre un error
   */
  static readAll(storageKey) {
    return ExecuteManager.execute(() => {
      const data = LocalStorageManager.getData(storageKey) || [];

      if (data.length === 0) {
        //NotificationManager.info("No hay registros disponibles");
        console.log("No hay registros disponibles");
      }

      return data;
    }, null, "Error al leer los registros:") ?? [];
  }

  /**
   * Lee un registro específico por su ID
   * @param {string} storageKey - Clave de la colección en localStorage
   * @param {string|number} id - ID del registro a buscar
   * @param {string} [idField="id"] - Campo que actúa como identificador único
   * @returns {Object|null} - Registro encontrado o null si no existe
   */
  static readById(storageKey, id, idField = "id") {
    return ExecuteManager.execute(() => {
      const data = LocalStorageManager.getData(storageKey) || [];
      const record = data.find(item => item[idField] === id);

      if (!record) {
        NotificationManager.warning(`No se encontró el registro con ${idField}=${id}`);
        return null;
      }

      return record;
    }, null, `Error al buscar el registro con ${idField}=${id}:`) ?? null;
  }

  /**
   * Actualiza un registro existente
   * @param {string} storageKey - Clave de la colección en localStorage
   * @param {string|number} id - ID del registro a actualizar
   * @param {Object} data - Datos para actualizar el registro
   * @param {string} [idField="id"] - Campo que actúa como identificador único
   * @param {Function} [validateFn] - Función opcional para validar los datos antes de actualizar
   * @returns {boolean} - Éxito de la operación
   */
  static update(storageKey, id, data, idField = "id", validateFn = null) {
    return ExecuteManager.execute(() => {
      // Validar datos si se proporciona una función de validación
      if (validateFn && !validateFn(data)) {
        NotificationManager.warning("Los datos no pasaron la validación");
        return false;
      }

      // Verificar si el registro existe
      const existingRecord = this.readById(storageKey, id, idField);
      if (!existingRecord) {
        NotificationManager.error(`No se encontró el registro con ${idField}=${id} para actualizar`);
        return false;
      }

      // Intentar actualizar el registro
      const result = LocalStorageManager.update(storageKey, id, data, idField);

      if (result) {
        NotificationManager.success(`Registro actualizado exitosamente`);
        return true;
      } else {
        NotificationManager.error("No se pudo actualizar el registro");
        return false;
      }
    }, null, "Error al actualizar el registro:") ?? false;
  }

  /**
   * Elimina un registro por su ID
   * @param {string} storageKey - Clave de la colección en localStorage
   * @param {string|number} id - ID del registro a eliminar
   * @param {string} [idField="id"] - Campo que actúa como identificador único
   * @returns {boolean} - Éxito de la operación
   */
  static delete(storageKey, id, idField = "id") {
    return ExecuteManager.execute(() => {
      // Verificar si el registro existe
      const existingRecord = this.readById(storageKey, id, idField);
      if (!existingRecord) {
        NotificationManager.error(`No se encontró el registro con ${idField}=${id} para eliminar`);
        return false;
      }

      // Intentar eliminar el registro
      const result = LocalStorageManager.delete(storageKey, id, idField);

      if (result) {
        NotificationManager.success(`Registro eliminado exitosamente`);
        return true;
      } else {
        NotificationManager.error("No se pudo eliminar el registro");
        return false;
      }
    }, null, "Error al eliminar el registro:") ?? false;
  }

  /**
   * Busca registros que coincidan con ciertos criterios
   * @param {string} storageKey - Clave de la colección en localStorage
   * @param {Object} criteria - Criterios de búsqueda {campo: valor}
   * @returns {Array} - Registros encontrados o array vacío
   */
  static search(storageKey, criteria) {
    return ExecuteManager.execute(() => {
      const data = LocalStorageManager.getData(storageKey) || [];

      // Si no se proporcionan criterios, devolver todos los registros
      if (!criteria || Object.keys(criteria).length === 0) {
        return data;
      }

      // Filtrar registros según los criterios
      const results = data.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
          // Comprobar si el campo existe en el item
          if (!(key in item)) return false;

          // Si el valor es una cadena, hacer una búsqueda insensible a mayúsculas/minúsculas
          if (typeof item[key] === 'string' && typeof value === 'string') {
            return item[key].toLowerCase().includes(value.toLowerCase());
          }

          // Para otros tipos, comparar directamente
          return item[key] === value;
        });
      });

      if (results.length === 0) {
        NotificationManager.info("No se encontraron registros con los criterios especificados");
      }

      return results;
    }, null, "Error al buscar registros:") ?? [];
  }

  /**
   * Genera un ID único
   * @returns {string} - ID único
   * @private
   */
  static #generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export {CrudGeneric};