import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { popup, debug, isTokenUUID } from "./utilities/RevitalizerUtilities";
import RevitalizerCalculator from "./RevitalizerCalculator.js";

import RevitalizerPresenter from "./ui/RevitalizerPresenter.js";
import RevitalizerSelection from "./ui/RevitalizerSelection.js";

import RevitalizerActorsSidebar from "./hooks/RevitalizerActorsSidebar";
import RevitalizerSceneSidebar from "./hooks/RevitalizerSceneSidebar";
import RevitalizerSheet from "./hooks/RevitalizerSheet";

export const revitalizerCheckHook = SCRIPT_ID + "-run-revitalizer-check";
export const selectionActorIdHook = SCRIPT_ID + "-selection-actor-ids";
export const selectionActorHook   = SCRIPT_ID + "-selection-actor";

export default class RevitalizerRunner {

    constructor() {
        // Register Sheet link for everyone
        new RevitalizerSheet();

        Hooks.on(revitalizerCheckHook, (actorIds) => this.#revitalizerCheckForActorUuids(actorIds));

        // The rest is for GM's eyes only
        if (!game.user.isGM)
            return;

        // Register Actor Tab Button for GM
        new RevitalizerActorsSidebar();

        Hooks.on(selectionActorIdHook, (actorIds) => this.#createSelectionBoxesForActorIds(actorIds));

        // Register Scene Tab Button for GM
        new RevitalizerSceneSidebar();

        Hooks.on(selectionActorHook, (actors) => this.#createSelection(actors));
    }

    revitalizerCalculator = new RevitalizerCalculator();
    revitalizerPresenter = new RevitalizerPresenter();
    
    /**
     * Runs Revitalizer Check for a list of Actor UUIDs
     * @param String[] actorIds
     * @returns 
     */
    //TODO. Is this still needed?
    async #revitalizerCheckForActorUuids(uuids) {
        if (!uuids)
            return;

        const actors = [];
        for(const uuid of uuids) {
            if (isTokenUUID(uuid)) {
                actors.push((await fromUuid(uuid)).actor);
            } else {
                actors.push(this.#getActorsFromIds([uuid])[0]);
            }
        };
        
        if (actors.filter(actor => actor).length > 0)
            return this.#runRevitalizerCheckForActors(actors);
        
        debug("No valid actors found");
        return;
    }

    /**
     * Runs Revitalizer Check for a list of Actor IDs
     * @param String actorId 
     * @returns 
     */
    async #createSelectionBoxesForActorIds(actorIds) {
        if (!actorIds)
            return;

        const actors = this.#getActorsFromIds(actorIds);
        
        if (actors)
            return await this.#createSelection(actors);
        
        popup("No valid actors found");
        return;
    }

    async #runRevitalizerCheckForActors(actors) {
        const changedData = await this.revitalizerCalculator.runRevitalizerCheck(actors);
        await this.revitalizerPresenter.present(changedData, actors);
    }

    #getActorsFromIds(actorIds) {
        const actors = [];
        actorIds.forEach((actorId) => {
            const actor = game.actors.get(actorId);
            
            if (actor)
                actors.push(actor);
        });
        return actors;
    }

    /**
     * Runs comparison for all Items in actors, comparing them to the Items in the PF2e Compendium
     * @param {_CharacterPF2e[]} actors list of Actors to display
     * @returns Array containing object with data required to display data
     */
    async #createSelection(actors) {
        // Don't start if there are no actors supplied
        if (!actors)
            return;
    
        debug(`Toggling display of ${actors.length} actors`);

        // Use ApplicationV2-based dialog
        const dialog = new RevitalizerSelection({
            actors,
            onProceed: async (selectedActors) => {
                await this.#runRevitalizerCheckForActors(selectedActors);
            }
        });
        dialog.render(true);
    }
}