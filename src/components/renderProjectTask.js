import { Status } from "../models/status";
import { taskRenderer } from "./taskRenderer";

export function renderProjectTask(task) {

    console.log("renderProjectTask status: " + task.getStatus());

    const todoCol = document.querySelector(`[data-list-type="todo"]`);
    const progCol = document.querySelector(`[data-list-type="progress"]`);
    const compCol = document.querySelector(`[data-list-type="completed"]`);


    if (task.getStatus() === Status.TODO)
        todoCol.prepend(taskRenderer(task));
    else if (task.getStatus() === Status.PROGRESS)
        progCol.prepend(taskRenderer(task));
    else if (task.getStatus() === Status.COMPLETED)
        compCol.prepend(taskRenderer(task));
}