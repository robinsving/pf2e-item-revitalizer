import { id as SCRIPT_ID } from "../../module.json";
import { info, popup } from "../utilities/RevitalizerUtilities.js";
import { selectionActorIdHook } from "../RevitalizerRunner";

export default class RevitalizerActorsSidebar {

    constructor() {

        Hooks.on("renderActorDirectoryPF2e", (_directory, section) => {
            info("Registering Actor Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section[0].querySelector('div.header-search');

            // Create the anchor
            const anchor = document.createElement("a");
            anchor.role = "button";
            anchor.classList.add("header-control");
            anchor.classList.add(SCRIPT_ID + "-actor-anchor");
            anchor.onclick = () => Hooks.call(selectionActorIdHook, this.#fetchCurrentlyFilteredActors(section));
            anchor.title = "Create Revitalizer Selection for all visible Actors";
            anchor.ariaLabel = anchor.title;
            anchor.innerHTML = "<i class=\"fa-solid fa-code-compare\"></i>"

            searchHeader.appendChild(anchor);
        });
    }

    #fetchCurrentlyFilteredActors(section) {
        // Don't start if already running
        if (document.getElementById("pir-container-body")) {
            popup(`Selection already ongoing`);
            return;
        }

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