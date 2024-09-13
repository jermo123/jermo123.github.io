document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = tasks.map(task => `<li>${task} <button class="removeTaskBtn">Remove</button></li>`).join('');
    };

    const saveTask = (task) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const removeTask = (task) => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(t => t !== task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    };

    addTaskBtn.addEventListener('click', () => {
        const task = taskInput.value.trim();
        if (task) {
            saveTask(task);
            taskInput.value = '';
            loadTasks();
        }
    });

    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('removeTaskBtn')) {
            const taskItem = event.target.parentElement;
            const task = taskItem.textContent.replace(' Remove', '');
            removeTask(task);
        }
    });

    loadTasks();
});
