import { RevitalizerCalculator } from "./RevitalizerCalculator.js";
import { popup, debug, selectionTemplate } from "./RevitalizerUtilities.js";
import { title as SCRIPT_NAME } from "../module.json";

export default class Revitalizer {

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

    async runRevitalizerForActorId(actorId) {
        const actor = game.actors.get(actorId);

        if (!actor) {
            debug("ActorId not found: {}", actorId);
            return;
        }
            
        await this.revitalizerCalculator.runPIR([actor]);
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
        checkbox.defaultChecked = true; // Set the checkbox as checked by default
        checkbox.value = actor.id;
        checkbox.name = 'pir-actors';
    
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(actor.name));

        return label;
    }

    async #renderPirContainerElementForSelection(actors) {
        debug(`Toggling display of ${actors.length} actors`);

        let pirSelectionElement = document.createElement("div")
        // Create checkboxes for each actor in the list
        actors.forEach((actor) => {
            const checkbox = this.#createCheckbox(actor);

            pirSelectionElement.appendChild(checkbox);
            pirSelectionElement.appendChild(document.createElement("br")); // Add a line break element
        });

        const rendered_html = await renderTemplate(selectionTemplate, {body: pirSelectionElement.innerHTML});

        await new Dialog({
            title: SCRIPT_NAME,
            content: rendered_html,
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
    }

    // Filter out Actors (based on selection from Scene Control button pressed)
    #getActorsFromSelection(actorSelection) {
        debug(`Filtering using ${actorSelection}`)
        // Get all available actors
        let actors = canvas.tokens.placeables
            .filter(token => token.actor).map(token => token.actor) // Filter out actors
            .filter(actorSelection)                                 // Filter out according to selection, e.g. ownership
            .sort((a, b) => (a.name > b.name) ? 1 : -1)             // Sort by actor name

        return actors;
    }

    async start(actorSelection) {
        // Don't start if already running
        if (document.getElementById("pir-container-body")) {
            popup(`Selection already ongoing`);
            return;
        }
        
        let actors = this.#getActorsFromSelection(actorSelection);

        if (!actors.length) {
            popup(`No actors found matching selection`);
            return;
        }
        
        // Start the selection Dialog
        await this.#renderPirContainerElementForSelection(actors)
    }
}