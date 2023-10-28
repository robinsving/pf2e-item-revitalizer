import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../../module.json";
import { info } from "../RevitalizerUtilities";
import RevitalizerLayer from "../RevitalizerLayer";

// Enum with filtering methods
const ActorSelection = {
    All: () => true,
    Characters: (token) => token.type == "character",
};

export default class RevitalizerSceneControl {
    
    constructor(revitalizer) {
        this.revitalizer = revitalizer;

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
                    onClick: () => {
                        this.revitalizer.start(ActorSelection.All); 
                    }
                }, {
                    name: SCRIPT_ID+"-characters",
                    title: `Run for all Characters in scene`,
                    icon: 'fas fa-solid fa-users',
                    toggle: false,
                    onClick: () => {
                        this.revitalizer.start(ActorSelection.Characters); 
                    }
            }];

            // Add a new Scene Control Button group
            control.push({
                name: SCRIPT_ID+"-group",
                title: `${SCRIPT_NAME}`,
                icon: 'fas fa-solid fa-code-compare',
                activeTool: '',
                layer: 'revitalizerLayer',
                tools: tools
            });
        });
    }
}