import { task } from "../models/task.js"
import { format } from "date-fns";
import priorityFlag from "../assets/icons/fi-rs-flag.svg"


export function taskRenderer(task) {
    const taskLi = document.createElement("li");
    taskLi.classList.add("project-view__task");
    taskLi.dataset.taskId = task.getId();

    const button = document.createElement("button");
    button.classList.add("project-view__task-button");

    const taskMain = document.createElement("div");
    taskMain.classList.add("project-view__task-main");

    const titleSpan = document.createElement("span");
    titleSpan.classList.add("project-view__task-title");
    titleSpan.textContent = task.getTitle();

    const completeSpan = document.createElement("span");
    completeSpan.classList.add("project-view__task-complete");
    taskMain.append(titleSpan, completeSpan);

    const taskDetails = document.createElement("div");
    taskDetails.classList.add("project-view__task-details");

    const dueDate = document.createElement("time");
    dueDate.classList.add("project-view__task-date");

    if (task.getDueDate() === "")
        dueDate.textContent = "No Due Date";
    else
        dueDate.textContent = format(task.getDueDate(), "MMMM d")

    const priority = document.createElement("img");
    priority.classList.add("project-view__task-priority",
        `task-priority__${task.getPriority()}`);
    priority.src = priorityFlag;
    priority.alt = "priority flag";


    taskDetails.append(dueDate, priority);

    button.append(taskMain, taskDetails);
    taskLi.append(button);

    return taskLi;
}