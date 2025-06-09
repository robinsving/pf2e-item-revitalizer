import { info, isRunning } from "../utilities/RevitalizerUtilities.js";
import { selectionActorIdHook } from "../RevitalizerRunner";
import AbstractSidebar from "./AbstractSidebar";


export default class RevitalizerActorsSidebar extends AbstractSidebar {

    constructor() {
        super();
        Hooks.once("renderActorDirectoryPF2e", (_directory, section) => {
            info("Registering Actor Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section.querySelector('search');

            const anchor = this.createAnchor("Create Revitalizer Selection for all visible Actors", () => Hooks.call(selectionActorIdHook, this.#callback(section)));

            searchHeader.appendChild(anchor);
        });
    }

    #callback(section) {
        // Don't start if already running
        if (isRunning())
            return;

        const actorIds = [];

        // Select all possible actor elements (in and out of folders)
        const allActorElements = section.querySelectorAll("li.directory-item.actor, li.directory-item.entry.document.actor");

        // Only include those that are truly visible (not hidden by CSS or parent)
        allActorElements.forEach(element => {
            if (element.offsetParent !== null) {
                actorIds.push(element.getAttribute("data-entry-id"));
            }
        });

        return actorIds;
    }
}