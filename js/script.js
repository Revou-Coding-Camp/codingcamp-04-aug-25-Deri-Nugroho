document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dueDate = document.getElementById('due-date');
    const todoList = document.getElementById('todo-list'); // tbody
    const deleteAllButton = document.getElementById('delete-all');

    let tasks = [];

    // Tambah task
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(todoInput.value, dueDate.value);
        form.reset();
    });

    // Hapus semua
    deleteAllButton.addEventListener('click', () => {
        tasks = [];
        renderTasks();
    });

    // Fungsi tambah task
    function addTask(task, date) {
        if (task.trim() === '' || date.trim() === '') return;

        const newTask = { task, date, completed: false };
        tasks.push(newTask);
        renderTasks();
    }

    // Render ke tabel
    function renderTasks(filter = 'all') {
        todoList.innerHTML = '';

        if (tasks.length === 0) {
            todoList.innerHTML = `
                <tr>
                    <td colspan="4" class="no-task">No task found</td>
                </tr>
            `;
            return;
        }

        tasks.forEach((taskObj, index) => {
            if (filter === 'completed' && !taskObj.completed) return;
            if (filter === 'pending' && taskObj.completed) return;

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${taskObj.task}</td>
                <td>${taskObj.date}</td>
                <td style="color:${taskObj.completed ? '#5dff8f' : '#ff7b7b'}">
                    ${taskObj.completed ? 'Completed' : 'Pending'}
                </td>
                <td>
                    <button class="btn-action complete" onclick="toggleComplete(${index})">
                        ${taskObj.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn-action delete" onclick="deleteTask(${index})">
                        Delete
                    </button>
                </td>
            `;
            todoList.appendChild(tr);
        });
    }

    // Toggle selesai
    window.toggleComplete = function (index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    };

    // Hapus task
    window.deleteTask = function (index) {
        tasks.splice(index, 1);
        renderTasks();
    };

    // Filter
    document.getElementById('filter-all').addEventListener('click', () => renderTasks('all'));
    document.getElementById('filter-pending').addEventListener('click', () => renderTasks('pending'));
    document.getElementById('filter-completed').addEventListener('click', () => renderTasks('completed'));

    // Render awal
    renderTasks();
});
