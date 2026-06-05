const STORAGE_KEY = "todo-app-items";

const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const emptyState = document.querySelector("#emptyState");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.querySelector("#clearCompleted");
const doneCount = document.querySelector("#doneCount");
const todayLabel = document.querySelector("#todayLabel");

let todos = loadTodos();
let currentFilter = "all";

todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) return;

  todos.unshift({
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  todoInput.value = "";
  saveAndRender();
});

todoList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = button.closest(".todo-item");
  const id = item?.dataset.id;
  if (!id) return;

  if (button.dataset.action === "toggle") {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  }

  if (button.dataset.action === "delete") {
    todos = todos.filter((todo) => todo.id !== id);
  }

  saveAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveAndRender();
});

render();

function render() {
  const visibleTodos = getVisibleTodos();
  const completedCount = todos.filter((todo) => todo.completed).length;

  doneCount.textContent = completedCount;
  clearCompletedButton.disabled = completedCount === 0;
  emptyState.hidden = visibleTodos.length > 0;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  todoList.innerHTML = visibleTodos.map(createTodoMarkup).join("");
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function createTodoMarkup(todo) {
  const checkedIcon = todo.completed
    ? '<path d="m7 12 3 3 7-7" />'
    : '<path d="M12 6v12M6 12h12" />';

  return `
    <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
      <button class="icon-button check" type="button" data-action="toggle" aria-label="${
        todo.completed ? "标记为待办" : "标记为完成"
      }">
        <svg viewBox="0 0 24 24" aria-hidden="true">${checkedIcon}</svg>
      </button>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="icon-button delete" type="button" data-action="delete" aria-label="删除任务">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M10 11v6M14 11v6" />
          <path d="M5 6l1 14h12l1-14" />
        </svg>
      </button>
    </li>
  `;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function loadTodos() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}
