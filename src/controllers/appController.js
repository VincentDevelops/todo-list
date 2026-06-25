import { projectRenderer } from "../components/projectRenderer";
import { renderProjectTask } from "../components/renderProjectTask";
import { renderProjectTasks } from "../components/renderProjectTasks";
import { Priority } from "../models/priority";
import { project } from "../models/project";
import { Status } from "../models/status";
import { task } from "../models/task";
import { isToday, isWithinInterval, startOfToday, endOfDay, addDays } from "date-fns";
import { saveProjects, loadProjects, storageAvailable } from "../models/storage.js";

(function () {

    const noProjectsView = document.querySelector(".no-projects");

    const projectView = document.querySelector(".project-view");

    const deleteProjectPopup = document.querySelector(".delete-project__popup");
    const deleteProjectCancelButton = document.querySelector(".delete-project__cancel-button")
    const deleteProjectDeleteButton = document.querySelector(".delete-project__delete-button")
    const deleteProjectPrompt = document.querySelector(".delete-project__prompt");

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

    const hasStorage = storageAvailable("localStorage");

    const projects = new Map();
    const noProjects = project("No Project");
    let stagedProject = noProjects;
    let editingTask = null;

    projects.set(noProjects.getId(), noProjects);
    initNoProjectOption();

    loadSavedProjects();

    // review -- rework --
    function loadSavedProjects() {
        const savedProjects = loadProjects();

        if (!savedProjects) return;

        projects.clear();

        for (const savedProject of savedProjects) {
            const loadedProject = project(savedProject.title);

            loadedProject.setColor(savedProject.color);

            for (const savedTask of savedProject.tasks ?? []) {
                const loadedTask = task(savedTask.title);

                loadedTask.setDueDate(savedTask.dueDate);
                loadedTask.setPriority(savedTask.priority);
                loadedTask.setStatus(savedTask.status);
                loadedTask.setDescription(savedTask.description);
                loadedTask.setProject(loadedProject);

                loadedProject.addTask(loadedTask);
            }

            projects.set(loadedProject.getId(), loadedProject);
            if (loadedProject.getTitle() === "No Project") {
                stagedProject = loadedProject;
            } else {
                renderNewProject(loadedProject);
            }
        }

        if (projects.size > 1) {
            removeNoProjects();
            showProjectView();

            const firstProject = [...projects.values()][1];
            switchProjectTo(firstProject);
        } else {
            stagedProject = noProjects;
            showNoProjects();
            removeProjectView();
        }
    }

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
        if (stagedProject === noProjects)
            return;
        deleteProjectPopup.classList.remove("hide");
    }

    function removeDeletePrompt() {
        deleteProjectPrompt.textContent = "Are you sure you want to delete this project?";
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
    }

    function renderListswithExistingProject(project) {
        toolbarProjectList.value = project.getTitle();
        taskFormProjectSelectList.value = project.getTitle();
    }

    // renders a project to the stage
    function renderNewProject(project) {
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

        if (stagedProject !== null)
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

        if (hasStorage)
            saveProjects(projects);
    }

    function removeTaskElement(task) {

        if (task === null) {
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
        oldProj.removeTask(task.getId());
        task.setProject(targetProj);
    }

    function removeStagedProject() {

        if (stagedProject === null) {
            removeDeletePrompt();
            return;
        }

        const id = stagedProject.getId();

        const sidebarElement = sidebarProjectList
            .querySelector(`[data-project-id="${id}"]`);

        const toolbarElement = toolbarProjectList
            .querySelector(`[data-project-id="${id}"]`);

        const taskbarElement = taskFormProjectSelectList
            .querySelector(`[data-project-id="${id}"]`);

        if (sidebarElement) sidebarElement.remove();
        if (toolbarElement) toolbarElement.remove();
        if (taskbarElement) taskbarElement.remove();

        if (id !== noProjects.getId())
            projects.delete(stagedProject.getId());

        // only noProjects is left
        if (projects.size === 1) {
            removeProjectView();
            showNoProjects();
            stagedProject = noProjects;
            return;
        }

        const nextProject = [...projects.values()][1];

        if (nextProject) {
            stagedProject = nextProject;
            renderProjectTasks(stagedProject);
            renderListswithExistingProject(nextProject)
        } else {
            stagedProject = noProjects;
            showNoProjects();
        }
    }

    function findTaskAndProject(taskId) {
        for (const proj of projects.values()) {
            if (proj.contains(taskId)) {
                return {
                    project: proj,
                    task: proj.getTask(taskId),
                };
            }
        }

        return {
            project: null,
            task: null,
        };
    }


    toolbarAddTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();

        // if (stagedProject === null)
        //     return;

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

        if (hasStorage)
            saveProjects(projects);
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

        const button = event.target.parentElement.parentElement;
        const taskId = button.dataset.taskId;
        let project = null;
        let task = null;

        if (stagedProject.contains(taskId)) {
            project = stagedProject;
            task = project.getTask(taskId);

        } else {
            for (const proj of projects.values()) {
                if (proj.contains(taskId)) {
                    project = proj;
                    task = proj.getTask(taskId)
                    break;
                }
            }
        }


        if (task === null) {
            console.log("task is null in projectView event listener");
            return;
        }

        const li = button.parentElement;

        if (completed.classList.contains("project-view__task-complete--active")) {
            task.setStatus(Status.TODO);
            project.moveTask(task);
        } else {
            task.setStatus(Status.COMPLETED);
            project.moveTask(task);
        }

        li.remove();

        renderProjectTasks(project);

        if (hasStorage)
            saveProjects(projects);
    })


    toolbarTrashButton.addEventListener('click', showDeletePrompt);

    deleteProjectDeleteButton.addEventListener('click', () => {
        removeStagedProject();
        removeDeletePrompt();

        if (hasStorage)
            saveProjects(projects);
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
        event.preventDefault();

        if (!editingTask) return;

        const project = editingTask.getProject();

        if (!project) return;

        project.removeTask(editingTask.getId());
        renderProjectTasks(stagedProject);

        editingTask = null;
        hideTaskForm();
    });

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

        const oldProject = editingTask.getProject();
        const newProject = projects.get(newProjId);

        // Remove from its current project while it still has its old status
        oldProject.removeTask(editingTask.getId());

        // Update the task
        editingTask.setTitle(newTitle);
        editingTask.setDueDate(newDue);
        editingTask.setStatus(newStat);
        editingTask.setPriority(newPri);
        editingTask.setDescription(newNotes);
        editingTask.setProject(newProject);

        // Add back to the appropriate project/status
        newProject.addTask(editingTask);

        editingTask = null;

        renderProjectTasks(stagedProject);
        hideTaskForm();

        if (hasStorage)
            saveProjects(projects);
    });

    taskFormDeleteTaskButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (!editingTask) return;

        const project = editingTask.getProject();

        if (!project) return;

        project.removeTask(editingTask.getId());
        renderProjectTasks(stagedProject);

        editingTask = null;
        hideTaskForm();

        if (hasStorage)
            saveProjects(projects)
    });

    sidebarFilterWeek.addEventListener('click', () => {
        stagedProject = noProjects;

        const tempProject = project("Today");

        for (const proj of projects.values()) {
            for (const task of proj.getNextSevenDaysTasks().values()) {
                tempProject.addTask(task);
            }
        }

        removeNoProjects();
        showProjectView();
        renderProjectTasks(tempProject);

    })

    sidebarFilterAllTime.addEventListener('click', () => {
        stagedProject = noProjects;

        console.log(stagedProject.getTitle());

        const tempProject = project("Today");

        console.log(tempProject.getTitle());
        console.log(tempProject);

        for (const proj of projects.values()) {
            for (const task of proj.getAllTasks().values()) {
                tempProject.addTask(task);
            }
        }

        removeNoProjects();
        showProjectView();
        renderProjectTasks(tempProject);

    })

    sidebarCollapseButton.addEventListener("click", () => {
        sidebar.classList.toggle("sidebar--collapsed");
    });

    document.addEventListener('dblclick', (event) => {
        if (!taskForm.classList.contains("hide")) return;

        const taskElement = event.target.closest(".project-view__task");

        if (!taskElement) return;

        const button = taskElement.querySelector(".project-view__task-button");

        if (!button) return;

        const taskId = button.dataset.taskId;
        const result = findTaskAndProject(taskId);

        if (!result.task) return;

        editingTask = result.task;

        taskFormDeleteTaskButton.classList.remove("hide");
        taskFormEditTaskButton.classList.remove("hide");
        taskFormCreateTaskButton.classList.add("hide");

        taskFormTaskTitle.value = editingTask.getTitle();
        taskFormDueDate.value = editingTask.getDueDate();
        taskFormStatusSelectList.value = editingTask.getStatus();
        taskFormPrioritySelectList.value = editingTask.getPriority();
        taskFormNotesText.value = editingTask.getDescription();

        showTaskForm();
    });

})();