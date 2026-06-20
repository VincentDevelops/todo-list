
export function renderProjectTasks(project) {
    const todoCol = document.querySelector(`[data-list-type="todo"]`);
    const progCol = document.querySelector(`[data-list-type="progress"]`);
    const compCol = document.querySelector(`[data-list-type="completed"]`);

    todoCol.querySelectorAll(".project-view__task")
        .forEach(task => task.remove());

    progCol.querySelectorAll(".project-view__task")
        .forEach(task => task.remove());

    compCol.querySelectorAll(".project-view__task")
        .forEach(task => task.remove());

    if (project.getTodoList().size > 0)
        for (const task of project.getTodoList())
            todoCol.append(taskRenderer(task));


    if (project.getProgressList().size > 0)
        for (const task of project.getProgressList())
            progCol.append(taskRenderer(task))


    if (project.getCompletedList().size > 0)
        for (const task of project.getCompletedList())
            compCol.append(taskRenderer(task));
}