import { Priority } from "./priority";
import { Status } from "./status"

export const task = (newTitle) => {
    const id = crypto.randomUUID();
    let title = newTitle;
    let description = "";
    let dueDate = "";
    let status = Status.TODO;
    let priority = Priority.LOW;
    let project = null;

    const getId = () => id;
    const getTitle = () => title
    const getDescription = () => description;
    const getDueDate = () => dueDate;
    const getStatus = () => status;
    const getProject = () => project;
    const getPriority = () => priority;

    const setTitle = (newTitle) => {
        title = newTitle;
    }

    const setDescription = (newDesc) => {
        description = newDesc;
    }

    const setDueDate = (newDue) => {
        dueDate = newDue;
    }

    const setStatus = (newStat) => {
        status = newStat;
    }

    const setPriority = (pri) => {
        priority = pri;
    }

    const setProject = (proj) => {
        project = proj;
    }

    const toJSON = () => {
        return {
            id,
            title,
            dueDate,
            priority,
            status,
            description
        }
    }

    return {
        getDescription, getDueDate, getId, getProject, getStatus, getTitle,
        getPriority, setDescription, setDueDate, setPriority, setStatus, setTitle,
        setProject, toJSON,
    }

}