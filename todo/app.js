const STORAGE_KEY = "todo-app-items";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const emptyMessage = document.getElementById("emptyMessage");
const filterBtns = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function render() {
  const filtered = getFilteredTodos();
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  todoList.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} aria-label="标记完成">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="btn-delete" aria-label="删除任务">×</button>
    `;

    const checkbox = li.querySelector(".todo-checkbox");
    const deleteBtn = li.querySelector(".btn-delete");

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    todoList.appendChild(li);
  });

  const showEmpty = filtered.length === 0;
  emptyState.classList.toggle("visible", showEmpty);

  if (showEmpty) {
    if (todos.length === 0) {
      emptyMessage.textContent = "还没有任务，添加一个开始吧";
    } else if (currentFilter === "active") {
      emptyMessage.textContent = "没有进行中的任务";
    } else if (currentFilter === "completed") {
      emptyMessage.textContent = "还没有已完成的任务";
    }
  }

  taskCount.textContent =
    activeCount === 0 ? "全部完成 🎉" : `${activeCount} 项待办`;

  clearCompletedBtn.hidden = completedCount === 0;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
todoInput.focus();
