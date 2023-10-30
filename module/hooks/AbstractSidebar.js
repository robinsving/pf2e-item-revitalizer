export default class AbstractSidebar {

    constructor() {}

    createAnchor(title, callback) {
        // Create the anchor
        const anchor = document.createElement("a");
        anchor.role = "button";
        anchor.classList.add("header-control");
        anchor.onclick = callback;
        anchor.title = title;
        anchor.ariaLabel = title;
        anchor.innerHTML = "<i class=\"fa-solid fa-code-compare\"></i>"
    
        return anchor;
    }
}