import { renderProjectTasks } from "./renderProjectTasks";

export function projectRenderer(project) {
    const proj = document.createElement("li");
    proj.classList.add("sidebar__project");
    proj.dataset.projectId = project.getId();

    const button = document.createElement("button");
    button.classList.add("sidebar__button");

    const projIcon = document.createElement("span");
    projIcon.classList.add("sidebar__project-icon");
    projIcon.style.backgroundColor = project.getColor();

    const projLabel = document.createElement("span");
    projLabel.classList.add("sidebar__project-label");
    projLabel.textContent = project.getTitle();

    const data = document.createElement("data");
    data.classList.add("sidebar__count");
    data.value = 0;
    data.dataset.project = project.getTitle();
    data.textContent = 0;

    button.append(projIcon, projLabel);

    proj.append(button, data);

    return proj;
}