import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { info, selectionTemplate, resultsTemplate } from "./RevitalizerUtilities";
import { Revitalizer } from "./Revitalizer";
import { RevitalizerSheetRegister } from "./RevitalizerSheetRegister";
import { RevitalizerSettingsRegister } from "./RevitalizerSettingsRegister";
import "./RevitalizerCallbacks";

// Enum with filtering methods
const ActorSelection = {
    All: () => true,
    Characters: (token) => token.type == "character",
};

$(document).ready(() => {
    let revitalizer = new Revitalizer();

    Hooks.once("init", () => {
        info(`Initializing ${SCRIPT_NAME}`);
        loadTemplates([selectionTemplate, resultsTemplate]);
        CONFIG.supportedLanguages['en'] = 'English';
        new RevitalizerSettingsRegister();
    });

    // register on Character sheets
    Hooks.once("ready", () => {
        new RevitalizerSheetRegister(revitalizer);
    });

    Hooks.on('getSceneControlButtons', (control) => {
        info("Add hook on getSceneControlButtons");

        // Don't render buttons for non-GM
        if (!game.user.isGM)
            return;

        // Determine which buttons should be visible to user
        let tools = [
            {
                name: SCRIPT_ID+"-all",
                title: `Run for all Actors in scene`,
                icon: 'fas fa-solid fa-users-medical',
                toggle: false,
                onClick: () => {
                    revitalizer.start(ActorSelection.All); 
                }
            }, {
                name: SCRIPT_ID+"-characters",
                title: `Run for all Characters in scene`,
                icon: 'fas fa-solid fa-users',
                toggle: false,
                onClick: () => {
                    revitalizer.start(ActorSelection.Characters); 
                }
            }
        ];

        // Add a new Scene Control Button group
        control.push({
            name: SCRIPT_ID+"-group",
            title: `${SCRIPT_NAME}`,
            icon: 'fas fa-solid fa-code-compare',
            activeTool: '',
            layer: 'controls',
            tools: tools
        });
    });
});
