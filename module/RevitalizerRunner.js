import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { popup, debug, selectionTemplate, resultsTemplate } from "./utilities/RevitalizerUtilities";
import RevitalizerCalculator from "./RevitalizerCalculator.js";
import RevitalizerSheet from "./hooks/RevitalizerSheet";
import RevitalizerSceneControl from "./hooks/RevitalizerSceneControl";
import RevitalizerPresenter from "./RevitalizerPresenter";
import RevitalizerActorsSidebar from "./hooks/RevitalizerActorsSidebar";
import RevitalizerSceneSidebar from "./hooks/RevitalizerSceneSidebar";
import { toggleAllHook } from "./hooks/RevitalizerCallbacks";

export const revitalizerCheckHook = SCRIPT_ID + "-run-revitalizer-check";
export const selectionActorIdHook = SCRIPT_ID + "-selection-actor-ids";
export const selectionActorHook   = SCRIPT_ID + "-selection-actor";

export default class RevitalizerRunner {

    constructor() {
        // Load HTML templates for everyone
        loadTemplates([selectionTemplate, resultsTemplate]);

        // Register Sheet link for everyone
        new RevitalizerSheet();

        Hooks.on(revitalizerCheckHook, (actorIds) => this.#revitalizerCheckForActorIds(actorIds));

        // The rest is for GM's eyes only
        if (!game.user.isGM)
            return;

        // Register Actor Tab Button for GM
        new RevitalizerActorsSidebar();

        Hooks.on(selectionActorIdHook, (actorIds) => this.#createSelectionBoxesForActorIds(actorIds));

        // Register Scene Tab Button for GM
        new RevitalizerSceneSidebar();

        Hooks.on(selectionActorHook, (actors, fromSceneControl) => this.#renderPirContainerElementForSelection(actors, fromSceneControl));
        
        // Register Scene Control Buttons for GM
        new RevitalizerSceneControl(this);
    }

    revitalizerCalculator = new RevitalizerCalculator();
    revitalizerPresenter = new RevitalizerPresenter();

    /**
     * Wait for an element (id) to be properly rendered on page
     * @param {*} id DOM element
     * @returns Promise that resolves when element is rendered
     */
    #waitForElementToBeRendered(id) {
        return new Promise(resolve => {
            if (document.getElementById(id)) {
                return resolve(document.getElementById(id));
            }

            const observer = new MutationObserver(() => {
                if (document.getElementById(id)) {
                    resolve(document.getElementById(id));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    /**
     * Runs Revitalizer Check for a list of Actor IDs
     * @param String[] actorIds
     * @returns 
     */
    async #revitalizerCheckForActorIds(actorIds) {
        if (!actorIds)
            return;

        const actors = this.#getActorsFromIds(actorIds);
        
        if (actors)
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
            return await this.#renderPirContainerElementForSelection(actors);
        
        popup("No valid actors found");
        return;
    }

    async #runRevitalizerCheckWithSelection() {
        const actors = await this.#extractActorsFromCheckboxes();
        this.#runRevitalizerCheckForActors(actors);
    }

    async #runRevitalizerCheckForActors(actors) {
        const changedData = await this.revitalizerCalculator.runRevitalizerCheck(actors);
        await this.revitalizerPresenter.present(changedData, actors);
    }

    async #extractActorsFromCheckboxes() {
        // Get the dialog
        let pirSelectionElement = await this.#waitForElementToBeRendered("pir-container-body");

        // Retrieve all checked checkboxes
        const checkboxes = pirSelectionElement.querySelectorAll("input[type='checkbox']:checked");

        // Retrieve all the actor IDs
        const actorIds = [];
        checkboxes.forEach((checkbox) => {
            actorIds.push(checkbox.value);
        });

        let actors = this.#getActorsFromIds(actorIds);

        return actors;
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

    // Create DOM of checkbox for one actor
    #createCheckbox(actor) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.defaultChecked = true; // Set the checkbox as checked by default
        checkbox.value = actor.id;
        checkbox.name = 'pir-actors';
    
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(actor.name));

        return label;
    }

    /**
     * Runs comparison for all Items in actors, comparing them to the Items in the PF2e Compendium
     * @param {_CharacterPF2e[]} actors list of Actors to display
     * @param {boolean} deprecatedWarning should deprecation warning be shown
     * @returns Array containing object with data required to display data
     */
    async #renderPirContainerElementForSelection(actors, deprecatedWarning) {
        debug(`Toggling display of ${actors.length} actors`);

        const pirSelectionElement = document.createElement("div")
        // Create checkboxes for each actor in the list
        actors.forEach((actor) => {
            const checkbox = this.#createCheckbox(actor);

            pirSelectionElement.appendChild(checkbox);
            pirSelectionElement.appendChild(document.createElement("br")); // Add a line break element
        });

        const rendered_html = await renderTemplate(selectionTemplate, {
            body: pirSelectionElement.innerHTML,
            click: `Hooks.call('${toggleAllHook}', this)`,
        });

        await new Dialog({
            title: SCRIPT_NAME,
            content: rendered_html,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-selection"></i>',
                    label: "Proceed",
                    callback: () => this.#runRevitalizerCheckWithSelection(),
                },
                cancel: {
                    icon: '<i class="fas fa-close"></i>',
                    label: "Close",
                },
            },
        }).render(true);

        if (deprecatedWarning) {
            await new Dialog({
                title: SCRIPT_NAME,
                content: `
                The Scene Control buttons will be Deprecated, as they are not suitable for modules.<br>
                The module will instead use three new locations:<br>
                - <i class='fas fa-map'></i>\tThe Scene Tab gives the same functionality as these buttons<br>
                - <i class='fas fa-user'></i>\tThe Actors Tab allows filtering using the Actor search<br>
                - <i class='fas fa-passport'></i>\tAny Character Sheet<br>
                <br>
                Look for the RF2e Item Revitalizer icon <i class='fas fa-code-compare'></i>`,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-selection"></i>',
                        label: "Yes, I will use those from now on",
                    },
                },
            }).render(true);
        }
    }
}