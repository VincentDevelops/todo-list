const STORAGE_KEY = "todo-projects";

export function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

export function saveProjects(projects) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...projects.values()])
    );
}

export function loadProjects() {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (!savedProjects) return null;

    return JSON.parse(savedProjects);
}


