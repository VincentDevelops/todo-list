import { projectRenderer } from "../components/projectRenderer";
import { renderProjectTask } from "../components/renderProjectTask";
import { renderProjectTasks } from "../components/renderProjectTasks";
import { Priority } from "../models/priority";
import { project } from "../models/project";
import { Status } from "../models/status";
import { task } from "../models/task";

(function () {

    const projects = new Map();
    const taskForm = document.querySelector(".task-form");
    const newProjButton = document.querySelector(".sidebar__new-project-button");
    const newProjTitle = newProjButton.querySelector(".sidebar__new-project-title");
    const newProjInput = newProjButton.querySelector(".sidebar__new-project-input");
    const projectList = document.querySelector(".sidebar__project-list");
    const addTaskButtons = document.querySelectorAll(".project-view__column-add-task-button");
    const formProjectList = document.querySelector(".task-form__project-list");
    const toolbarProjectList = document.querySelector(".toolbar__project-list");

    let projectStage = project("myProj");
    projects.set(projectStage.getId(), projectStage);

    function addTaskButtonEventHandler() {
        taskForm.classList.toggle("hide");
    }

    function addProjectButtonEventHandler() {

        // must be able to click on input
        if (!newProjInput.classList.contains("hide"))
            return;

        newProjTitle.classList.toggle("hide");
        newProjInput.classList.toggle("hide");
    }

    function handleProjectChange(event) {
        const selectedOption = event.target.selectedOptions[0];
        const projectId = selectedOption.dataset.projectId;

        if (projects.has(projectId)) {
            projectStage = projects.get(projectId);
            renderProjectTasks(projectStage);
        }
    }

    function createTaskHandler() {
        const title = document.querySelector(".task-form__title-input").value;
        const due = document.querySelector(".task-form__date-wrapper").value;
        const priority = document.querySelector(".task-form__priority").value;
        const status = document.querySelector(".task-form__status").value;
        const notes = document.querySelector(".task-form__notes-container").value;

        if (title === "") {
            document.querySelector(".task-form__title-input").placeholder = "Enter a title!";
            return;
        }


        console.log("title: " + title);
        console.log("due: " + due);
        console.log("priority: " + priority);
        console.log("status: " + status);
        console.log("notes: " + notes);

        const tsk = task(title);

        if (due !== "")
            tsk.setDueDate(new Date(due));

        if (priority === "low") {
            tsk.setPriority(Priority.LOW);
            console.log(tsk.getPriority())
        } else if (priority === "medium") {
            tsk.setPriority(Priority.MEDIUM);
        } else if (priority === "high") {
            tsk.setPriority(Priority.HIGH);
        }

        if (status === "todo")
            tsk.setStatus(Status.TODO);
        else if (status === "progress")
            tsk.setStatus(Status.PROGRESS);
        else if (status === "completed")
            tsk.setStatus(Status.COMPLETED);


        console.log("tsk status: " + tsk.getStatus());
        console.log("tsk pri: " + tsk.getPriority());

        tsk.setDescription(notes);

        projectStage.addTask(tsk);

        renderProjectTask(tsk);

        document.querySelector(".task-form__title-input").placeholder = "What will we do today...";
        taskForm.reset();
        taskForm.classList.toggle("hide");
    }


    addTaskButtons.forEach(button => {
        button.addEventListener("click", () => {
            addTaskButtonEventHandler();
        });
    });

    const cancelTaskButton = document.querySelector(".task-form__collapse-form");
    cancelTaskButton.addEventListener('click', function (event) {
        addTaskButtonEventHandler();
    })


    const createTaskButton = document.querySelector(".task-form__create-task");
    createTaskButton.addEventListener('click', function (event) {
        event.preventDefault();
        createTaskHandler();
    })


    const addTaskButton = document.querySelector(".toolbar__add-task-button");
    addTaskButton.addEventListener('click', function () {
        addTaskButtonEventHandler();
    })

    const collapseForm = document.querySelector(".new-task__collapse");
    collapseForm.addEventListener('click', function () {
        taskForm.reset();
        taskForm.classList.toggle("hide");
    })

    const addProjectButton = document.querySelector(".sidebar__new-project-button");
    addProjectButton.addEventListener('click', function () {
        addProjectButtonEventHandler();
    })

    addProjectButton.addEventListener("keypress", function (event) {

        if (newProjInput.classList.contains("hide")) {
            console.log("enter pressed");
            return;
        }

        if (event.key === "Enter") {
            const projTitle = document.querySelector(".sidebar__new-project-input").value;

            if (projTitle === "") {
                document.querySelector(".sidebar__new-project-input").placeholder = "Enter a name.";
                return;
            } else {
                document.querySelector(".sidebar__new-project-input").placeholder = "";
            }


            const newProject = project(projTitle);
            projects.set(newProject.getId(), newProject);

            projectStage = newProject;



            // close input prompt and clear input
            newProjTitle.classList.toggle("hide");
            newProjInput.classList.toggle("hide");
            newProjInput.value = "";

            // render the new project onto the page
            renderProjectTasks(newProject);
            projectStage = newProject;
            projectList.prepend(projectRenderer(newProject));

            const toolbarOption = document.createElement("option");
            toolbarOption.classList.add("toolbar__title-option");
            toolbarOption.value = newProject.getTitle();
            toolbarOption.id = newProject.getTitle();
            toolbarOption.textContent = newProject.getTitle();
            toolbarOption.dataset.projectId = newProject.getId();

            toolbarProjectList.prepend(toolbarOption);
            toolbarProjectList.value = newProject.getTitle();

            const formOption = document.createElement("option");
            formOption.classList.add("toolbar__title-option");
            formOption.value = newProject.getTitle();
            formOption.id = newProject.getTitle();
            formOption.textContent = newProject.getTitle();
            formOption.dataset.projectId = newProject.getId();

            formProjectList.append(formOption);
            formProjectList.value = newProject.getTitle();
        }

        console.log(projects);
    })

    toolbarProjectList.addEventListener('change', (event) => {
        handleProjectChange(event);
    })


})();