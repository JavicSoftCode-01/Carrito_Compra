class Category {
  constructor(id, name, description, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

export {Category};