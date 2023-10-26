import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { settings, getNestedProperty } from "./RevitalizerUtilities.js";

export class RevitalizerSheetRegister {
    
    constructor(revitalizer) {
        this.revitalizer = revitalizer;

        // Determine if button should be visible to user
        if (!game.user.isGM && game.settings.get(SCRIPT_ID, settings.gm.id)) {
            debug("User is not permitted to see anything")
            // Don't display anything
            return;
        }
        
        /**
         * Register hooks for all Character sheets
         */
        Object.values(CONFIG.Actor.sheetClasses.character)
            .map((sheetClass) => sheetClass.cls)
            .map((sheet) => sheet.name)
            .forEach((sheet) => { this.#registerHook(sheet) });

        if (!game.user.isGM) {
            return;
        }

        /**
         * Register hooks for all NPC sheets
         */
        Object.values(CONFIG.Actor.sheetClasses.npc)
            .map((sheetClass) => sheetClass.cls)
            .map((sheet) => sheet.name)
            .forEach((sheet) => { this.#registerHook(sheet) });
    }

    #registerHook(sheet) {
        Hooks.on("render" + sheet, (app, html, data) => {
            // if we don't have access to this actor, then don't draw anything
            if (!game.user.isGM && !data.actor.ownership.hasOwnProperty(game.userId))
                return;

            const actorId = getNestedProperty(data, "actor._id");

            if (!actorId)
                return;

                
            const className = `${SCRIPT_ID}-initiate-single-actor`;
            const button = $(`
                <a class="${className}" title="Check for new versions of this Actor's Items using ${SCRIPT_NAME}">
                    <i class="fas fa-solid fa-code-compare"></i>
                    Revitalize
                </a>`
            );

            // add onclick event to start a Revitalizer run for Actor Id
            button.click(() => { this.revitalizer.runRevitalizerForActorId(data.actor._id)});

            // remove any existing versions of button
            html.closest('.app').find(`.${className}`).remove();

            // add the new button
            let titleElement = html.closest('.app').find('.window-title');
            if (!app._minimized) button.insertAfter(titleElement);
        });
    }
}