import "./styles/modern-normalize.css";
import "./styles/sidebar.css";
import "./styles/style.css";
import "./styles/toolbar.css";
import "./styles/projectView.css";
import "./styles/task-form.css"
import { Status } from "./models/status.js"
import { Priority } from "./models/priority.js"
import { task } from "./models/task.js"
import { project } from "./models/project.js"
import { taskRenderer } from "./components/TaskRenderer.js";
import { projectRenderer } from "./components/projectRenderer.js";


const myProj = project("myProj");

const todoTask = task("todo Task");
todoTask.setDueDate(new Date("December 3, 1995"))

const progTask = task("progress Task");
progTask.setDueDate(new Date("March 3, 1995"));

const completeTask = task("complete task");
completeTask.setDueDate(new Date("January 1, 2002"));

myProj.addTasks([completeTask, todoTask, progTask,]);

console.log(myProj);
console.log(myProj.getTodoList());
console.log(myProj.getProgressList());
console.log(myProj.getCompletedList());

const todoID = completeTask.getId();

console.log(myProj);

myProj.sortByDate();
myProj.setColor("#27F5E0")

console.log(myProj);

console.log(myProj);
console.log(myProj.getTodoList());
console.log(myProj.getProgressList());
console.log(myProj.getCompletedList());

const renderer = taskRenderer(todoTask);

const list = document.querySelector(`[data-list-type="todo"]`);
list.prepend(renderer);

console.log(list);
console.log(renderer);

const projectSidebar = document.querySelector(".sidebar__project-list");

const projectL = projectRenderer(myProj);

projectSidebar.prepend(projectL);

console.log(projectSidebar);
console.log(projectL);




