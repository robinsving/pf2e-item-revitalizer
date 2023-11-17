import { title as SCRIPT_NAME } from "../module.json";
import { popup, info, settings, getAutoStyleSnippet, resultsTemplate, getSettings } from "./utilities/RevitalizerUtilities.js";
import { IMPORTANT_ITEM_TYPES } from "./utilities/RevitalizerSignificantProperties.js";
import RevitalizerCallbacks, { hideHook, removeHook, revitalizeHook } from "./hooks/RevitalizerCallbacks.js";

export default class RevitalizerPresenter {

    constructor() {
        // Register callback Hooks for triggering Check result actions
        new RevitalizerCallbacks();
    }

    // List of Properties which require complete remaking
    IMPORTANT_ITEM_PROPERTIES = ["traits", "slug", "rules", "heightening", "damage", "overlays", "type"];

    #extrapolateNotes(changedItems) {
        let notes = "";

        const actorSourceId = changedItems.actorItem.sourceId;
        if (actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary"))
            notes = notes.concat("Bestiary abilities. ");

        if (IMPORTANT_ITEM_TYPES.includes(changedItems.actorItem.type) && changedItems.comparativeData.filter(a => a != "icon-link").size > 0)
            notes = notes.concat("Important Type. ");
        else if (changedItems.comparativeData.some((value) => this.IMPORTANT_ITEM_PROPERTIES.includes(value)))
            notes = notes.concat("Important Property. ");

        if (notes)
            notes = notes.concat("Use manual recreation. ");

        return notes;
    }

    // Function to sort the changed items based on actorName, type, and name
    #sortChangedItems(changedItems) {
        const sortedItems = [...changedItems];

        sortedItems.sort((a, b) => {
            // Sort by actorName
            if (a.actor.name < b.actor.name) {
                return -1;
            } else if (a.actor.name > b.actor.name) {
                return 1;
            }

            // Sort by type if actorName is equal
            if (a.actorItem.type < b.actorItem.type) {
                return -1;
            } else if (a.actorItem.type > b.actorItem.type) {
                return 1;
            }

            // Sort by name if actorName and type are equal
            if (a.actorItem.name < b.actorItem.name) {
                return -1;
            } else if (a.actorItem.name > b.actorItem.name) {
                return 1;
            }

            return 0;
        });

        return sortedItems;
    }

    #getButtons(data, notes) {
        let unrevitalizable = getSettings(settings.revitalize.id) ? undefined : "Disabled in settings";

        if (!unrevitalizable && data.actorItem.actor.type != "character")
            unrevitalizable = "Only enabled for character Actors";

        if (!unrevitalizable && notes)
            unrevitalizable = "See notes";

        const csvSeparatedProperties = [...data.comparativeData].join(", ");

        return {
            "revitalize": {
                disabled: unrevitalizable ? unrevitalizable : false,
                icon: "fa-solid fa-code-compare",
                click: `Hooks.call('${revitalizeHook}', this, '${data.actorItem.uuid}', '${csvSeparatedProperties}')`,
                title: unrevitalizable
            },
            "hide": {
                disabled: !game.user.isGM ? "GM only" : false,
                icon: "fa-regular fa-eye-slash",
                click: `Hooks.call('${hideHook}', this, '${data.actorItem.uuid}')`,
                title: "Hide this Item in the future"
            },
            "remove": {
                icon: "fa-regular fa-check",
                click: `Hooks.call('${removeHook}', this)`,
                title: "Remove Item from list"
            },
        }
    }

    async present(changedData, actors) {
        
        popup(`Parsing complete. Rendering results`);

        // Generate output
        let output = "";

        // Check if any changed items are found
        if (changedData.length == 0) {
            const searchedActors = actors.map(actor => actor.name).join(', ') || "none";
            output = `<h2>✅ No changed items found</h2><p>Searched through the following actors:<br>${searchedActors}</p>`;
        } else {
            const enrichOption = {
                async: true
            };

            // Fetch style changes to handle Dialog element style issues
            output = getAutoStyleSnippet();

            const results = [];

            for (const data of this.#sortChangedItems(changedData)) {
                const notes = this.#extrapolateNotes(data)

                results.push({
                    buttons: this.#getButtons(data, notes),
                    actorLink: await TextEditor.enrichHTML(data.actor.link, enrichOption),
                    type: data.actorItem.type,
                    name: data.actorItem.name,
                    comparativeDataText: [...data.comparativeData].map((prop) => {
                        return this.IMPORTANT_ITEM_PROPERTIES.includes(prop) ? `<strong>${prop}</strong>` : prop;
                    }).join(", "),
                    actorItemLink: await TextEditor.enrichHTML(data.actorItem.link, enrichOption),
                    originItemLink: await TextEditor.enrichHTML(data.originItem.link, enrichOption),
                    notes: notes,
                });
            }
            output += await renderTemplate(resultsTemplate, { items: results });
        }

        await new Dialog({
            title: SCRIPT_NAME,
            content: output,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-selection"></i>',
                    label: "Done",
                },
            },
            default: 'ok',
        }).render(true);

        info(`Ending calculation of ${SCRIPT_NAME}`);
    }
}