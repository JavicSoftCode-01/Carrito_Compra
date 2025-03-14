class User {
  constructor(id, username, email, role = "cliente") {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }

  // Método de autenticación (simulado)
  authenticate(password) {
    // Aquí implementarías la lógica real de autenticación
    return password === "secreto"; // Solo para ejemplo
  }

  // Método para actualizar el perfil del usuario
  updateProfile(newData) {
    this.username = newData.username || this.username;
    this.email = newData.email || this.email;
    // Podrías agregar más propiedades
  }

  // Método para mostrar información del usuario
  getInfo() {
    return `Usuario: ${this.username} (${this.email}) - Rol: ${this.role}`;
  }
}

export default User;
