import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { info, debug } from "./RevitalizerUtilities.js";
import { Revitalizer } from "./Revitalizer";

// Settings
const settings = {
    gm: "forGmOnly"
}

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
        CONFIG.supportedLanguages['en'] = 'English';

        revitalizer.loadTemplate();
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
                title: `Run for all Actors`,
                icon: 'fas fa-solid fa-users-viewfinder',
                toggle: false,
                onClick: () => {
                    revitalizer.run(ActorSelection.PlayerOwned); 
                }
            })
        } else {
            debug("GM is permitted to see everything")
            tools.push({
                name: SCRIPT_ID+"-all",
                title: `Run for all Actors`,
                icon: 'fas fa-solid fa-users-medical',
                toggle: false,
                onClick: () => {
                    revitalizer.run(ActorSelection.All); 
                }
            }, {
                name: SCRIPT_ID+"-characters",
                title: `Run for all characters`,
                icon: 'fas fa-solid fa-users',
                toggle: false,
                onClick: () => {
                    revitalizer.run(ActorSelection.Characters); 
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
            name: game.i18n.localize("PIR.settings.gm.name"),
            hint: game.i18n.localize("PIR.settings.gm.hint"),
            scope: 'world',
            config: true,
            default: true,
            type: Boolean
        });
    });
});
