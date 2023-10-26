import { id as SCRIPT_ID } from "../module.json";
import { settings } from "./RevitalizerUtilities.js";

export class RevitalizerSettingsRegister {
    
    constructor() {
        // Hide the control button.
        game.settings.register(SCRIPT_ID, settings.gm.id, {
            name: settings.gm.name,
            hint: settings.gm.hint,
            scope: 'world',
            config: true,
            default: true,
            type: Boolean
        });

        // Print out debug to console.
        game.settings.register(SCRIPT_ID, settings.debug.id, {
            name: settings.debug.name,
            hint: settings.debug.hint,
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        // Use Array Length for RE discovery.
        game.settings.register(SCRIPT_ID, settings.rulesElementArrayLengthOnly.id, {
            name: settings.rulesElementArrayLengthOnly.name,
            hint: settings.rulesElementArrayLengthOnly.hint,
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        game.settings.register(SCRIPT_ID, settings.revitalize.id, {
            name: settings.revitalize.name,
            hint: settings.revitalize.hint,
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        game.settings.register(SCRIPT_ID,  settings.userIgnoreList.id, {
            name: settings.userIgnoreList.name,
            hint: settings.userIgnoreList.hint,
            scope: 'world',
            config: true,
            default: [],
            type: Array
        });
    }
}