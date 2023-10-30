import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../../module.json";
import { info, popup } from "../utilities/RevitalizerUtilities";
import RevitalizerLayer from "../RevitalizerLayer";
import { selectionActorHook } from "../RevitalizerRunner";

// Enum with filtering methods
export const ActorSelection = {
    All: () => true,
    Characters: (token) => token.type == "character",
};

export default class RevitalizerSceneControl {
    
    constructor() {

        // register new layer for holding Scene Control Buttons
        canvas.revitalizerLayer = new RevitalizerLayer();

        // register Scene Control Buttons
        Hooks.on('getSceneControlButtons', (control) => {
            info("Creating Hook for Scene Control");

            // Determine which buttons should be visible to user
            let tools = [{
                    name: SCRIPT_ID+"-all",
                    title: `Run for all Actors in scene`,
                    icon: 'fas fa-solid fa-users-medical',
                    toggle: false,
                    onClick: () => this.#callSelection(ActorSelection.All)
                }, {
                    name: SCRIPT_ID+"-characters",
                    title: `Run for all Characters in scene`,
                    icon: 'fas fa-solid fa-users',
                    toggle: false,
                    onClick: () => this.#callSelection(ActorSelection.Characters)
            }];

            // Add a new Scene Control Button group
            control.push({
                name: SCRIPT_ID+"-group",
                title: `${SCRIPT_NAME} - Deprecated`,
                icon: 'fas fa-solid fa-code-compare',
                activeTool: '',
                layer: 'revitalizerLayer',
                tools: tools
            });
        });
    }

    async #callSelection(actorSelection) {
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
        
        // Start the selection Dialog
        Hooks.call(selectionActorHook, actors, true);
    }
}