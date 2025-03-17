import {CrudGeneric} from "../Crud/CrudGeneric.js";
import {Category} from "../models/Category.js";
import {NotificationManager} from "../../../FrontEnd/public/assets/scripts/utils/showNotifications.js";

/**
 * Servicio para gestionar operaciones CRUD de categorías
 */
class CategoryService {
  // Clave para almacenar las categorías en localStorage
  static STORAGE_KEY = "categories";

  /**
   * Valida los datos de una categoría
   * @param {Object} categoryData - Datos de la categoría a validar
   * @returns {boolean} - True si los datos son válidos, false en caso contrario
   */
  static validateCategory(categoryData) {
    try {
      // Verificar que los campos requeridos existen
      if (!categoryData.name || categoryData.name.trim() === "") {
        NotificationManager.warning("El nombre de la categoría es obligatorio");
        return false;
      }

      // Verificar longitud del nombre (por ejemplo, máximo 50 caracteres)
      if (categoryData.name.length > 50) {
        NotificationManager.warning("El nombre de la categoría no debe exceder los 50 caracteres");
        return false;
      }

      // Si la descripción existe, verificar su longitud (por ejemplo, máximo 200 caracteres)
      if (categoryData.description && categoryData.description.length > 200) {
        NotificationManager.warning("La descripción no debe exceder los 200 caracteres");
        return false;
      }

      return true;
    } catch (error) {
      NotificationManager.error(`Error al validar categoría: ${error.message}`);
      return false;
    }
  }

  /**
   * Crea una nueva categoría
   * @param {string} name - Nombre de la categoría
   * @param {string} description - Descripción de la categoría (opcional)
   * @returns {boolean} - Éxito de la operación
   */
  static createCategory(name, description = "") {
    try {
      const categoryData = {
        name,
        description,
        createdAt: new Date().toISOString()
      };

      return CrudGeneric.create(
        this.STORAGE_KEY,
        categoryData,
        this.validateCategory
      );
    } catch (error) {
      NotificationManager.error(`Error al crear categoría: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene todas las categorías
   * @returns {Array<Category>} - Array de objetos Category
   */
  static getAllCategories() {
    try {
      const categoriesData = CrudGeneric.readAll(this.STORAGE_KEY);

      // Convertir los datos planos a instancias de Category
      return categoriesData.map(data =>
        new Category(data.id, data.name, data.description, data.createdAt, data.updatedAt)
      );
    } catch (error) {
      NotificationManager.error(`Error al obtener categorías: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param {string} id - ID de la categoría
   * @returns {Category|null} - Objeto Category o null si no se encuentra
   */
  static getCategoryById(id) {
    try {
      const categoryData = CrudGeneric.readById(this.STORAGE_KEY, id);

      if (!categoryData) return null;

      return new Category(
        categoryData.id,
        categoryData.name,
        categoryData.description,
        categoryData.createdAt,
        categoryData.updatedAt
      );
    } catch (error) {
      NotificationManager.error(`Error al obtener categoría: ${error.message}`);
      return null;
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {string} id - ID de la categoría a actualizar
   * @param {Object} updateData - Datos para actualizar (name, description)
   * @returns {boolean} - Éxito de la operación
   */
  static updateCategory(id, updateData) {
    try {
      // Verificar si la categoría existe
      const existingCategory = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!existingCategory) {
        NotificationManager.error(`No se encontró la categoría con ID ${id}`);
        return false;
      }

      // Añadir timestamp de actualización
      updateData.updatedAt = new Date().toISOString();

      return CrudGeneric.update(
        this.STORAGE_KEY,
        id,
        updateData,
        "id",
        this.validateCategory
      );
    } catch (error) {
      NotificationManager.error(`Error al actualizar categoría: ${error.message}`);
      return false;
    }
  }

  /**
   * Elimina una categoría por su ID
   * @param {string} id - ID de la categoría a eliminar
   * @returns {boolean} - Éxito de la operación
   */
  static deleteCategory(id) {
    try {
      // Verificar si la categoría existe
      const category = CrudGeneric.readById(this.STORAGE_KEY, id);
      if (!category) {
        NotificationManager.error(`No se encontró la categoría con ID ${id}`);
        return false;
      }

      // Verificar si la categoría está siendo utilizada en algún producto
      const productsKey = "products"; // La clave donde se almacenan los productos
      const allProducts = CrudGeneric.readAll(productsKey) || [];

      const productsUsingCategory = allProducts.filter(product => product.categoryId === id);

      if (productsUsingCategory.length > 0) {
        NotificationManager.error(`No se puede eliminar la categoría porque está en uso por ${productsUsingCategory.length} producto(s)`);
        return false;
      }

      // Si no hay productos que usen esta categoría, proceder con la eliminación
      return CrudGeneric.delete(this.STORAGE_KEY, id);
    } catch (error) {
      NotificationManager.error(`Error al eliminar categoría: ${error.message}`);
      return false;
    }
  }

  /**
   * Busca categorías por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Array<Category>} - Array de objetos Category que coinciden
   */
  static searchCategories(searchTerm) {
    try {
      const results = CrudGeneric.search(this.STORAGE_KEY, {name: searchTerm});

      return results.map(data =>
        new Category(data.id, data.name, data.description)
      );
    } catch (error) {
      NotificationManager.error(`Error al buscar categorías: ${error.message}`);
      return [];
    }
  }
}

export {CategoryService};