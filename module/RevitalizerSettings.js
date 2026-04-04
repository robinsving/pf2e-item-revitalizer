import { id as SCRIPT_ID } from "../module.json";
import { getSettings, settings } from "./utilities/RevitalizerUtilities.js";
import RevitalizerPropertyIgnoreMenu from "./ui/RevitalizerPropertyIgnoreMenu.js";
import RevitalizerItemIgnoreMenu from "./ui/RevitalizerItemIgnoreMenu.js";

export default class RevitalizerSettings {
    
    constructor() {
        // Hide the interface for non-GMs.
        game.settings.register(SCRIPT_ID, settings.gm.id, {
            name: game.i18n.localize(settings.gm.name),
            hint: game.i18n.localize(settings.gm.hint),
            scope: 'world',
            config: true,
            default: true,
            type: Boolean
        });

        // Allow Revitalization (updating Items)
        game.settings.register(SCRIPT_ID, settings.revitalize.id, {
            name: game.i18n.localize(settings.revitalize.name),
            hint: game.i18n.localize(settings.revitalize.hint),
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });

        // Determine if user is allowed access, otherwise don't add the remaining settings
        if (!game.user.isGM && getSettings(settings.gm.id)) {
            return;
        }

        // Show/hide the top bar button for NPC Sheets
        game.settings.register(SCRIPT_ID, settings.showSheetButtonNPC.id, {
            name: game.i18n.localize(settings.showSheetButtonNPC.name),
            hint: game.i18n.localize(settings.showSheetButtonNPC.hint),
            scope: 'world',
            config: true,
            default: true,
            requiresReload: true,
            type: Boolean,
        });
        
        // Print out debug to console.
        game.settings.register(SCRIPT_ID, settings.debug.id, {
            name: game.i18n.localize(settings.debug.name),
            hint: game.i18n.localize(settings.debug.hint),
            scope: 'client',
            config: true,
            default: false,
            type: Boolean
        });

        // Use Array Length for RE discovery.
        game.settings.register(SCRIPT_ID, settings.rulesElementArrayLengthOnly.id, {
            name: game.i18n.localize(settings.rulesElementArrayLengthOnly.name),
            hint: game.i18n.localize(settings.rulesElementArrayLengthOnly.hint),
            scope: 'client',
            config: true,
            default: false,
            type: Boolean
        });

        // Register the ignored items list data
        game.settings.register(SCRIPT_ID, settings.itemIgnoreList.id, {
            name: game.i18n.localize(settings.itemIgnoreList.name),
            hint: game.i18n.localize(settings.itemIgnoreList.hint),
            scope: 'client',
            config: false,
            default: [],
            type: Array
        });

        // Settings menu to view/remove ignored items
        game.settings.registerMenu(SCRIPT_ID, settings.itemIgnoreList.id, {
            name: game.i18n.localize(settings.itemIgnoreList.name),
            hint: game.i18n.localize(settings.itemIgnoreList.hint),
            label: game.i18n.localize(settings.itemIgnoreList.label),
            icon: "fas fa-eye-slash",
            type: RevitalizerItemIgnoreMenu,
            restricted: false,
        });

        // Register the ignored properties list data
        game.settings.register(SCRIPT_ID, settings.propertyIgnoreList.id, {
            name: game.i18n.localize(settings.propertyIgnoreList.name),
            hint: game.i18n.localize(settings.propertyIgnoreList.hint),
            scope: 'client',
            config: false,
            default: ["publication"],
            type: Array
        });

        // Settings menu to configure the ignored properties list
        game.settings.registerMenu(SCRIPT_ID, settings.propertyIgnoreList.id, {
            name: game.i18n.localize(settings.propertyIgnoreList.name),
            hint: game.i18n.localize(settings.propertyIgnoreList.hint),
            label: game.i18n.localize(settings.propertyIgnoreList.label),
            icon: "fas fa-list",
            type: RevitalizerPropertyIgnoreMenu,
            restricted: false,
        });

        // Tracks last migration, in case I will need to run update scripts
        game.settings.register(SCRIPT_ID,  settings.completedMigration.id, {
            name: game.i18n.localize(settings.completedMigration.name),
            hint: game.i18n.localize(settings.completedMigration.hint),
            scope: 'client',
            config: false,
            default: 0,
            type: Number
        });

        // Migration settings
        Hooks.once("ready", async () => {
            try {
                // Migration 1: Stringified Arrays → CSV strings
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

                // Migration 2: CSV strings → Arrays
                if (getSettings(settings.completedMigration.id) === 1) {
                    await game.settings.set(SCRIPT_ID, settings.completedMigration.id, 2);
                    for (const id of [settings.itemIgnoreList.id, settings.propertyIgnoreList.id]) {
                        const setting = getSettings(id);
                        if (typeof setting === "string") {
                            const arr = setting.split(",").map(s => s.trim()).filter(s => s.length > 0);
                            await game.settings.set(SCRIPT_ID, id, arr);
                        }
                    }
                    
                }

                // Migration 3: Arrays adjustment for arrays that contain commas
                if (getSettings(settings.completedMigration.id) === 2) {                    
                    await game.settings.set(SCRIPT_ID, settings.completedMigration.id, 3);
                    for (const id of [settings.itemIgnoreList.id, settings.propertyIgnoreList.id]) {
                        const setting = getSettings(id);
                        if (Array.isArray(setting)) {
                            const updated = setting
                                .flatMap(entry => typeof entry === "string" ? entry.split(",") : [])
                                .map(entry => entry.trim())
                                .filter(entry => entry.length > 0);
                            await game.settings.set(SCRIPT_ID, id, updated);
                        }
                    }
                }
            } catch (_error) {}
        });
    }
}
