export default class AbstractSidebar {

    constructor() {}

    createAnchor(title, callback) {
        // Create the anchor
        const anchor = document.createElement("button");
        anchor.type = "button";
        anchor.classList.add("inline-control", "icon", "fa-solid", "fa-code-compare");
        anchor.onclick = callback;
        anchor.ariaLabel = title;
        anchor.setAttribute("data-tooltip", ""); 
        anchor.ariaDescribedby = "tooltip";
    
        return anchor;
    }
}