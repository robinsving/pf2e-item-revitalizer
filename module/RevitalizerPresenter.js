import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";
import { popup, info, debug, settings, getAutoStyleSnippet, resultsTemplate, getNestedProperty, getSettings } from "./RevitalizerUtilities.js";
import { IMPORTANT_ITEM_TYPES, PROPERTY_ALLOW_LIST, PROPERTY_ALLOW_LIST_BASE, SPECIAL_ITEM_PROPERTIES } from "./RevitalizerSignificantProperties.js";
import RevitalizerCallbacks from "./hooks/RevitalizerCallbacks.js";

export default class RevitalizerPresenter {

    constructor() {
        // Register callback Hooks for triggering Check result actions
        new RevitalizerCallbacks();
    }

    // List of Properties which require complete remaking
    IMPORTANT_ITEM_PROPERTIES = ["slug", "rules", "heightening", "damage", "overlays", "type"];

    // Function to clone the allowed properties from an object
    #allowedPropertyClone(obj, allowList) {
        return Object.keys(allowList).reduce((allowObj, key) => {
            if (!obj || !obj.hasOwnProperty(key)) {
                // Exclude properties not present in the object
            } else if (allowList[key] === true) {
                // Specific handling
                allowObj[key] = obj[key];
            } else if (Array.isArray(obj[key])) {
                if (getSettings(settings.rulesElementArrayLengthOnly.id))
                    allowObj[key] = obj[key].length;
                else
                    allowObj[key] = obj[key].map((i) => typeof i === "object" ? this.#allowedPropertyClone(i, allowList[key]) : i);
            } else if (obj[key] === null) {
                allowObj[key] = null;
            } else if (typeof obj[key] === "object") {
                allowObj[key] = this.#allowedPropertyClone(obj[key], allowList[key]);
            } else {
                allowObj[key] = obj[key];
            }

            return allowObj;
        }, {});
    }

    // Function to include only allowed properties in the cloned items
    #createShallowClones(originItem, actorItem) {
        const type = actorItem.type;
        // Clone the items
        const clones = {
            origin: duplicate(originItem).system,
            actor: duplicate(actorItem).system,
        };

        //debug(JSON.stringify(clones.actor));
        //debug(JSON.stringify(clones.origin));

        for (let [key, value] of Object.entries(clones)) {
            if (PROPERTY_ALLOW_LIST.hasOwnProperty(type)) {
                clones[key] = this.#allowedPropertyClone(value, PROPERTY_ALLOW_LIST[type]);
            } else {
                info(`${type} is not yet a properly handled Item type, defaulting to base class`);
                clones[key] = this.#allowedPropertyClone(value, PROPERTY_ALLOW_LIST_BASE);
            }
        }

        return clones;
    }

    // Function to get the properties that differ between two Items
    #getDifferentiatingProperties(originItem, actorItem) {
        const differentProperties = [];

        // Sort the JSON stringify ordering so that the properties does not matter
        const sorter = (_key, value) =>
            value instanceof Object && !(value instanceof Array) ?
                Object.keys(value)
                    .sort()
                    .reduce((sorted, key) => {
                        sorted[key] = value[key];
                        return sorted
                    }, {}) :
                value;

        // Get all distinct keys in either Item
        const allKeys = [...Object.keys(actorItem), ...Object.keys(originItem)];
        for (const key of new Set(allKeys)) {
            var humanReadableName = actorItem.slug || actorItem.name;

            // Since we are looking for keys in the Item, the corresponding key may not even exist in the other Item
            if (!originItem.hasOwnProperty(key) || !actorItem.hasOwnProperty(key)) {
                debug(`Found differences in ${key} for Item ${humanReadableName}:`);
                debug(`Actor's ${humanReadableName} (${key}) is: ${JSON.stringify(actorItem[key])}`);
                debug(`Compendium's ${humanReadableName} (${key}) is: ${JSON.stringify(originItem[key])}`);

                // sometimes Foundry adds default values
                if (actorItem[key] !== null && actorItem[key] !== 0)
                    differentProperties.push(key);
                else
                    debug(`Ignored due to no value set (null, 0)`)
                continue;
            }
            
            /**
            * Create the JSON strings, but replace style formatting, as that may adjust spaces in browsers
            * e.g. the differences of the following lines:
            *   <span style=\"float:right\">  ->   <span style=\"float: right;\">
            *   @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]{Attack of Opportunity} -> @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]
            *   @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]  -> @Compendium[pf2e.actionspf2e.KAVf7AmRnbCAHrkT]    -- Common with e.g. items from Adventure Paths
            *   @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]  -> @Compendium[pf2e.actionspf2e.Item.KAVf7AmRnbCAHrkT]    -- A renaming recently done by the PF2e devs
            */
            const inlineStylePattern = /style=\\".*\\"/gm;
            const uuidNamePattern = /\{[\s\w-':()]+\}/gm;
            const uuidCompendiumFix = "@UUID[Compendium.";
            const uuidItemFix = ".Item.";
            const nullFix = ":0";
            const nullFix2 = "\"\"";
            const nullFix3 = /,?\"[^\"]+\":null,?/gm;
            const applyMod = "\"applyMod\":false,";

            const actorJson = JSON.stringify(actorItem[key], sorter)
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[")
                .replaceAll(uuidItemFix, ".")
                .replaceAll(nullFix, ":null")
                .replaceAll(nullFix2, "null")
                .replaceAll(nullFix3, ",")
                .replaceAll(applyMod, "")

            const originJson = JSON.stringify(originItem[key], sorter)
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[")
                .replaceAll(uuidItemFix, ".")
                .replaceAll(nullFix, ":null")
                .replaceAll(nullFix2, "null")
                .replaceAll(nullFix3, ",")
                .replaceAll(applyMod, "")

            // If we find differences in the property
            if (actorJson !== originJson) {
                debug(`Found differences in ${key} for Item ${humanReadableName}:`);
                debug(`Actor's ${humanReadableName} (${key}) is: ${actorJson}`);
                debug(`Compendium's ${humanReadableName} (${key}) is: ${originJson}`);
                differentProperties.push(key);
            }
        }

        return differentProperties;
    }

    // Function to compare two items and find their differences
    #compareItems(originItem, actorItem) {
        debug(`Parsing item ${actorItem.name}`);

        const clones = this.#createShallowClones(originItem, actorItem);

        const differences = new Set(this.#getDifferentiatingProperties(clones.origin, clones.actor));

        // Special property handler
        // if there is a non-system property we need to handle, e.g. "item.img", then check the similarities for these as well
        SPECIAL_ITEM_PROPERTIES.forEach(specialProperty => {
            if (getNestedProperty(originItem, specialProperty.path) != getNestedProperty(actorItem, specialProperty.path))
                differences.add(specialProperty.name);
        });

        return differences;
    }

    #extrapolateNotes(changedItems) {
        let notes = "";

        const actorSourceId = changedItems.actorItem.sourceId;
        if (actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary"))
            notes = notes.concat("Bestiary abilities. ");

        if (IMPORTANT_ITEM_TYPES.includes(changedItems.actorItem.type))
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
                click: `Hooks.call('${SCRIPT_ID}-revitalize', this, '${data.actorItem.uuid}', '${csvSeparatedProperties}')`,
                title: unrevitalizable
            },
            "hide": {
                disabled: !game.user.isGM ? "GM only" : false,
                icon: "fa-regular fa-eye-slash",
                click: `Hooks.call('${SCRIPT_ID}-hide', this, '${data.actorItem.uuid}')`,
                title: "Hide this Item in the future"
            },
            "remove": {
                icon: "fa-regular fa-check",
                click: `Hooks.call('${SCRIPT_ID}-remove', this)`,
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