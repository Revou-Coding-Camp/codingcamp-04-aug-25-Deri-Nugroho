document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("todo-input");
    const dueDate = document.getElementById("due-date");
    const addBtn = document.getElementById("add-btn");
    const todoList = document.getElementById("todo-list");
    const deleteAllBtn = document.getElementById("delete-all");
    const searchInput = document.getElementById("search-input");

    const totalTasksEl = document.getElementById("total-tasks");
    const completedTasksEl = document.getElementById("completed-tasks");
    const pendingTasksEl = document.getElementById("pending-tasks");
    const progressEl = document.getElementById("progress");
    const progressBar = document.getElementById("progress-bar");

    let tasks = [];

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
        progressEl.textContent = `${progress}%`;
        progressBar.style.width = `${progress}%`;
    }

    function renderTasks(filterText = "") {
        todoList.innerHTML = "";

        if (tasks.length === 0) {
            todoList.innerHTML = `<tr><td colspan="4" class="no-task">No task found</td></tr>`;
            return;
        }

        tasks
            .filter(task => task.task.toLowerCase().includes(filterText.toLowerCase()))
            .forEach((taskObj, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td style="${taskObj.completed ? 'text-decoration: line-through; opacity:0.6;' : ''}">${taskObj.task}</td>
                    <td>${taskObj.date}</td>
                    <td><span class="status-label ${taskObj.completed ? 'status-completed' : 'status-pending'}">${taskObj.completed ? 'Completed' : 'Pending'}</span></td>
                    <td>
                        <button class="action-btn action-edit" onclick="editTask(${index})">✏</button>
                        <button class="action-btn action-complete" onclick="toggleComplete(${index})">✔</button>
                        <button class="action-btn action-delete" onclick="deleteTask(${index})">🗑</button>
                    </td>
                `;
                todoList.appendChild(tr);
            });

        updateStats();
    }

    addBtn.addEventListener("click", () => {
        const taskText = todoInput.value.trim();
        const dateValue = dueDate.value;

        if (!taskText || !dateValue) return alert("Please fill all fields");

        tasks.push({ task: taskText, date: dateValue, completed: false });
        todoInput.value = "";
        dueDate.value = "";
        renderTasks();
    });

    deleteAllBtn.addEventListener("click", () => {
        tasks = [];
        renderTasks();
    });

    searchInput.addEventListener("input", () => {
        renderTasks(searchInput.value);
    });

    window.toggleComplete = (index) => {
        tasks[index].completed = !tasks[index].completed;
        renderTasks(searchInput.value);
    };

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        renderTasks(searchInput.value);
    };

    window.editTask = (index) => {
        const newTask = prompt("Edit task:", tasks[index].task);
        if (newTask !== null) {
            tasks[index].task = newTask.trim();
            renderTasks(searchInput.value);
        }
    };

    renderTasks();
});
