// src/modules/todo.js
export default class Todo {
  constructor(title, description, dueDate, priority = "low", notes = "", checklist = []) {
    this.id = Date.now().toString();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.checklist = checklist;
    this.completed = false;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  update(details) {
    Object.assign(this, details);
  }
}
