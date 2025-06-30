import { title as SCRIPT_NAME } from "../../module.json";

const selectionDialogTemplate = "modules/pf2e-item-revitalizer/templates/selection-dialog.hbs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export default class RevitalizerSelection extends HandlebarsApplicationMixin(ApplicationV2) {
    // register variable to hold the keypress listener state
    #hasKeyPress;
    toggleAll = true;

    static DEFAULT_OPTIONS = {
        id: "pir-selection-dialog",

        actions: {
            toggleAll: RevitalizerSelection.toggleAll,
        },

        position: {
            width: 400,
            height: "auto",
        },

        tag: "form",
        form: {
            handler: RevitalizerSelection.proceed,
            submitOnChange: false,
            closeOnSubmit: true
        },

        classes: ["dialog", "pir-dialog"],
        window: {
            title: SCRIPT_NAME,
            icon: "fas fa-solid fa-code-compare",
            frame: true,
            resizable: true,
        }
    }

    static PARTS = {
        form: {
            template: selectionDialogTemplate
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        }
    }

    /**
     * Instantiate a new RevitalizerSelection dialog.
     * @param {Array} options.actors - Array of actor objects to be displayed in the selection dialog.
     * @param {Function} options.onProceed - Callback function to be called when the user proceeds with the selection.
     * @returns {RevitalizerSelection} A new instance of the RevitalizerSelection dialog.
     * */
    constructor({ actors, onProceed }) {
        super();
        this.actors = actors;
        this.onProceed = onProceed;
    }

    /**
     * Prepare the context for the dialog.
     * @returns {Object} The context object containing the buttons for generic footer template, and rendering data.
     */
    _prepareContext() {
        return {
            buttons: [
                { type: "submit", action: "proceed", icon: "fa-solid fa-code-compare", label: "Proceed" },
                { type: "close", action: "close", icon: "fa-solid fa-x", label: "Close" }
            ],
            actors: this.actors.map(actor => ({
                actor: actor,
                isChecked: this.toggleAll,
            })),
            toggleAll: this.toggleAll,
        };
    }

    async _onRender(options) {
        await super._onRender(options);

        // Don't add another listener if one already exists
        if (!this.#hasKeyPress){
            // Need to remember binded function to later remove
            this.#hasKeyPress = this._onKeyPress.bind(this);
            document.addEventListener("keypress", this.#hasKeyPress);
        }
    }

    _onKeyPress(event) {
        if (event.key == "Enter"){
            this.submit(event);
        }
    }

    close() {
        super.close();
        document.removeEventListener("keypress", this.#hasKeyPress);
    }

    static toggleAll(event, target) {
        this.toggleAll = target.checked;
        this.render();
    }


    static async proceed(e, f, formData) {
        const selectedIds = formData.object['pir-actors'].filter(id => id !== null)
        const selectedActors = this.actors.filter(actor => selectedIds.includes(actor.id));
        this.close();
        if (this.onProceed) await this.onProceed(selectedActors);
    }
}
