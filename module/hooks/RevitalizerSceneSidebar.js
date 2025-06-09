import { info, isRunning, popup } from "../utilities/RevitalizerUtilities.js";
import { selectionActorHook } from "../RevitalizerRunner";
import AbstractSidebar from "./AbstractSidebar";

export default class RevitalizerSceneSidebar extends AbstractSidebar {

    constructor() {
        super();
        Hooks.on("renderSceneDirectory", (_directory, section) => {
            info("Registering Scene Directory button");

            // Get the Actors field we want to add ourselves in
            const searchHeader = section.querySelector('search');

            // Create the anchor
            const anchor = this.createAnchor("Create Revitalizer Selection for Actors in Scene", () => Hooks.call(selectionActorHook, this.#callback()));

            searchHeader.appendChild(anchor);
        });
    }

    #callback() {
        // Don't start if already running
        if (isRunning())
            return;
        
        let actors = canvas.tokens.placeables
            .filter(token => token.actor).map(token => token.actor)                     // Filter out actors
            .filter((token) => ["character", "vehicle", "loot"].includes(token.type))   // Filter out according to selection, e.g. not familiars
            .sort((a, b) => (a.name > b.name) ? 1 : -1)                                 // Sort by actor name
            
        if (!actors.length) {
            popup(`No actors found matching selection`);
            return;
        }
        
        return actors;
    }
}