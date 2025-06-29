import { title as SCRIPT_NAME } from "../module.json";
import { popup, info, settings, resultsTemplate, getSettings, getNestedProperty } from "./utilities/RevitalizerUtilities.js";
import { IMPORTANT_ITEM_PROPERTIES } from "./utilities/RevitalizerSignificantProperties.js";
import RevitalizerCallbacks, { hideHook, removeHook, revitalizeHook, refreshFromCompendiumHook } from "./hooks/RevitalizerCallbacks.js";

export default class RevitalizerPresenter {

    constructor() {
        // Register callback Hooks for triggering Check result actions
        new RevitalizerCallbacks();
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
    
    #sourceIsBestiary(actorSourceId) {
        return actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary");
    }

    #hasUnrevitalizableReason(data, revitalizableProperties) {
        if (!getSettings(settings.revitalize.id))
            return "Disabled in settings";

        if (revitalizableProperties.length === 0)
            return "Revitalize will not recreate remaining properties";

        if (this.#sourceIsBestiary(data.actorItem.sourceId))
            return "Bestiary abilities sometimes have purposeful changes from Compendium. Only change if you know what you are doing";

        return "";
    }

    #isRefreshable(data) {
        let isRefreshable = data.canRefreshFromCompendium;

        if (isRefreshable && this.#sourceIsBestiary(data.actorItem.sourceId)) {
            isRefreshable = false;
        }

        return isRefreshable;
    }

    #getButtons(data) {
        const csvSeparatedProperties = [...data.comparativeData].join(", ");
        const revitalizableProperties = [...data.comparativeData].filter(item => !IMPORTANT_ITEM_PROPERTIES.includes(item));

        const unrevitalizableReason = this.#hasUnrevitalizableReason(data, revitalizableProperties);
        
        const isRevitalizable = unrevitalizableReason === "";

        const isRefreshable = this.#isRefreshable(data)

        return {
            "refresh": {
                disabled: isRefreshable ? false : "Not available on this Item (Rule Engine or Bestiary Item Source prevents Refresh)" + (getSettings(settings.revitalize.id) ? "" : ". Recreate Item, or check the module settings for potential backup Refresh option"),
                hidden: !isRefreshable && isRevitalizable,
                icon: "fa-solid fa-sync-alt",
                click: `Hooks.call('${refreshFromCompendiumHook}', this, '${data.actorItem.uuid}')`,
                title: `Refresh entire object from Compendium using PF2e built-in method`
            },
            "revitalize": {
                disabled: isRevitalizable ? false : true,
                hidden: isRefreshable || !isRevitalizable,
                icon: "fa-light fa-code-compare",
                click: `Hooks.call('${revitalizeHook}', this, '${data.actorItem.uuid}', '${csvSeparatedProperties}')`,
                title: `Not possible to Refresh whole item. Click to update the following properties: ${revitalizableProperties.join(", ")}`
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
                case "action":      return "action\u00A0" + (this.#sourceIsBestiary(data.actorItem.sourceId) ? "(bestiary)" : "");
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
            let hasImportantProperty = false;
            for (const data of this.#sortChangedItems(changedData)) {
                results.push({
                    buttons: this.#getButtons(data),
                    actorLink: await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actor.link, enrichOption),
                    type: this.#getType(data),
                    comparativeDataText: [...data.comparativeData].map((prop) => {
                        if (IMPORTANT_ITEM_PROPERTIES.includes(prop)) {
                            hasImportantProperty = true;
                            return `<strong>${prop}*</strong>`
                        } else {
                            return prop;
                        }
                    }).join(", "),
                    actorItemLink: await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.actorItem.link, enrichOption),
                    originItemLink: await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.originItem.link, enrichOption),
                });

            }
            output += await foundry.applications.handlebars.renderTemplate(resultsTemplate, { items: results, hasImportantProperty: hasImportantProperty });
        }

        await new Dialog({
            title: SCRIPT_NAME,
            content: output,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-selection"></i>',
                    label: "Done",
                    callback: () => popup("Don't forget to Reload Application to clear Companion data from memory", { permanent: true, console: false })
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