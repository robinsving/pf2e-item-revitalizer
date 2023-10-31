import { id as SCRIPT_ID } from "../module.json";
import { getSettings, settings } from "./utilities/RevitalizerUtilities.js";

export default class RevitalizerSettings {
    
    constructor() {
        // Hide the interface for non-GMs.
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

        // Allow Revitalization (updating Items)
        game.settings.register(SCRIPT_ID, settings.revitalize.id, {
            name: settings.revitalize.name,
            hint: settings.revitalize.hint,
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        // List of ignored Items
        game.settings.register(SCRIPT_ID,  settings.itemIgnoreList.id, {
            name: settings.itemIgnoreList.name,
            hint: settings.itemIgnoreList.hint,
            scope: 'world',
            config: true,
            default: "",
            type: String
        });

        // List of ignored properties
        game.settings.register(SCRIPT_ID,  settings.propertyIgnoreList.id, {
            name: settings.propertyIgnoreList.name,
            hint: settings.propertyIgnoreList.hint,
            scope: 'world',
            config: true,
            default: "",
            type: String
        });

        // Migrate settings from Arrays (which was the original) to CSV-Strings. Also, remove duplicates
        Hooks.once("ready", () =>{
            try {
                // Validate settings
                [settings.itemIgnoreList.id, settings.propertyIgnoreList.id].forEach(async id => {
                    var setting = getSettings(id);
                    // fix move from Array to String
                    setting = setting.replaceAll(/[\]\[\"\s]/gm, "");
                    setting = Array.from(new Set(setting.split(","))).join(',')
                    
                    await game.settings.set(SCRIPT_ID, id, setting)
                }) 
            } catch (_error) {}
        })
    }
}