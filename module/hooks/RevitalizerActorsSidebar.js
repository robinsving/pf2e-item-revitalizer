import { id as SCRIPT_ID } from "../../module.json";
import { info } from "../RevitalizerUtilities.js";
import { selectionActorIdHook } from "../RevitalizerRunner";

export default class RevitalizerActorsSidebar {

    constructor() {

        Hooks.once("renderActorDirectoryPF2e", (_directory, section) => {
            // Get the Actors field we want to add ourselves in
            const searchHeader = section[0].querySelector('div.header-search');

            // Create the anchor
            const anchor = document.createElement("a");
            anchor.role = "button";
            anchor.classList.add("header-control");
            //anchor.classList.add(SCRIPT_ID + "-actor-anchor");
            anchor.onclick = () => Hooks.call(selectionActorIdHook, this.#fetchCurrentlyFilteredActors(section));
            anchor.title = "Run Revitalizer Check";
            anchor.ariaLabel = "Run Revitalizer Check";
            anchor.innerHTML = "<i class=\"fa-solid fa-code-compare\"></i>"

            searchHeader.appendChild(anchor);

            info("Registered Actor Directory button");
        });
    }

    #fetchCurrentlyFilteredActors(section) {
        const actorIds = [];

        // Fetch the currently searched Actors' IDs
         // Both from uncollapsed folders and without folders, as long as they are visible
        const openFolder = "li.folder:not(.collapsed)";
        const notHidden = ":not([style*='display:none']):not([style*='display: none'])"
        const allActorElements = section[0].querySelectorAll(`${openFolder} > ol > li.actor${notHidden}, ol.directory-list > li.actor${notHidden}`);

        allActorElements.forEach(element => {
            actorIds.push(element.getAttribute("data-entry-id"));
        });

        return actorIds;
    }
}