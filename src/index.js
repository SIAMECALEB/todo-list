// src/index.js
import "./styles.css"; // ✅ make sure CSS is bundled
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Todo from "./modules/todo";           // ✅ fixed (default import)
import Project from "./modules/project";     // ✅ correct (default import)
import { saveData, loadData } from "./modules/storage";  // ✅ correct (named exports)
import { renderProjects, renderTodos } from "./modules/ui"; // ✅ correct (named exports)

let projects = [];
let activeProjectId = null;
let filterDate = null;

// Load saved data
const savedData = loadData();
if (savedData) {
  projects = savedData.map(p => {
    const project = new Project(p.title);
    project.id = p.id;
    project.todos = p.todos.map(t => {
      const todo = new Todo(
        t.title,
        t.description,
        t.dueDate,
        t.priority,
        t.notes,
        t.checklist
      );
      todo.id = t.id;
      todo.completed = t.completed;
      return todo;
    });
    return project;
  });
  activeProjectId = projects[0]?.id;
} else {
  const defaultProject = new Project("Inbox");
  projects.push(defaultProject);
  activeProjectId = defaultProject.id;
}

// Core functions
function setActiveProject(id) {
  activeProjectId = id;
  updateUI();
}

function addProject(title) {
  const project = new Project(title);
  projects.push(project);
  saveData(projects);
  updateUI();
}

function addTodoToActiveProject(title, description, dueDate, priority) {
  const project = projects.find(p => p.id === activeProjectId);
  const todo = new Todo(title, description, dueDate, priority);
  project.addTodo(todo);
  saveData(projects);
  updateUI();
}

function deleteTodoFromActiveProject(todoId) {
  const project = projects.find(p => p.id === activeProjectId);
  project.removeTodo(todoId);
  saveData(projects);
  updateUI();
}

function updateUI() {
  renderProjects(projects, activeProjectId, setActiveProject);
  const activeProject = projects.find(p => p.id === activeProjectId);
  renderTodos(activeProject, deleteTodoFromActiveProject, filterDate);
}

// Add Todo modal
function showAddTodoForm() {
  const form = document.createElement("div");
  form.innerHTML = `
    <div class="modal">
      <h3>Add New Todo</h3>
      <label>Title: <input type="text" id="todo-title"></label><br>
      <label>Description: <textarea id="todo-desc"></textarea></label><br>
      <label>Due Date: <input type="text" id="todo-date"></label><br>
      <label>Priority:
        <select id="todo-priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label><br>
      <button id="save-todo">Save</button>
      <button id="cancel-todo">Cancel</button>
    </div>
  `;

  document.body.appendChild(form);

  flatpickr("#todo-date", {
    dateFormat: "Y-MM-dd",
    defaultDate: new Date(),
  });

  document.querySelector("#save-todo").addEventListener("click", () => {
    const title = document.querySelector("#todo-title").value;
    const description = document.querySelector("#todo-desc").value;
    const dueDate = document.querySelector("#todo-date").value;
    const priority = document.querySelector("#todo-priority").value;

    if (title) addTodoToActiveProject(title, description, dueDate, priority);
    form.remove();
  });

  document.querySelector("#cancel-todo").addEventListener("click", () => {
    form.remove();
  });
}

// Wait until DOM is ready before attaching listeners
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#add-project").addEventListener("click", () => {
    const title = prompt("Project name?");
    if (title) addProject(title);
  });

  document.querySelector("#add-todo").addEventListener("click", () => {
    showAddTodoForm();
  });

  // Inline calendar
  flatpickr("#calendar", {
    inline: true,
    defaultDate: new Date(),
    onChange: function (selectedDates) {
      filterDate = selectedDates.length ? selectedDates[0] : null;
      updateUI();
    },
  });

  // Initial render
  updateUI();
});

