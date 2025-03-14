class ExecuteManager {
  static execute(callback, successMessage = "Operación exitosa.", errorMessage = "Ocurrió un error:") {
    try {
      const result = callback();
      console.log(successMessage);
      return result;
    } catch (error) {
      console.error(`${errorMessage} ${error.message}`);
      return null;
    }
  }
}

export { ExecuteManager };