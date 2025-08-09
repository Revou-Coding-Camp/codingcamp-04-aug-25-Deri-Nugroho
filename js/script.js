document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const dueDate = document.getElementById('due-date');
    const todoList = document.getElementById('todo-list');
    const deleteAllButton = document.getElementById('delete-all');
    const totalTasks = document.getElementById('total-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const pendingTasks = document.getElementById('pending-tasks');
    const progress = document.getElementById('progress');

    let tasks = [];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(todoInput.value, dueDate.value);
        form.reset();
    });

    deleteAllButton.addEventListener('click', () => {
        todoList.innerHTML = '';
        tasks = [];
        updateStats();
    });

    function addTask(task, date) {
        if (task === '') return;

        const newTask = { task, date, completed: false };
        tasks.push(newTask);
        renderTasks();
        updateStats();
    }

    function renderTasks(filter = 'all') {
        todoList.innerHTML = '';
        tasks.forEach((taskObj, index) => {
            if (filter === 'completed' && !taskObj.completed) return;
            if (filter === 'pending' && taskObj.completed) return;

            const li = document.createElement('li');
            li.innerHTML = `${taskObj.task} - Due: ${taskObj.date} 
                            <button onclick="toggleComplete(${index})">${taskObj.completed ? 'Undo' : 'Complete'}</button>
                            <button onclick="deleteTask(${index})">Delete</button>`;
            todoList.appendChild(li);
        });
    }

    window.toggleComplete = function(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
        updateStats();
    }

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        renderTasks();
        updateStats();
    }

    function updateStats() {
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = tasks.filter(task => task.completed).length;
        pendingTasks.textContent = tasks.filter(task => !task.completed).length;
        progress.textContent = tasks.length ? `${((completedTasks.textContent / totalTasks.textContent) * 100).toFixed(0)}%` : '0%';
    }

    document.getElementById('filter-all').addEventListener('click', () => renderTasks('all'));
    document.getElementById('filter-pending').addEventListener('click', () => renderTasks('pending'));
    document.getElementById('filter-completed').addEventListener('click', () => renderTasks('completed'));
});
