import { projectRenderer } from "../components/projectRenderer";
import { renderProjectTask } from "../components/renderProjectTask";
import { renderProjectTasks } from "../components/renderProjectTasks";
import { taskRenderer } from "../components/taskRenderer";
import { Priority } from "../models/priority";
import { project } from "../models/project";
import { Status } from "../models/status";
import { task } from "../models/task";
import { isToday, isWithinInterval, startOfToday, endOfDay, addDays } from "date-fns";

(function () {

    const noProjectsView = document.querySelector(".no-projects");

    const projectView = document.querySelector(".project-view");

    const deleteProjectPopup = document.querySelector(".delete-project__popup");
    const deleteProjectCancelButton = document.querySelector(".delete-project__cancel-button")
    const deleteProjectDeleteButton = document.querySelector(".delete-project__delete-button")

    const taskForm = document.querySelector(".task-form")
    const taskFormTaskTitle = document.querySelector(".task-form__title-input");
    const taskFormProjectSelectList = document.querySelector(".task-form__project-list");
    const taskFormDueDate = document.querySelector(".task-form__date-wrapper");
    const taskFormPrioritySelectList = document.querySelector(".task-form__priority");
    const taskFormStatusSelectList = document.querySelector(".task-form__status");
    const taskFormNotesText = document.querySelector(".task-form__notes-container");
    const taskFormCreateTaskButton = document.querySelector(".task-form__create-task");
    const taskFormCancelTaskButton = document.querySelector(".task-form__collapse-form");
    const taskFormDeleteTaskButton = document.querySelector(".task-form__delete-task-button");
    const taskFormEditTaskButton = document.querySelector(".task-form__edit-task");

    const sidebar = document.querySelector(".sidebar");
    const sidebarProjectList = document.querySelector(".sidebar__project-list");
    const sidebarNewProjectButton = document.querySelector(".sidebar__new-project-button");
    const sidebarNewProjectInput = document.querySelector(".sidebar__new-project-input");
    const sidebarNewProjectButtonTitle = document.querySelector(".sidebar__new-project-title");
    const sidebarFilterToday = document.querySelector(`[data-filter="today"]`);
    const sidebarFilterWeek = document.querySelector(`[data-filter="week"]`);
    const sidebarFilterAllTime = document.querySelector(`[data-filter="all"]`);
    const sidebarCollapseButton = document.querySelector(".sidebar__collapse-button");


    const toolbarProjectList = document.querySelector(".toolbar__project-list");
    const toolbarAddTaskButton = document.querySelector(".toolbar__add-task-button");
    const toolbarTrashButton = document.querySelector(".toolbar__trash-button");

    const todoCol = document.querySelector(`[data-list-type="todo"]`)
    const progCol = document.querySelector(`[data-list-type="progress"]`)
    const compCol = document.querySelector(`[data-list-type="completed"]`)

    const columnAddTaskButtons = document.querySelectorAll(".project-view__new-task-button");

    const projects = new Map();
    const noProjects = project("No Project");
    let stagedProject = null;
    let editingTask = null;
    let timeProject = null;

    projects.set(noProjects.getId(), noProjects);
    initNoProjectOption();

    function initNoProjectOption() {
        const option = document.createElement("option");
        option.value = noProjects.getTitle();
        option.textContent = noProjects.getTitle();
        option.dataset.projectId = noProjects.getId();

        taskFormProjectSelectList.append(option);
    }


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

    function showDeletePrompt() {
        if (stagedProject === null)
            return;
        deleteProjectPopup.classList.remove("hide");
    }

    function removeDeletePrompt() {
        deleteProjectPopup.classList.add("hide");
    }

    function showNoProjects() {
        noProjectsView.classList.remove("hide");
    }

    function removeNoProjects() {
        noProjectsView.classList.add("hide");
    }

    function showProjectView() {
        projectView.classList.remove("hide");
    }

    function removeProjectView() {
        projectView.classList.add("hide");
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

    function renderListswithExistingProject(project) {
        toolbarProjectList.value = project.getTitle();
        taskFormProjectSelectList.value = project.getTitle();
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

        taskFormEditTaskButton.classList.add("hide");
        taskFormDeleteTaskButton.classList.add("hide");
        taskFormCreateTaskButton.classList.remove("hide");

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

    function isWithinNextSevenDays(date) {
        return isWithinInterval(new Date(date), {
            start: startOfToday(),
            end: endOfDay(addDays(new Date(), 7)),
        });
    }

    function initProjectTask() {
        const title = taskFormTaskTitle.value;

        if (title === "") {
            taskFormTaskTitle.placeholder = "Enter a title...";
            return;
        }

        const projId = taskFormProjectSelectList.
            options[taskFormProjectSelectList.selectedIndex].
            dataset.projectId;

        const due = taskFormDueDate.value;
        const status = taskFormStatusSelectList.value;
        const priority = taskFormPrioritySelectList.value;
        const notes = taskFormNotesText.value;

        const tsk = task(title);

        if (due !== "")
            tsk.setDueDate(due);

        tsk.setStatus(status);

        tsk.setPriority(priority);

        tsk.setDescription(notes);

        if (projId !== stagedProject.getId()) {
            projects.get(projId).addTask(tsk);
            tsk.setProject(projects.get(projId));
        } else {
            stagedProject.addTask(tsk);
            tsk.setProject(stagedProject);
            renderProjectTask(tsk);
        }



        hideTaskForm();
    }

    function removeTaskElement(task) {

        if (task === null) {
            console.log("removeTaskElement(task) task is null");
            return;
        }

        const taskButton = document.querySelector(`[data-task-id="${task.getId()}"]`);
        if (!taskButton)
            return;

        const taskLi = taskButton.parentElement;

        if (!taskLi)
            return;

        taskLi.remove();
    }

    function deleteTask(task) {
        const proj = task.getProject();

        if (proj === null) return;

        projects.get(proj.getId()).removeTask(task.getId());
    }

    function changeTaskProjectTo(task, targetProj) {
        const oldProj = task.getProject();
        targetProj.addTask(task);
        oldProj.removeTask();
        task.setProject(targetProj);
    }

    function removeStagedProject() {

        if (stagedProject === null) {
            removeDeletePrompt();
            return;
        }

        const id = stagedProject.getId();
        console.log("id: " + id);
        console.log(noProjects.getId());

        const sidebarElement = sidebarProjectList
            .querySelector(`[data-project-id="${id}"]`);

        const toolbarElement = toolbarProjectList
            .querySelector(`[data-project-id="${id}"]`);

        const taskbarElement = taskFormProjectSelectList
            .querySelector(`[data-project-id="${id}"]`);

        console.log("sidebarEl: " + sidebarElement);
        console.log("toolbarEl: " + toolbarElement);
        console.log("taskbarEl: " + taskbarElement);

        sidebarElement.remove();
        toolbarElement.remove();
        taskbarElement.remove();

        projects.delete(stagedProject.getId());

        if (projects.size === 1) {

            removeProjectView();
            showNoProjects();
        }

        const nextProject = [...projects.values()][1];

        if (nextProject) {
            stagedProject = nextProject;
            renderProjectTasks(stagedProject);
            renderListswithExistingProject(nextProject)
        } else {
            stagedProject = null;
            showNoProjects();
        }
    }



    toolbarAddTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (stagedProject === null)
            return;

        initTaskForm(event.target);
    })

    columnAddTaskButtons.forEach(button => {
        button.addEventListener("click", (event) => {

            event.stopPropagation();

            initTaskForm(button);

        });
    });

    document.querySelector(".new-task__collapse").addEventListener('click', hideTaskForm)

    document.querySelector(".task-form__collapse-form").addEventListener('click', hideTaskForm)

    sidebarNewProjectButton.addEventListener('click', showSidebarInput);

    // creates a new project, sets it to the stage
    // and renders it to the screen immediately
    sidebarNewProjectButton.addEventListener("keypress", (event) => {

        if (event.key !== "Enter")
            return;

        if (editingTask !== null)
            return;

        const newProjTitle = sidebarNewProjectInput.value;

        if (newProjTitle === "") {
            sidebarNewProjectInput.placeholder = "Enter a title...";
            return;
        }


        if (projects.size === 1) {
            removeNoProjects();
            showProjectView();
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
    taskFormCreateTaskButton.addEventListener('click', initProjectTask);

    taskForm.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            initProjectTask();
        }
    })

    projectView.addEventListener('click', (event) => {
        if (!event.target.matches(".project-view__task-complete"))
            return;


        const completed = event.target;
        console.log(completed);

        const button = event.target.parentElement.parentElement;
        const taskId = button.dataset.taskId;

        console.log(button);

        const task = stagedProject.getTask(taskId);
        console.log(task);
        const li = button.parentElement;

        if (completed.classList.contains("project-view__task-complete--active")) {
            task.setStatus(Status.TODO);
            stagedProject.moveTask(task);
        } else {
            task.setStatus(Status.COMPLETED);
            stagedProject.moveTask(task);
        }

        li.remove();

        renderProjectTasks(stagedProject);
        console.log(stagedProject.getTodoList());

    })


    toolbarTrashButton.addEventListener('click', showDeletePrompt);

    deleteProjectDeleteButton.addEventListener('click', () => {
        removeStagedProject();
        removeDeletePrompt();
    })

    deleteProjectCancelButton.addEventListener('click', removeDeletePrompt);

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

    taskFormDeleteTaskButton.addEventListener('click', (event) => {
        console.log("deleting");
        event.preventDefault();

        if (!editingTask) return;

        stagedProject.removeTask(editingTask.getId());
        renderProjectTasks(stagedProject);

        editingTask = null;
        hideTaskForm();
    })

    taskFormEditTaskButton.addEventListener('click', (event) => {
        event.preventDefault();


        if (!editingTask) return;

        const newTitle = taskFormTaskTitle.value;
        const newDue = taskFormDueDate.value;
        const newStat = taskFormStatusSelectList.value;
        const newPri = taskFormPrioritySelectList.value;
        const newNotes = taskFormNotesText.value;
        const selectedOption =
            taskFormProjectSelectList.options[taskFormProjectSelectList.selectedIndex];
        const newProjId = selectedOption.dataset.projectId;

        editingTask.setTitle(newTitle);
        editingTask.setDueDate(newDue);
        editingTask.setStatus(newStat);
        editingTask.setPriority(newPri);
        editingTask.setDescription(newNotes);

        if (newProjId === stagedProject.getId()) {
            stagedProject.moveTask(editingTask);
        } else {
            stagedProject.removeTask(editingTask.getId());
            projects.get(newProjId).addTask(editingTask);
        }


        editingTask = null;
        renderProjectTasks(stagedProject);
        hideTaskForm();

    })

    sidebarFilterToday.addEventListener("click", () => {
        stagedProject = null;

        const tempProject = project("Today");

        for (const proj of projects.values()) {
            for (const task of proj.getTodaysTasks().values()) {
                tempProject.addTask(task);
            }
        }

        renderProjectTasks(tempProject);
    });

    sidebarFilterWeek.addEventListener('click', () => {
        stagedProject = null;

        const tempProject = project("Today");

        for (const proj of projects.values()) {
            for (const task of proj.getNextSevenDaysTasks().values()) {
                tempProject.addTask(task);
            }
        }

        renderProjectTasks(tempProject);

    })

    sidebarFilterAllTime.addEventListener('click', () => {
        stagedProject = null;

        const tempProject = project("Today");

        for (const proj of projects.values()) {
            for (const task of proj.getAllTasks().values()) {
                tempProject.addTask(task);
            }
        }

        renderProjectTasks(tempProject);

    })

    sidebarCollapseButton.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar--collapsed");
    });

    document.addEventListener('dblclick', (event) => {
        if (!taskForm.classList.contains("hide")) return;

        taskFormDeleteTaskButton.classList.remove("hide");
        taskFormEditTaskButton.classList.remove("hide");
        taskFormCreateTaskButton.classList.add("hide");

        const taskElement = event.target.closest(".project-view__task");

        if (!taskElement) return;
        const button = taskElement.querySelector(".project-view__task-button");

        if (!button) return;

        const taskId = button.dataset.taskId;
        editingTask = stagedProject.getTask(taskId);

        taskFormTaskTitle.value = editingTask.getTitle();
        taskFormDueDate.value = editingTask.getDueDate();
        taskFormStatusSelectList.value = editingTask.getStatus();
        taskFormPrioritySelectList.value = editingTask.getPriority();
        taskFormNotesText.textContent = editingTask.getDescription();
        showTaskForm();

    })


})();