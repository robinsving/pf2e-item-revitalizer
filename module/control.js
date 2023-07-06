import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";

import { Revitalizer } from "./Revitalizer";

$(document).ready(() => {
    let revitalizer = new Revitalizer();

    Hooks.once("init", () => {
        console.log(`${SCRIPT_ID} | Initializing ${SCRIPT_ID}`);
        CONFIG.supportedLanguages['en'] = 'English';

        revitalizer.loadTemplate();
    });

    Hooks.on('getSceneControlButtons', (control) => {
        console.log(`${SCRIPT_ID} | Add hook on getSceneControlButtons`);

        if (game.settings.get(SCRIPT_ID, 'forGmOnly') && !game.user.isGM)
            return;

        //const control = scene.find((c) => c.name === 'token');
        // Add a new Scene Control Button group
        control.push({
            name: SCRIPT_ID+"-group",
            title: `${SCRIPT_NAME}`,
            icon: 'fas fa-solid fa-code-fork',
            activeTool: '',
            layer: 'controls',
            tools: [{
                name: SCRIPT_ID+"-all",
                title: `Run for all Actors`,
                icon: 'fas fa-solid fa-users-medical',
                toggle: false,
                onClick: () => {
                    revitalizer.run(true); 
                }
            }, {
                name: SCRIPT_ID+"-pc",
                title: `Run for all characters`,
                icon: 'fas fa-solid fa-users',
                toggle: false,
                onClick: () => {
                    revitalizer.run(false); 
                }
            }]
        });
    });

    // test if "has"-selector is enabled in browser
    function testHasSelector(){
        //create three connected elements
        var container = document.createElement("div");
        var parent = document.createElement("div");
        var child = document.createElement("div");
        child.className = "wiggle";
        
        container.appendChild(parent);
        parent.appendChild(child);
        try {
            return (container.querySelector("div:has(.wiggle)") !== null);
        } catch(e) {
            return false;
        } finally {
            parent.remove();
        }
    }

    /**
     * Define settings.
     */
    Hooks.on('init', () => {
        // Hide the control button.
        game.settings.register(SCRIPT_ID, 'forGmOnly', {
            name: game.i18n.localize("PIR.settings.gm.name"),
            hint: game.i18n.localize("PIR.settings.gm.hint"),
            scope: 'world',
            config: true,
            default: true,
            type: Boolean
        });

        // Allow user setting of the has-selector workaround
        game.settings.register(SCRIPT_ID, 'useBrowserWorkaround', {
            name: game.i18n.localize("PIR.settings.useBrowserWorkaround.name"),
            hint: game.i18n.localize("PIR.settings.useBrowserWorkaround.hint"),
            scope: 'world',
            config: false,
            default: testHasSelector(),
            type: Boolean
        });
    });
});
