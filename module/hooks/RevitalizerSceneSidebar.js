import { id as SCRIPT_ID } from "../../module.json";
import { info, popup } from "../utilities/RevitalizerUtilities.js";
import { selectionActorHook } from "../RevitalizerRunner";
import { ActorSelection } from "./RevitalizerSceneControl.js";

export default class RevitalizerSceneSidebar {

    constructor() {

        Hooks.on("renderSceneDirectory", (_directory, section) => {
            info("Registering Scene Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section[0].querySelector('div.header-search');

            // Create the anchor
            const anchor = document.createElement("a");
            anchor.role = "button";
            anchor.classList.add("header-control");
            anchor.classList.add(SCRIPT_ID + "-scene-anchor");
            anchor.onclick = () => Hooks.call(selectionActorHook, this.#callSelection(ActorSelection.All));
            anchor.title = "Create Revitalizer Selection for all Actors in Scene";
            anchor.ariaLabel = anchor.title;
            anchor.innerHTML = "<i class=\"fa-solid fa-code-compare\"></i>"

            searchHeader.appendChild(anchor);
        });
    }

    #callSelection(actorSelection) {
        // Don't start if already running
        if (document.getElementById("pir-container-body")) {
            popup(`Selection already ongoing`);
            return;
        }
        
        let actors = canvas.tokens.placeables
            .filter(token => token.actor).map(token => token.actor) // Filter out actors
            .filter(actorSelection)                                 // Filter out according to selection, e.g. ownership
            .sort((a, b) => (a.name > b.name) ? 1 : -1)             // Sort by actor name

        if (!actors.length) {
            popup(`No actors found matching selection`);
            return;
        }
        
        return actors;
    }
}