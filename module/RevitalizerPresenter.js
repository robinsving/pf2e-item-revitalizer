import { title as SCRIPT_NAME } from "../module.json";
import { popup, info, settings, resultsTemplate, getSettings, getNestedProperty } from "./utilities/RevitalizerUtilities.js";
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

        const sortOrder = [
            "actor.name",
            "actorItem.type",
            "actorItem.system.category",
            "actorItem.system.level.value",
            "actorItem.system.traits.value",
            "actorItem.name"
        ];

        sortedItems.sort((a, b) => {
            for (const sorter of sortOrder) {
                const aSortValue = getNestedProperty(a, sorter) || "";
                const bSortValue = getNestedProperty(b, sorter) || "";

                if (aSortValue < bSortValue) {
                    return -1;
                } else if (aSortValue > bSortValue) {
                    return 1;
                }
            };

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

    #getType(data) {
        try {
            switch(data.actorItem.type) {
                case "spell":       return getNestedProperty(data, "actorItem.system.traits.value").includes("focus") ? "spell\u00A0(focus)" : "spell\u00A0(rank\u00A0" +  getNestedProperty(data, "actorItem.system.level.value") + ")";
                case "feat":        return "feat\u00A0(" + getNestedProperty(data, "actorItem.system.category").replace("feature", "") + ")";
                default:            return data.actorItem.type;
            }
        } catch (_ignore) {
            return data.actorItem.type;
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

            output = "";

            const results = [];

            for (const data of this.#sortChangedItems(changedData)) {
                const notes = this.#extrapolateNotes(data)

                results.push({
                    buttons: this.#getButtons(data, notes),
                    actorLink: await TextEditor.enrichHTML(data.actor.link, enrichOption),
                    type: this.#getType(data),
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
        }, {
            popout: true,
            classes: ["dialog", "pir-dialog"],
            resizable: true,
            width: 1024
        }).render(true);

        info(`Ending calculation of ${SCRIPT_NAME}`);
    }
}