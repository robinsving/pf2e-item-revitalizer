import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { info, debug, settings, selectionTemplate, resultsTemplate } from "./RevitalizerUtilities.js";
import { Revitalizer } from "./Revitalizer";

// Enum with filtering methods
const ActorSelection = {
    All: () => true,
    Characters: (token) => token.type == "character",
    PlayerOwned: (token) => token.ownership.hasOwnProperty(game.userId)
};

$(document).ready(() => {
    let revitalizer = new Revitalizer();

    Hooks.once("init", () => {
        info(`Initializing ${SCRIPT_NAME}`);
        loadTemplates([selectionTemplate, resultsTemplate]);
        CONFIG.supportedLanguages['en'] = 'English';
    });

    Hooks.on('getSceneControlButtons', (control) => {
        info("Add hook on getSceneControlButtons");
        
        let tools = [];

        // Determine which buttons should be visible to user
        if (!game.user.isGM) {
            if (game.settings.get(SCRIPT_ID, settings.gm)) {
                debug("User is not permitted to see anything")
                // Don't display anything
                return;
            }

            debug("User is permitted to see owned characters")
            
            tools.push({
                name: SCRIPT_ID+"-user",
                title: `Run for owned Actors in scene`,
                icon: 'fas fa-solid fa-users-viewfinder',
                toggle: false,
                onClick: () => {
                    revitalizer.start(ActorSelection.PlayerOwned); 
                }
            })
        } else {
            debug("GM is permitted to see everything")
            tools.push({
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
            });
        }

        // Add a new Scene Control Button group
        control.push({
            name: SCRIPT_ID+"-group",
            title: `${SCRIPT_NAME}`,
            icon: 'fas fa-solid fa-code-fork',
            activeTool: '',
            layer: 'controls',
            tools: tools
        });
    });

    /**
     * Define settings.
     */
    Hooks.on('init', () => {
        // Hide the control button.
        game.settings.register(SCRIPT_ID, settings.gm, {
            name: "GM only", //game.i18n.localize("PIR.settings.gm.name"),
            hint: "If turned off, users will be able to run for their owned characters", //game.i18n.localize("PIR.settings.gm.hint"),
            scope: 'world',
            config: true,
            default: true,
            type: Boolean
        });

        // Print out debug to console.
        game.settings.register(SCRIPT_ID, settings.debug, {
            name: "Enable Debug", //game.i18n.localize("PIR.settings.debug.name"),
            hint: "Print debug to console log", //game.i18n.localize("PIR.settings.debug.hint"),
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        // Use Array Length for RE discovery.
        game.settings.register(SCRIPT_ID, settings.rulesElementArrayLengthOnly, {
            name: "Simplified Rule Element discovery",
            hint: "Faster run. Performs RE comparisons using array length. This gives fewer false positives, but also misses more true positives",
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });
    });
});
