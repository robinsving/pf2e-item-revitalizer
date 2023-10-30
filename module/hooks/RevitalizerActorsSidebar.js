import { info, isRunning } from "../utilities/RevitalizerUtilities.js";
import { selectionActorIdHook } from "../RevitalizerRunner";
import AbstractSidebar from "./AbstractSidebar";


export default class RevitalizerActorsSidebar extends AbstractSidebar {

    constructor() {
        super();
        Hooks.on("renderActorDirectoryPF2e", (_directory, section) => {
            info("Registering Actor Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section[0].querySelector('div.header-search');

            const anchor = this.createAnchor("Create Revitalizer Selection for all visible Actors", () => Hooks.call(selectionActorIdHook, this.#callback(section)));

            searchHeader.appendChild(anchor);
        });
    }

    #callback(section) {
        // Don't start if already running
        if (isRunning())
            return;

        const actorIds = [];

        // Fetch the currently searched Actors' IDs
        // Both from uncollapsed folders and without folders, as long as they are visible
        const openFolder = "li.directory-item:not(.collapsed)";
        const notHidden = ":not([style*='display:none']):not([style*='display: none'])"
        const allActorElements = section[0].querySelectorAll(`${openFolder} > ol > li.actor${notHidden}, ol.directory-list > li.actor${notHidden}`);

        allActorElements.forEach(element => {
            actorIds.push(element.getAttribute("data-entry-id"));
        });

        return actorIds;
    }
}