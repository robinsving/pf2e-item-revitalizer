import { info, isRunning, popup } from "../utilities/RevitalizerUtilities.js";
import { selectionActorHook } from "../RevitalizerRunner";
import { ActorSelection } from "./RevitalizerSceneControl.js";
import AbstractSidebar from "./AbstractSidebar";

export default class RevitalizerSceneSidebar extends AbstractSidebar {

    constructor() {
        super();
        Hooks.on("renderSceneDirectory", (_directory, section) => {
            info("Registering Scene Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section[0].querySelector('div.header-search');

            // Create the anchor
            const anchor = this.createAnchor("Create Revitalizer Selection for Actors in Scene", () => Hooks.call(selectionActorHook, this.#callback(ActorSelection.All)));

            searchHeader.appendChild(anchor);
        });
    }

    #callback(actorSelection) {
        // Don't start if already running
        if (isRunning())
            return;
        
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