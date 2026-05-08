const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskStatus = document.getElementById("taskStatus");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const navButtons = document.querySelectorAll(".nav-btn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

let currentFilter = "all";
let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [
  {
    id: crypto.randomUUID(),
    title: "Design landing page",
    date: "2026-05-10",
    priority: "high",
    status: "progress",
    createdAt: Date.now() - 5000
  },
  {
    id: crypto.randomUUID(),
    title: "Fix login validation",
    date: "2026-05-12",
    priority: "medium",
    status: "todo",
    createdAt: Date.now() - 4000
  },
  {
    id: crypto.randomUUID(),
    title: "Deploy project",
    date: "2026-05-15",
    priority: "low",
    status: "done",
    createdAt: Date.now() - 3000
  }
];

document.getElementById("todayText").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

taskDate.min = new Date().toISOString().split("T")[0];

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function updateStats() {
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("todoTasks").textContent = tasks.filter(task => task.status === "todo").length;
  document.getElementById("progressTasks").textContent = tasks.filter(task => task.status === "progress").length;
  document.getElementById("doneTasks").textContent = tasks.filter(task => task.status === "done").length;
}

function getPriorityValue(priority) {
  return { high: 3, medium: 2, low: 1 }[priority];
}

function formatStatus(status) {
  return {
    todo: "To Do",
    progress: "In Progress",
    done: "Done"
  }[status];
}

function getFilteredTasks() {
  const query = searchInput.value.toLowerCase().trim();

  let filtered = tasks.filter(task => {
    const matchesFilter = currentFilter === "all" || task.status === currentFilter;
    const matchesSearch = task.title.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const sortBy = sortSelect.value;

  filtered.sort((a, b) => {
    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "oldest") return a.createdAt - b.createdAt;
    if (sortBy === "priority") return getPriorityValue(b.priority) - getPriorityValue(a.priority);
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    return 0;
  });

  return filtered;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";
  emptyState.style.display = filteredTasks.length ? "none" : "block";

  filteredTasks.forEach(task => {
    const card = document.createElement("article");
    card.className = "task-card";

    card.innerHTML = `
      <div>
        <h3>${task.title}</h3>
        <div class="meta">
          <span>Due: ${task.date}</span>
          <span class="badge ${task.priority}">${task.priority}</span>
          <span>Status: ${formatStatus(task.status)}</span>
        </div>
      </div>

      <div class="actions">
        <button title="Move status" onclick="changeStatus('${task.id}')">🔁</button>
        <button title="Delete task" onclick="deleteTask('${task.id}')">🗑️</button>
      </div>
    `;

    taskList.appendChild(card);
  });

  updateStats();
}

function addTask(event) {
  event.preventDefault();

  const newTask = {
    id: crypto.randomUUID(),
    title: taskTitle.value.trim(),
    date: taskDate.value,
    priority: taskPriority.value,
    status: taskStatus.value,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskPriority.value = "medium";
  showToast("Task added successfully");
}

function changeStatus(id) {
  tasks = tasks.map(task => {
    if (task.id !== id) return task;

    const nextStatus = {
      todo: "progress",
      progress: "done",
      done: "todo"
    }[task.status];

    return { ...task, status: nextStatus };
  });

  saveTasks();
  renderTasks();
  showToast("Task status updated");
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showToast("Task deleted");
}

taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", renderTasks);
sortSelect.addEventListener("change", renderTasks);

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("taskflow-theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("taskflow-theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

renderTasks();
