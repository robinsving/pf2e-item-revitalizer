import { RevitalizerCalculator } from "./RevitalizerCalculator.js";
import { popup, debug, getAutoStyleSnippet } from "./RevitalizerUtilities.js";
import { title as SCRIPT_NAME } from "../module.json";
import selectionDialogHtml from "../templates/selection-dialog.html?raw";

export class Revitalizer {

    revitalizerCalculator = new RevitalizerCalculator();

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

    async #runRevitalizerWithSelection() {
        const actors = await this.#extractActorsFromCheckboxes();
        await this.revitalizerCalculator.runPIR(actors);
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

        let actors = this.#getActorsFromSelection((token) => actorIds.includes(token.id));

        return actors;
    }

    // Create DOM of checkbox for one actor
    #createCheckbox(actor) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Set the checkbox as checked by default
        checkbox.value = actor.id;
        checkbox.name = 'actors';
    
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(actor.name));

        return label;
    }

    async #renderPirContainerElementForSelection(actors) {
        debug(`Toggling display of ${actors.length} actors`);

        await new Dialog({
            title: SCRIPT_NAME,
            content: getAutoStyleSnippet() + selectionDialogHtml,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-selection"></i>',
                    label: "Proceed",
                    callback: () => this.#runRevitalizerWithSelection(),
                },
                cancel: {
                    icon: '<i class="fas fa-close"></i>',
                    label: "Close",
                },
            },
        }).render(true);

        let pirSelectionElement = await this.#waitForElementToBeRendered("pir-container-body");

        // Create checkboxes for each actor in the list
        actors.forEach((actor) => {
            const checkbox = this.#createCheckbox(actor);

            pirSelectionElement.appendChild(checkbox);
            pirSelectionElement.appendChild(document.createElement("br")); // Add a line break element
        });
    }

    // Filter out Actors (based on selection from Scene Control button pressed)
    #getActorsFromSelection(actorSelection) {
        debug(`Filtering using ${actorSelection}`)
        // Get all available actors
        let actors = canvas.tokens.placeables
            .filter(token => token.actor).map(token => token.actor)  // Filter out actors
            .filter(actorSelection);                                 // Filter out according to selection, e.g. ownership

        return actors;
    }

    async start(actorSelection) {
        let actors = this.#getActorsFromSelection(actorSelection);

        if (!actors.length) {
            popup(`No actors found matching selection`);
            return;
        }
        
        await this.#renderPirContainerElementForSelection(actors)
    }
}