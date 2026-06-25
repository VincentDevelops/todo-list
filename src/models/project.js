import { Status } from "./status";
import {
    compareAsc, format, isToday,
    isWithinInterval, startOfToday,
    endOfDay, addDays,
    differenceInCalendarDays, parseISO
} from "date-fns";


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
    const contains = (taskId) =>
        todo.has(taskId) || progress.has(taskId) || completed.has(taskId);

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

    const getTodaysTasks = () => {
        const todaysTasks = new Map();
        for (const task of todo.values()) {
            if (task.getDueDate() === "") continue;

            if (isToday(parseISO(task.getDueDate())))
                todaysTasks.set(task.getId(), task);
        }
        for (const task of progress.values()) {
            if (task.getDueDate() === "") continue;

            if (isToday(parseISO(task.getDueDate())))
                todaysTasks.set(task.getId(), task);
        }
        for (const task of completed.values()) {
            if (task.getDueDate() === "") continue;

            if (isToday(parseISO(task.getDueDate())))
                todaysTasks.set(task.getId(), task);
        }

        return todaysTasks;
    }

    const getNextSevenDaysTasks = () => {
        const nextSevenTasks = new Map();
        const today = new Date();

        for (const task of todo.values()) {
            if (task.getDueDate() === "") continue;

            const diff = differenceInCalendarDays(parseISO(task.getDueDate()), today);

            if (diff >= 0 && diff <= 7)
                nextSevenTasks.set(task.getId(), task);
        }
        for (const task of progress.values()) {
            if (task.getDueDate() === "") continue;

            const diff = differenceInCalendarDays(parseISO(task.getDueDate()), today);

            if (diff >= 0 && diff <= 7)
                nextSevenTasks.set(task.getId(), task);
        }
        for (const task of completed.values()) {
            if (task.getDueDate() === "") continue;

            const diff = differenceInCalendarDays(parseISO(task.getDueDate()), today);

            if (diff >= 0 && diff <= 7)
                nextSevenTasks.set(task.getId(), task);
        }

        return nextSevenTasks;
    }

    const getAllTasks = () => {
        const allTasks = new Map();

        for (const task of todo.values()) {
            allTasks.set(task.getId(), task);
        }
        for (const task of progress.values()) {
            allTasks.set(task.getId(), task);
        }
        for (const task of completed.values()) {
            allTasks.set(task.getId(), task);
        }

        return allTasks;
    }

    //     const result = differenceInCalendarDays(
    //   new Date(2012, 6, 2, 0, 0),
    //   new Date(2011, 6, 2, 23, 0)
    // )
    // //=> 366
    // // How many calendar days are between
    // // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
    // const result = differenceInCalendarDays(
    //   new Date(2011, 6, 3, 0, 1),
    //   new Date(2011, 6, 2, 23, 59)
    // )
    //=> 1


    const moveTask = (thisTask) => {
        removeTask(thisTask.getId());
        addTask(thisTask);
    }

    return {
        getCompletedList, getProgressList, getTask, getTodoList,
        setColor, addTask, addTasks, addCompletedTask,
        addProgressTask, addTodoTask, removeTask,
        sortByDate, getTitle, getColor, getId, moveTask,
        getTodaysTasks, getNextSevenDaysTasks, getAllTasks,
        contains,
    }

}