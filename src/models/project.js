import { Status } from "./status";
import { compareAsc, format } from "date-fns";


export const project = (name) => {
    const id = crypto.randomUUID();
    let todo = new Map();
    let progress = new Map();
    let completed = new Map();

    let title = name;
    let color = "#FFFFFF";

    const getTask = (taskId) => {
        if (todo.has(taskId))
            return todo.get(taskId);
        else if (progress.has(taskId))
            return progress.get(taskId);
        else if (completed.has(taskId))
            return completed.get(taskId);
        else
            return null;
    }

    const getTodoList = () => todo;
    const getProgressList = () => progress;
    const getCompletedList = () => completed;
    const getId = () => id;
    const getTitle = () => title;
    const getColor = () => color;

    const setColor = (clr) => {
        color = clr;
    }

    const addTask = (task) => {
        if (task.getStatus() === Status.TODO)
            addTodoTask(task);
        else if (task.getStatus() === Status.PROGRESS)
            addProgressTask(task);
        else if (task.getStatus() === Status.COMPLETED)
            addCompletedTask(task);
    }

    const addTasks = (tasks = []) => {

        if (tasks === null)
            return;

        for (const task of tasks) {
            addTask(task);
        }
    }

    const addTodoTask = (task) => {
        todo.set(task.getId(), task);
    }

    const addProgressTask = (task) => {
        progress.set(task.getId(), task);
    }

    const addCompletedTask = (task) => {
        completed.set(task.getId(), task);
    }

    const removeTask = (taskId) => {
        if (todo.has(taskId)) {
            todo.delete(taskId);
        }
        else if (progress.has(taskId)) {
            progress.delete(taskId);

        } else if (completed.has(taskId)) {
            completed.delete(taskId);
        }
    }

    const sortByDate = () => {
        todo = new Map([...todo].sort((a, b) =>
            compareAsc(a[1].getDueDate(), b[1].getDueDate())
        ));

        progress = new Map([...progress].sort((a, b) =>
            compareAsc(a[1].getDueDate(), b[1].getDueDate())
        ));

        completed = new Map([...completed].sort((a, b) =>
            compareAsc(a[1].getDueDate(), b[1].getDueDate())
        ));
    }

    return {
        getCompletedList, getProgressList, getTask, getTodoList,
        setColor, addTask, addTasks, addCompletedTask,
        addProgressTask, addTodoTask, removeTask,
        sortByDate, getTitle, getColor,
    }

}