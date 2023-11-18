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

        // Allow Revitalization (updating Items)
        game.settings.register(SCRIPT_ID, settings.revitalize.id, {
            name: settings.revitalize.name,
            hint: settings.revitalize.hint,
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        // Determine if user is allowed access, otherwise don't add the remaining settings
        if (!game.user.isGM && getSettings(settings.gm.id)) {
            return;
        }

        // Print out debug to console.
        game.settings.register(SCRIPT_ID, settings.debug.id, {
            name: settings.debug.name,
            hint: settings.debug.hint,
            scope: 'client',
            config: true,
            default: false,
            type: Boolean
        });

        // Use Array Length for RE discovery.
        game.settings.register(SCRIPT_ID, settings.rulesElementArrayLengthOnly.id, {
            name: settings.rulesElementArrayLengthOnly.name,
            hint: settings.rulesElementArrayLengthOnly.hint,
            scope: 'client',
            config: true,
            default: false,
            type: Boolean
        });

        // List of ignored Items
        game.settings.register(SCRIPT_ID,  settings.itemIgnoreList.id, {
            name: settings.itemIgnoreList.name,
            hint: settings.itemIgnoreList.hint,
            scope: 'client',
            config: true,
            default: "",
            type: String
        });

        // List of ignored properties
        game.settings.register(SCRIPT_ID,  settings.propertyIgnoreList.id, {
            name: settings.propertyIgnoreList.name,
            hint: settings.propertyIgnoreList.hint,
            scope: 'client',
            config: true,
            default: "",
            type: String
        });

        // Last migration, in case I will need to run 
        game.settings.register(SCRIPT_ID,  settings.completedMigration.id, {
            name: settings.completedMigration.name,
            hint: settings.completedMigration.hint,
            scope: 'client',
            config: false,
            default: 0,
            type: Number
        });

        // Migrate settings from Arrays (which was the original) to CSV-Strings. Also, remove duplicates
        Hooks.once("ready", async () =>{
            try {
                // Migration 1
                if (getSettings(settings.completedMigration.id) === 0) {
                    await game.settings.set(SCRIPT_ID, settings.completedMigration.id, 1);
                    // Validate settings
                    [settings.itemIgnoreList.id, settings.propertyIgnoreList.id].forEach(async id => {
                        var setting = getSettings(id);
                        // fix move from Array to String
                        setting = setting.replaceAll(/[\]\[\"\s]/gm, "");
                        setting = Array.from(new Set(setting.split(","))).join(',')
                        
                        await game.settings.set(SCRIPT_ID, id, setting)
                    });
                }
            } catch (_error) {}

        });
    }
}