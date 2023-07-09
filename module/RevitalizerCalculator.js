import { title as SCRIPT_NAME } from "../module.json";
import { info, debug, getAutoStyleSnippet } from "./RevitalizerUtilities.js";

export class RevitalizerCalculator {
    constructor() {}

    // Allowlist of properties to include in the clone
    PF2E_PROPERTY_ALLOW_LIST = {
        baseItem: true,
        description: {
            gm: true,
            value: true,
        },
        slug: true,
        rules: true,
        traits: {
            rarity: true,
            value: true,
        },
    };

    // List of Items to locate
    // TODO: register list to settings/storage, and allow user to select what to allow
    PF2E_PROPERTY_ITEMS = ["action", "ancestry", "armor", "background", "backpack", "book", "class", "condition", "consumable", "deity", "effect", "equipment", "feat", "heritage", "kit", "spell", "spellcastingEntry", "treasure", "weapon"];

    // List of Items to ignore
    // TODO: register list to settings/storage, and allow user to add their own things to this list
    PF2E_IGNORABLE_ITEM_UUIDS = [
        "Compendium.pf2e.equipment-srd.Item.UJWiN0K3jqVjxvKk", // Wand, lvl 1
        "Compendium.pf2e.equipment-srd.Item.vJZ49cgi8szuQXAD", // Wand, lvl 2
        "Compendium.pf2e.equipment-srd.Item.wrDmWkGxmwzYtfiA", // Wand, lvl 3
        "Compendium.pf2e.equipment-srd.Item.Sn7v9SsbEDMUIwrO", // Wand, lvl 4
        "Compendium.pf2e.equipment-srd.Item.5BF7zMnrPYzyigCs", // Wand, lvl 5
        "Compendium.pf2e.equipment-srd.Item.kiXh4SUWKr166ZeM", // Wand, lvl 6
        "Compendium.pf2e.equipment-srd.Item.nmXPj9zuMRQBNT60", // Wand, lvl 7
        "Compendium.pf2e.equipment-srd.Item.Qs8RgNH6thRPv2jt", // Wand, lvl 8
        "Compendium.pf2e.equipment-srd.Item.Fgv722039TVM5JTc", // Wand, lvl 9
        
        "Compendium.pf2e.equipment-srd.Item.RjuupS9xyXDLgyIr", // Scroll, lvl 1
        "Compendium.pf2e.equipment-srd.Item.Y7UD64foDbDMV9sx", // Scroll, lvl 2
        "Compendium.pf2e.equipment-srd.Item.ZmefGBXGJF3CFDbn", // Scroll, lvl 3
        "Compendium.pf2e.equipment-srd.Item.QSQZJ5BC3DeHv153", // Scroll, lvl 4
        "Compendium.pf2e.equipment-srd.Item.tjLvRWklAylFhBHQ", // Scroll, lvl 5
        "Compendium.pf2e.equipment-srd.Item.4sGIy77COooxhQuC", // Scroll, lvl 6
        "Compendium.pf2e.equipment-srd.Item.fomEZZ4MxVVK3uVu", // Scroll, lvl 7
        "Compendium.pf2e.equipment-srd.Item.iPki3yuoucnj7bIt", // Scroll, lvl 8
        "Compendium.pf2e.equipment-srd.Item.cFHomF3tty8Wi1e5", // Scroll, lvl 9
        "Compendium.pf2e.equipment-srd.Item.o1XIHJ4MJyroAHfF", // Scroll, lvl 10

        "Compendium.pf2e.equipment-srd.Item.tLa4bewBhyqzi6Ow" // Cantrip deck
    ];

    // Function to clone the allowed properties from an object
    #allowedPropertyClone(obj, allowList) {
        return Object.keys(allowList).reduce((allowObj, key) => {
            if (!obj.hasOwnProperty(key)) {
                // Exclude properties not present in the object
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
        // Clone the items
        const clones = {
            origin: duplicate(originItem).system,
            actor: duplicate(actorItem).system,
        };

        for (let [key, value] of Object.entries(clones)) {
            clones[key] = this.#allowedPropertyClone(value, this.PF2E_PROPERTY_ALLOW_LIST);
        }

        return clones;
    }

    // Function to get the properties that differ between two Items
    #getDifferentiatingProperties(originItem, actorItem) {
        const differentProperties = [];

        for (const key in actorItem) {
            /**
            * Create the JSON strings, but replace style formatting, as that may adjust spaces in browsers
            * e.g. the differences of the following lines:
            *   <span style=\"float:right\">  ->   <span style=\"float: right;\">
            *   @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]{Attack of Opportunity} -> @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]
            *   @UUID[Compendium.pf2e.actionspf2e.KAVf7AmRnbCAHrkT]  -> @Compendium[pf2e.actionspf2e.KAVf7AmRnbCAHrkT]    -- Common with e.g. items from Adventure Paths
            */
            const inlineStylePattern = /style=\\".*\\"/gm;
            const uuidNamePattern = /\{[\s\w-':()]*\}/gm;
            const uuidCompendiumFix = "@UUID[Compendium.";

            const actorJson  = JSON.stringify(actorItem[key])
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[");

            const originJson = JSON.stringify(originItem[key])
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[");

            // If we find differences in the property
            if (actorJson !== originJson) {
                debug(`Found differences in ${key} for slug ${originItem.slug}:`);
                debug(`Actor ${originItem.slug} states: ${actorJson}`);
                debug(`Compendium ${originItem.slug} states: ${originJson}`);
                differentProperties.push(key);
            }
        }

        return differentProperties;
    }

    // Function to compare two items and find their differences
    #compareItems(originItem, actorItem) {
        debug(`Parsing item ${actorItem.name}`);

        const clones = this.#createShallowClones(originItem, actorItem);

        return new Set(this.#getDifferentiatingProperties(clones.origin, clones.actor));
    }

    #extrapolateNotes(changedItems) {
        const actorSourceId = changedItems.actorItem.sourceId;
        let notes = "";
        
        if (actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary"))
            notes = notes.concat("Bestiary abilities have known issues");

        return notes;
    }

    // Function to sort the changed items based on actorName, type, and name
    #sortChangedItems(changedItems) {
        const sortedItems = [...changedItems];

        sortedItems.sort((a, b) => {
            // Sort by actorName
            if (a.actorName < b.actorName) {
                return -1;
            } else if (a.actorName > b.actorName) {
                return 1;
            }

            // Sort by type if actorName is equal
            if (a.type < b.type) {
                return -1;
            } else if (a.type > b.type) {
                return 1;
            }

            // Sort by name if actorName and type are equal
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }

            return 0;
        });

        return sortedItems;
    }

    async runPIR(actors) {
        info(`Starting ${SCRIPT_NAME}`);

        // Create an array of objects to store change information
        const changedData = [];

        // Iterate over the actors
        for (const actor of actors) {
            ui.notifications.info(`Parsing actor ${actor.name}`);

            // Iterate over the equipment
            for (const actorItem of actor.items.filter((item) => item.hasOwnProperty("type") && this.PF2E_PROPERTY_ITEMS.includes(item.type) && item.sourceId && item.sourceId !== null)) {

                // Check if the item has been changed
                const originItem = await fromUuid(actorItem.sourceId);

                // If the original UUID didn't exists, it was either a creation from the player
                //   or the UUID has been changed by the PF2e creators.
                // If the Item should be ignored, ignore it.
                if (originItem === null || this.PF2E_IGNORABLE_ITEM_UUIDS.includes(originItem.sourceId)) {
                    continue;
                }

                const getCompareData = this.#compareItems(originItem, actorItem);

                // If we have a diff that is not just the slug (as that may differ on e.g. Eidolons' weapon choices)
                if (getCompareData.size > 0 && !(getCompareData.has("slug") && getCompareData.size === 1)) {
                    changedData.push({
                        actor: actor,
                        actorItem: actorItem,
                        originItem: originItem,
                        comparativeData: getCompareData,
                    });
                }
            }
        }

        ui.notifications.info(`Parsing complete. Rendering results`);

        // Generate output
        let output = "";

        // Check if any changed items are found
        if (changedData.length == 0) {
            const searchedActors = actors.map(actor => actor.name).join(', ') || "none";
            output = `<h2>✅ No changed items found</h2><p>Searched through the following actors:<br>${searchedActors}</p>`;
        } else {

            // Fetch style changes to handle Dialog element style issues
            output = getAutoStyleSnippet();

            // Generate the results-table and header
            output += `
            <div id="pir-container">
                <div class="pir-table">
                    <div class="pir-table-header">
                    <div class="pir-table-cell">Actor</div>
                    <div class="pir-table-cell">Type</div>
                    <div class="pir-table-cell">Name</div>
                    <div class="pir-table-cell">Changed Property</div>
                    <div class="pir-table-cell">Actor Item Link</div>
                    <div class="pir-table-cell">Origin Item Link</div>
                    <div class="pir-table-cell">Notes</div>
                </div>
            `;

            for (const data of this.#sortChangedItems(changedData)) {
                const enrichOption = {
                    async: true
                };

                // Create a link to the actor and items
                const actorLink = `<div>${await TextEditor.enrichHTML(data.actor.link, enrichOption)}</div>`;
                const originItemLink = `<div>${await TextEditor.enrichHTML(data.originItem.link, enrichOption)}</div>`;
                const actorItemLink = `<div>${await TextEditor.enrichHTML(data.actorItem.link, enrichOption)}</div>`;

                const notes = this.#extrapolateNotes(data);

                // Format properties with bold for matches in item.comparativeData
                const comparativeData = [...data.comparativeData].map((prop) => {
                    const isImportantReference = ["description", "rules"].includes(prop);
                    return isImportantReference ? `<strong>${prop}</strong>` : prop;
                }).join(", ");

                output += `
                <div class="pir-table-row">
                    <div class="pir-table-cell">${actorLink}</div>
                    <div class="pir-table-cell">${data.actorItem.type}</div>
                    <div class="pir-table-cell">${data.actorItem.name}</div>
                    <div class="pir-table-cell">${comparativeData}</div>
                    <div class="pir-table-cell">${actorItemLink}</div>
                    <div class="pir-table-cell">${originItemLink}</div>
                    <div class="pir-table-cell">${notes}</div>
                </div>
                `;
            }

            output += `
            </div>
        </div>`;
        }

        // Create the popup
        const popupHeader = `<h1>Compatibility Check Results</h1>`;

        // Display the popup with HTML content
        const dialogOptions = {
            title: 'Compatibility Check',
            content: `${popupHeader}${output}`,
            buttons: {
                ok: {
                    label: 'Close',
                    icon: '<i class="fas fa-check"></i>',
                },
            },
            default: 'ok',
        };

        // Render the Dialog
        new Dialog(dialogOptions).render(true);

        info(`Ending calculation of ${SCRIPT_NAME}`);
    }
}