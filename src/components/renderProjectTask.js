import { Status } from "../models/status";
import { renderProjectTasks } from "./renderProjectTasks";
import { taskRenderer } from "./taskRenderer";

export function renderProjectTask(task) {

    console.log("renderProjectTask status: " + task.getStatus());

    const todoCol = document.querySelector(`[data-list-type="todo"]`);
    const progCol = document.querySelector(`[data-list-type="progress"]`);
    const compCol = document.querySelector(`[data-list-type="completed"]`);

    const renderedTask = taskRenderer(task);
    const complete = renderedTask.querySelector(".project-view__task-complete")

    if (task.getStatus() === Status.TODO)
        todoCol.prepend(renderedTask);
    else if (task.getStatus() === Status.PROGRESS)
        progCol.prepend(renderedTask);
    else if (task.getStatus() === Status.COMPLETED) {
        complete.classList.add("project-view__task-complete--active")
        compCol.prepend(renderedTask);
    }


}