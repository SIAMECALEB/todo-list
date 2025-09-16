import { parseISO, format, formatDistanceToNow, isSameDay, isValid } from "date-fns";

let todoChart = null; // hold chart instance

export function renderProjects(projects, activeProjectId, setActiveProject) {
  const projectList = document.querySelector("#project-list");
  projectList.innerHTML = "";

  projects.forEach(project => {
    const li = document.createElement("li");
    li.textContent = project.title;
    if (project.id === activeProjectId) li.classList.add("active");

    li.addEventListener("click", () => setActiveProject(project.id));
    projectList.appendChild(li);
  });
}

export function renderTodos(project, deleteTodo, filterDate) {
  const todoList = document.querySelector("#todo-list");
  todoList.innerHTML = "";

  if (!project) return;

  let priorityCounts = { high: 0, medium: 0, low: 0 };

  project.todos.forEach(todo => {
    let parsedDate = null;

    if (todo.dueDate) {
      const attempt = parseISO(todo.dueDate);
      if (isValid(attempt)) parsedDate = attempt;
    }

    // ✅ Filter by selected calendar date
    if (filterDate && (!parsedDate || !isSameDay(parsedDate, filterDate))) {
      return;
    }

    const li = document.createElement("li");

    // ✅ Handle safe date formatting
    let dueDisplay = "No date";
    if (parsedDate) {
      try {
        const prettyDate = format(parsedDate, "MMM d, yyyy");
        const relative = formatDistanceToNow(parsedDate, { addSuffix: true });
        dueDisplay = `${prettyDate} (${relative})`;
      } catch {
        dueDisplay = "Invalid date";
      }
    }

    li.textContent = `${todo.title} → Due: ${dueDisplay}`;

    // Priority badge
    const badge = document.createElement("span");
    badge.classList.add("badge", todo.priority);
    badge.textContent = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);

    // Track for chart
    if (priorityCounts[todo.priority] !== undefined) {
      priorityCounts[todo.priority]++;
    }

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", e => {
      e.stopPropagation();
      deleteTodo(todo.id);
    });

    li.appendChild(badge);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });

  // ✅ Render chart
  renderChart(priorityCounts);
}

function renderChart(priorityCounts) {
  const ctx = document.getElementById("todoChart").getContext("2d");

  if (todoChart) {
    todoChart.destroy(); // prevent duplicate charts
  }

  todoChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["High", "Medium", "Low"],
      datasets: [{
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: ["#e74c3c", "#f39c12", "#27ae60"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}
