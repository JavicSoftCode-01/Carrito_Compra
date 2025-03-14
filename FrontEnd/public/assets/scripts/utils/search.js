import {ExecuteManager} from "../../../../../BackEnd/src/utils/execute.js";
import {NotificationManager} from "./showNotifications.js";

class PurchaseManager {

  // Propiedad estaticada de los Campos de búsqueda predeterminados para la aplicación.
  static searchFields = ['name', 'description'];

  /**
   * 🔰 Método para buscar en los registros según términos y campos específicos. 🔰
   */
  static search(data, searchTerm, searchFields = this.searchFields, options = {matchType: 'includes'}) {
    return ExecuteManager.execute(() => {
      if (!Array.isArray(data) || data.length === 0) {
        NotificationManager.info("No hay datos disponibles para buscar");
        return [];
      }

      if (!searchTerm?.trim()) {
        return data;
      }

      const {matchType} = options;
      const lowerSearchTerm = searchTerm.toString().toLowerCase();

      return data.filter(item => searchFields.some(field => {
        const fieldValue = item[field]?.toString().toLowerCase();
        if (!fieldValue) return false;

        return matchType === 'exact' ? fieldValue === lowerSearchTerm : fieldValue.includes(lowerSearchTerm);
      }));
    }, "Exito! Al realizar la búsqueda.", "Error! Al realizar la búsqueda:");
  }
}

export {PurchaseManager};