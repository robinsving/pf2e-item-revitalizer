import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../../module.json";
import { revitalizerCheckHook } from "../RevitalizerRunner";
import { getSettings, info, settings } from "../utilities/RevitalizerUtilities";
import { getNestedProperty } from "../utilities/RevitalizerUtilities.js";

export default class RevitalizerSheet {
    
    constructor() {
        // Wait for app to be ready
        Hooks.once('ready', () => {
            info("Creating Hooks for Sheet rendering")
            
            /**
             * Register hooks for all Character sheets
             */
            Object.values(CONFIG.Actor.sheetClasses.character)
                .map((sheetClass) => sheetClass.cls)
                .map((sheet) => sheet.name)
                .forEach((sheet) => { this.#registerHook(sheet) });

            // Skip NPCs for players
            if (!game.user.isGM) {
                return;
            }
            
            /**
             * Register hooks for all vehicle sheets
             */
            Object.values(CONFIG.Actor.sheetClasses.vehicle)
                .map((sheetClass) => sheetClass.cls)
                .map((sheet) => sheet.name)
                .forEach((sheet) => { this.#registerHook(sheet) });

            /**
             * Register hooks for all loot sheets
             */
            Object.values(CONFIG.Actor.sheetClasses.loot)
                .map((sheetClass) => sheetClass.cls)
                .map((sheet) => sheet.name)
                .forEach((sheet) => { this.#registerHook(sheet) });

            /**
             * Register hooks for party sheet
             */
            Object.values(CONFIG.Actor.sheetClasses.party)
                .map((sheetClass) => sheetClass.cls)
                .map((sheet) => sheet.name)
                .forEach((sheet) => { this.#registerHook(sheet) });

            // Skip NPCs for GMs pending on settings
            if (!getSettings(settings.showSheetButtonNPC.id)) {
                return;
            }

            /**
             * Register hooks for all NPC sheets
             */
            Object.values(CONFIG.Actor.sheetClasses.npc)
                .map((sheetClass) => sheetClass.cls)
                .map((sheet) => sheet.name)
                .forEach((sheet) => { this.#registerHook(sheet) });
        });
    }

    #registerHook(sheet) {
        Hooks.on("render" + sheet, (app, html, data) => {
            // Determine if button should be visible to user
            // If we don't own this actor, then don't draw anything
            if (!game.user.isGM && !data.actor.ownership.hasOwnProperty(game.userId))
                return;

            const actorId = getNestedProperty(data, "actor._id");

            if (!actorId)
                return;
            
            // add a "button" to the title bar of the sheet
            const className = `${SCRIPT_ID}-initiate-single-actor`;
            const button = $(`
                <a class="${className}" title="Check for new versions of this Actor's Items using ${SCRIPT_NAME}">
                    <i class="fas fa-solid fa-code-compare"></i>
                    Revitalize
                </a>`
            );

            // add onclick event to start a Revitalizer run for Actor Id
            button.click(() => Hooks.call(revitalizerCheckHook, [data.actor._id]));

            // remove any existing versions of button
            html.closest('.app').find(`.${className}`).remove();

            // add the new button
            let titleElement = html.closest('.app').find('.window-title');
            if (!app._minimized) button.insertAfter(titleElement);
        });
    }
}