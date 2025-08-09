// js/script.js (BUG-FIXED version)
document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("todo-input");
    const dueDate = document.getElementById("due-date");
    const prioritySelect = document.getElementById("priority");
    const categoryInput = document.getElementById("category");
    const addBtn = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");
    const deleteAllBtn = document.getElementById("delete-all");
    const searchInput = document.getElementById("search-input");
    const filterStatus = document.getElementById("filter-status");
    const sortBy = document.getElementById("sort-by");
  
    const totalTasksEl = document.getElementById("total-tasks");
    const completedTasksEl = document.getElementById("completed-tasks");
    const pendingTasksEl = document.getElementById("pending-tasks");
    const progressEl = document.getElementById("progress");
    const progressBar = document.getElementById("progress-bar");
  
    // load from localStorage (if ada)
    let tasks = JSON.parse(localStorage.getItem("tasks_v1")) || [];
  
    function saveTasks() {
      localStorage.setItem("tasks_v1", JSON.stringify(tasks));
    }
  
    function updateStats() {
      const total = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;
      const pending = total - completed;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
      totalTasksEl.textContent = total;
      completedTasksEl.textContent = completed;
      pendingTasksEl.textContent = pending;
      progressEl.textContent = `${progress}%`;
      progressBar.style.width = `${progress}%`;
    }
  
    function createActionButton(label, cls, handler) {
      const btn = document.createElement("button");
      btn.className = cls;
      btn.type = "button";
      btn.innerHTML = label;
      btn.addEventListener("click", handler);
      return btn;
    }
  
    // Move task in tasks[] by id (fromId -> insert before toId)
    function moveTaskById(fromId, toId) {
      const fromIdx = tasks.findIndex((t) => t.id === fromId);
      const toIdx = tasks.findIndex((t) => t.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      const [moved] = tasks.splice(fromIdx, 1);
      tasks.splice(toIdx, 0, moved);
      saveTasks();
    }
  
    // Append dragged task to end (drop on empty area)
    function appendTaskById(fromId) {
      const fromIdx = tasks.findIndex((t) => t.id === fromId);
      if (fromIdx === -1) return;
      const [moved] = tasks.splice(fromIdx, 1);
      tasks.push(moved);
      saveTasks();
    }
  
    function renderTasks() {
      let filteredTasks = [...tasks];
  
      // Filter status
      if (filterStatus && filterStatus.value !== "all") {
        filteredTasks = filteredTasks.filter((task) =>
          filterStatus.value === "completed" ? task.completed : !task.completed
        );
      }
  
      // Search filter
      const searchText = (searchInput && searchInput.value || "").toLowerCase();
      if (searchText) {
        filteredTasks = filteredTasks.filter((t) =>
          t.task.toLowerCase().includes(searchText) ||
          (t.category || "").toLowerCase().includes(searchText)
        );
      }
  
      // Sort
      if (sortBy && sortBy.value === "date") {
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy && sortBy.value === "priority") {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        filteredTasks.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
      }
  
      todoList.innerHTML = "";
  
      if (filteredTasks.length === 0) {
        todoList.innerHTML = `<tr><td colspan="6" class="no-task">No task found</td></tr>`;
        updateStats();
        return;
      }
  
      filteredTasks.forEach((taskObj) => {
        const tr = document.createElement("tr");
        tr.draggable = true;
        tr.dataset.id = taskObj.id; // store unique id on row
  
        tr.innerHTML = `
          <td style="${taskObj.completed ? 'text-decoration: line-through; opacity:0.6;' : ''}">${escapeHtml(taskObj.task)}</td>
          <td>${escapeHtml(taskObj.date)}</td>
          <td class="priority-${(taskObj.priority||'Medium').toLowerCase()}">${escapeHtml(taskObj.priority || 'Medium')}</td>
          <td>${escapeHtml(taskObj.category || '-')}</td>
          <td><span class="status-label ${taskObj.completed ? 'status-completed' : 'status-pending'}">${taskObj.completed ? 'Completed' : 'Pending'}</span></td>
        `;
  
        // actions cell
        const tdActions = document.createElement("td");
        // edit
        const btnEdit = createActionButton("✏", "action-btn action-edit", () => editTaskById(taskObj.id));
        // complete/undo
        const btnComplete = createActionButton("✔", "action-btn action-complete", () => toggleCompleteById(taskObj.id));
        // delete
        const btnDelete = createActionButton("🗑", "action-btn action-delete", () => deleteTaskById(taskObj.id));
  
        tdActions.appendChild(btnEdit);
        tdActions.appendChild(btnComplete);
        tdActions.appendChild(btnDelete);
        tr.appendChild(tdActions);
  
        // drag events on row
        tr.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", taskObj.id);
          tr.classList.add("dragging");
        });
        tr.addEventListener("dragend", () => {
          tr.classList.remove("dragging");
          // after dragend we already updated tasks during drop handler (see below), just re-render
          renderTasks();
        });
  
        // allow drop on row -> place dragged before this target
        tr.addEventListener("dragover", (e) => {
          e.preventDefault();
          tr.classList.add("drag-over");
        });
        tr.addEventListener("dragleave", () => tr.classList.remove("drag-over"));
        tr.addEventListener("drop", (e) => {
          e.preventDefault();
          tr.classList.remove("drag-over");
          const draggedId = e.dataTransfer.getData("text/plain");
          const targetId = tr.dataset.id;
          if (!draggedId) return;
          // move element in tasks array by id
          moveTaskById(draggedId, targetId);
          saveTasks();
          renderTasks();
        });
  
        todoList.appendChild(tr);
      });
  
      updateStats();
    }
  
    // drop on empty area -> append to end
    todoList.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    todoList.addEventListener("drop", (e) => {
      // if dropped directly on tbody (not on a row), append
      const targetRow = e.target.closest("tr");
      if (!targetRow) {
        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId) {
          appendTaskById(draggedId);
          renderTasks();
        }
      }
    });
  
    // Action helpers by id
    function toggleCompleteById(id) {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return;
      tasks[idx].completed = !tasks[idx].completed;
      saveTasks();
      renderTasks();
    }
  
    function deleteTaskById(id) {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return;
      tasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    }
  
    function editTaskById(id) {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return;
      const newTask = prompt("Edit task:", tasks[idx].task);
      if (newTask !== null && newTask.trim() !== "") {
        tasks[idx].task = newTask.trim();
        saveTasks();
        renderTasks();
      }
    }
  
    // Create a new task (with unique id)
    addBtn.addEventListener("click", () => {
      const taskText = (todoInput.value || "").trim();
      const dateValue = (dueDate.value || "").trim();
      const priorityValue = prioritySelect ? prioritySelect.value : "Medium";
      const categoryValue = categoryInput ? categoryInput.value.trim() : "";
  
      if (!taskText || !dateValue) {
        return alert("Please fill in task and date");
      }
  
      const newTask = {
        id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
        task: taskText,
        date: dateValue,
        priority: priorityValue,
        category: categoryValue,
        completed: false
      };
  
      tasks.push(newTask);
      saveTasks();
      todoInput.value = "";
      dueDate.value = "";
      if (categoryInput) categoryInput.value = "";
      renderTasks();
    });
  
    deleteAllBtn.addEventListener("click", () => {
      if (!confirm("Delete all tasks?")) return;
      tasks = [];
      saveTasks();
      renderTasks();
    });
  
    searchInput && searchInput.addEventListener("input", renderTasks);
    filterStatus && filterStatus.addEventListener("change", renderTasks);
    sortBy && sortBy.addEventListener("change", renderTasks);
  
    // simple html escape for safety
    function escapeHtml(str) {
      if (!str && str !== 0) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  
    // initial render
    renderTasks();
  });
  