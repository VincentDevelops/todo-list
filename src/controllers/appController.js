import { projectRenderer } from "../components/projectRenderer";
import { renderProjectTask } from "../components/renderProjectTask";
import { renderProjectTasks } from "../components/renderProjectTasks";
import { Priority } from "../models/priority";
import { project } from "../models/project";
import { Status } from "../models/status";
import { task } from "../models/task";

(function () {

    const taskForm = document.querySelector(".task-form")
    const taskFormTaskTitle = document.querySelector(".task-form__title-input");
    const taskFormProjectSelectList = document.querySelector(".task-form__project-list");
    const taskFormDueDate = document.querySelector(".task-form__date-wrapper");
    const taskFormPrioritySelectList = document.querySelector(".task-form__priority");
    const taskFormStatusSelectList = document.querySelector(".task-form__status");
    const taskFormCreateTaskButton = document.querySelector(".task-form__create-task");
    const taskFormCancelTaskButton = document.querySelector(".task-form__collapse-form");

    const sidebarProjectList = document.querySelector(".sidebar__project-list");
    const sidebarNewProjectButton = document.querySelector(".sidebar__new-project-button");
    const sidebarNewProjectInput = document.querySelector(".sidebar__new-project-input");
    const sidebarNewProjectButtonTitle = document.querySelector(".sidebar__new-project-title");

    const toolbarProjectList = document.querySelector(".toolbar__project-list");
    const toolbarAddTaskButton = document.querySelector(".toolbar__add-task-button");

    const todoCol = document.querySelector(`[data-list-type="todo"]`)
    const progCol = document.querySelector(`[data-list-type="progress"]`)
    const compCol = document.querySelector(`[data-list-type="complete"]`)

    const columnAddTaskButtons = document.querySelectorAll(".project-view__new-task-button");

    const work = project("test");

    const projects = new Map();
    let stagedProject = work;

    projects.set(work.getId(), work);
    renderProjectTasks(work);


    function hideTaskForm() {
        taskForm.reset();
        taskForm.classList.add("hide");
    }

    function showTaskForm() {
        taskForm.classList.remove("hide");
    }

    function showSidebarInput() {
        sidebarNewProjectInput.classList.remove("hide");
        sidebarNewProjectButtonTitle.classList.add("hide");
    }

    function hideSidebarInput() {
        sidebarNewProjectInput.classList.add("hide");
        sidebarNewProjectButtonTitle.classList.remove("hide");
    }

    // adds a new project to the list 
    function initListsWithProject(project) {

        console.log("in initlists");

        const toolbarOption = document.createElement("option");
        toolbarOption.classList.add("toolbar__title-option");
        toolbarOption.value = project.getTitle();
        toolbarOption.textContent = project.getTitle();
        toolbarOption.dataset.projectId = project.getId();

        const taskFormOption = document.createElement("option");
        taskFormOption.classList.add("toolbar__title-option");
        taskFormOption.value = project.getTitle();
        taskFormOption.textContent = project.getTitle();
        taskFormOption.dataset.projectId = project.getId();

        taskFormProjectSelectList.prepend(taskFormOption);
        taskFormProjectSelectList.value = project.getTitle();

        toolbarProjectList.prepend(toolbarOption);
        toolbarProjectList.value = project.getTitle();
        console.log(taskFormProjectSelectList.value);
    }


    // renders a project to the stage
    function renderNewProject(project) {
        const title = sidebarNewProjectInput.value;

        initListsWithProject(project);

        const newProjElement = projectRenderer(project);

        newProjElement.addEventListener('click', () => {
            const proj = projects.get(newProjElement.dataset.projectId);
            switchProjectTo(proj);
        });

        sidebarProjectList.prepend(newProjElement);

        hideSidebarInput();
    }

    // sets up task for depending on selected project on stage
    function initTaskForm(button) {

        if (button) {
            if (button.dataset.statusColumn) {
                taskFormStatusSelectList.value = button.dataset.statusColumn;
            }
        }

        taskFormProjectSelectList.value = stagedProject.getTitle();

        showTaskForm();
    }

    // renders page with the project passed in
    function switchProjectTo(project) {
        stagedProject = project;
        renderProjectTasks(project);
        toolbarProjectList.value = project.getTitle();
        taskFormProjectSelectList.value = project.getTitle();
    }

    toolbarAddTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();
        initTaskForm(event.target);
    })

    columnAddTaskButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            initTaskForm(button);

        });
    });

    document.querySelector(".new-task__collapse").addEventListener('click', () => {
        hideTaskForm();
    })

    document.querySelector(".task-form__collapse-form").addEventListener('click', () => {
        hideTaskForm();
    })

    sidebarNewProjectButton.addEventListener('click', () => {
        showSidebarInput();
    })

    // creates a new project, sets it to the stage
    // and renders it to the screen immediately
    sidebarNewProjectButton.addEventListener("keypress", (event) => {

        if (event.key !== "Enter")
            return;

        const newProjTitle = sidebarNewProjectInput.value;

        if (newProjTitle === "") {
            sidebarNewProjectInput.placeholder = "Enter a title...";
            return;
        }

        const newProj = project(newProjTitle);
        projects.set(newProj.getId(), newProj);

        sidebarNewProjectInput.placeholder = "";
        sidebarNewProjectInput.value = "";

        renderNewProject(newProj);
        switchProjectTo(newProj);
    })

    // changes project on list select
    toolbarProjectList.addEventListener('change', (event) => {
        const selectedProject = toolbarProjectList.options[toolbarProjectList.selectedIndex];
        const selectedProjectId = selectedProject.dataset.projectId;

        const newProj = projects.get(selectedProjectId);
        switchProjectTo(newProj);
    })


    // create a task and add it to its appropriate project
    // and render it to the screen if necessary
    taskFormCreateTaskButton.addEventListener('click', () => {
        const title = taskFormTaskTitle.value;

        if (title === "") {
            taskFormTaskTitle.placeholder = "Enter a title...";
            return;
        }



    })

    // closes form when open, and a click outside the form occurs
    document.addEventListener("click", (event) => {
        if (
            !taskForm.classList.contains("hide") &&
            !taskForm.contains(event.target)
        ) {
            taskForm.reset();
            initTaskForm(null);
            taskForm.classList.add("hide");
        }
    });




})();