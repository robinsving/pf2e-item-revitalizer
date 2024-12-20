import { title as SCRIPT_NAME, url } from "../module.json";
import { popup, warn, info, debug, settings, getNestedProperty, getSettings } from "./utilities/RevitalizerUtilities.js";
import { hasOnlyIgnorableTraits, isDeepEmpty, canRefreshFromCompendium } from "./utilities/RevitalizerCalculationUtilities.js";
import { ALL_ITEM_TYPES, PROPERTY_ALLOW_LIST, PROPERTY_ALLOW_LIST_BASE, SPECIAL_ITEM_PROPERTIES } from "./utilities/RevitalizerSignificantProperties.js";

export default class RevitalizerCalculator {

    // List of Items to ignore
    IGNORABLE_ITEM_UUIDS = [
        "Compendium.pf2e.ancestryfeatures.Item.HHVQDp61ehcpdiU8", // Darkvision
        "Compendium.pf2e.ancestryfeatures.Item.DRtaqOHXTRtGRIUT", // Low-light vision

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
        return Object.keys(allowList)
                     .filter(key => !isDeepEmpty(obj[key]))
                     .reduce((filteredObject, key) => {
                        if (!obj.hasOwnProperty(key)) {
                            // Exclude empty properties
                        } else if (allowList[key] === true) {
                            // Specific handling
                            filteredObject[key] = obj[key];
                        } else if (Array.isArray(obj[key])) {
                            if (getSettings(settings.rulesElementArrayLengthOnly.id))
                                filteredObject[key] = obj[key].length;
                            else
                                filteredObject[key] = obj[key].map((i) => typeof i === "object" ? this.#allowedPropertyClone(i, allowList[key]) : i);
                        } else if (typeof obj[key] === "object") {
                            filteredObject[key] = this.#allowedPropertyClone(obj[key], allowList[key]);
                        } else {
                            filteredObject[key] = obj[key];
                        }

                        return filteredObject;
                    }, {});
                }

    // Function to include only allowed properties in the cloned items
    #createShallowClones(originItem, actorItem) {
        const type = actorItem.type;

        // Create a local allowlist based on possible Item type
        var propertyAllowList = PROPERTY_ALLOW_LIST.hasOwnProperty(type) ? structuredClone(PROPERTY_ALLOW_LIST[type]) : structuredClone(PROPERTY_ALLOW_LIST_BASE);

        // Clone the items
        const clones = {
            origin: structuredClone(originItem.toObject().system),
            actor: structuredClone(actorItem.toObject().system),
        };

        //debug(JSON.stringify(clones.actor));
        //debug(JSON.stringify(clones.origin));

        for (let [key, value] of Object.entries(clones)) {
            // Filter out list based on settings
            getSettings(settings.propertyIgnoreList.id)
                .split(",")
                .forEach(key => delete propertyAllowList[key]);

            clones[key] = this.#allowedPropertyClone(value, propertyAllowList);
        }

        return clones;
    }

    // Function to get the properties that differ between two Items
    #getDifferentiatingProperties(originItem, actorItem, humanReadableName) {
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
            // runes, ignore this since it is only used as a comparator for e.g. acBonus
            if (key === "runes")
                continue;
            
            // Since we are looking for keys in the Item, the corresponding key may not even exist in the other Item, or be filled with garbage
            if (isDeepEmpty(actorItem[key]) != isDeepEmpty(originItem[key])) {
                debug(`Found differences in ${key} for Item ${humanReadableName}:`);
                debug(`Actor's ${humanReadableName} (${key}) is: ${JSON.stringify(actorItem[key])}`);
                debug(`Compendium's ${humanReadableName} (${key}) is: ${JSON.stringify(originItem[key])}`);

                // sometimes Foundry adds default values
                if (actorItem[key] !== null && actorItem[key] !== 0)
                    differentProperties.push(key);
                else
                    debug(`Ignored due to no value set (null, 0)`)
                continue;
            } else if (originItem[key] === undefined || actorItem[key] === undefined) {
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
            
            const check = /\@Check[^\]]+\]/gm
            const reach = /\d+ feet/gm

            // Fix null-issues
            const nullFix = ":0";
            const nullFix2 = "\"\"";
            const nullFix3 = /\"[^\"]+\":null/gm;

            // Fix properties which are added by Foundry
            const allEmptyArrays = /\"\w+\"\:\[\]/gm;
            const applyMod = '"applyMod":false';
            const removeAfterRoll = '"removeAfterRoll":false';
            const anythingFalse = /"\w+":false/gm;
            const selectorToArray = /"selector":"([^\"]*)"/gm;
            const typeUntyped = '"type":"untyped"';
            const typeToArray = /"type":"([^\"]*)"/gm;

            // Fix problems with JSON after replacements
            const postFix = "{,";
            const postFix2 = ",}";
            const postFix3 = /,{2,}/gm;

            const actorJson = JSON.stringify(actorItem[key], sorter)
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[")
                .replaceAll(uuidItemFix, ".")

                .replaceAll(check, "@Check")
                .replaceAll(reach, "X reach")

                .replaceAll(nullFix, ":null")
                .replaceAll(nullFix2, "null")
                .replaceAll(nullFix3, "")
                .replaceAll(applyMod, "")
                .replaceAll(allEmptyArrays, "")
                .replaceAll(removeAfterRoll, "")
                .replaceAll(typeUntyped, "")
                .replaceAll(anythingFalse, "")
                .replaceAll(selectorToArray, '"selector":["$1"]')
                .replaceAll(typeToArray, '"type":["$1"]')

                
                .replaceAll(postFix3, ",")
                .replaceAll(postFix, "{")
                .replaceAll(postFix2, "}")

            const originJson = JSON.stringify(originItem[key], sorter)
                .replaceAll(inlineStylePattern, "")
                .replaceAll(uuidNamePattern, "")
                .replaceAll(uuidCompendiumFix, "@Compendium[")
                .replaceAll(uuidItemFix, ".")

                .replaceAll(check, "@Check")
                .replaceAll(reach, "X reach")

                .replaceAll(nullFix, ":null")
                .replaceAll(nullFix2, "null")
                .replaceAll(nullFix3, "")
                .replaceAll(applyMod, "")
                .replaceAll(allEmptyArrays, "")
                .replaceAll(removeAfterRoll, "")
                .replaceAll(typeUntyped, "")
                .replaceAll(anythingFalse, "")
                .replaceAll(selectorToArray, '"selector":["$1"]')
                .replaceAll(typeToArray, '"type":["$1"]')

                .replaceAll(postFix3, ",")
                .replaceAll(postFix, "{")
                .replaceAll(postFix2, "}")

            // If we find differences in the property
            if (actorJson !== originJson) {
                // for traits, ignore if the origin only contains Spell Traditions
                if (key === "traits") {
                    // iff the _only_ trait differences are the Traditions, then ignore this one
                    if (hasOnlyIgnorableTraits(actorItem[key].value, originItem[key].value))
                        continue;
                }

                if (key === "acBonus") {
                    // if the difference is the potency rune, then ignore this one
                    if (actorItem[key] - (getNestedProperty(actorItem, "runes.potency") || 0) == originItem[key])
                        continue;
                }

                debug(`Found differences in ${key} for Item ${humanReadableName}:`);
                debug(`Actor's ${humanReadableName} (${key}) is: ${actorJson}`);
                debug(`Compendium's ${humanReadableName} (${key}) is: ${originJson}`);
                differentProperties.push(key);
            }
        }

        return differentProperties;
    }

    // Function to compare two items and find their differences
    #compareItems(clones, specialProperties, humanReadableName) {
        debug(`Parsing item ${humanReadableName}`);

        const differences = new Set(this.#getDifferentiatingProperties(clones.origin, clones.actor, humanReadableName));

        specialProperties.forEach(specialProperty => {
            if (getNestedProperty(clones.origin, specialProperty.path) != getNestedProperty(clones.actor, specialProperty.path))
                differences.add(specialProperty.name);
        });

        return differences;
    }

    /**
     * Runs comparison for all Items in actors, comparing them to the Items in the PF2e Compendium
     * @param {_CharacterPF2e} actors 
     * @returns Array containing object with data required to display data
     */
    async runRevitalizerCheck(actors) {
        info(`Starting ${SCRIPT_NAME}`);

        // Create an array of objects to store change information
        const changedData = [];

        // Start a simple timer
        const start = Date.now();

        const ignoredItemsFromSettings = getSettings(settings.itemIgnoreList.id).split(",");

        // Iterate over the actors
        for (const actor of actors) {
            popup(`Parsing actor ${actor.name} (${actor.items.size} Items). Please be patient`);

            // Iterate over the equipment
            for (const actorItem of actor.items.filter((item) => item.hasOwnProperty("type") && ALL_ITEM_TYPES.includes(item.type) && item.sourceId && item.sourceId !== null)) {
                const humanReadableName = actorItem.slug || actorItem.name;

                // Sanity check: ignore items in ignore list
                if (ignoredItemsFromSettings.includes(actorItem.uuid)) {
                    debug(`Ignoring item ${humanReadableName} due to settings ignore list`)
                    continue;
                }

                // Sanity check: ignore infused items
                let traits = getNestedProperty(actorItem, "system.traits.value")
                if (traits && traits.includes("infused")) {
                    debug(`Ignoring item ${humanReadableName} due to infused trait`)
                    continue;
                }

                // Check if the item has been changed
                const originItem = await fromUuid(actorItem.sourceId);

                // Sanity check: If the original UUID didn't exists, it was either a creation from the player
                //   or the UUID has been changed by the PF2e creators.
                if (originItem === null) {
                    debug(`Ignoring item ${humanReadableName} due to no origin item`)
                    continue;
                }

                // Sanity check: If the Item should be ignored, ignore it.
                if (this.IGNORABLE_ITEM_UUIDS.includes(originItem.sourceId)) {
                    debug(`Ignoring item ${humanReadableName} due to internal ignore list (Wands, Scrolls, etc.)`)
                    continue;
                }

                const clones = this.#createShallowClones(originItem, actorItem);

                // Special property lister
                // if there is a non-system property we need to handle, e.g. "item.img", then check the similarities for these as well
                const ignorePropertySettings = getSettings(settings.propertyIgnoreList.id).split(",");
                const specialPropertiesFiltered = SPECIAL_ITEM_PROPERTIES.filter((value) => !ignorePropertySettings.includes(value.name));


                let getCompareData;
                try {
                    getCompareData = this.#compareItems(clones, specialPropertiesFiltered, humanReadableName);
                } catch (exception) {
                    warn(
                        `Trouble parsing Item "${humanReadableName}". Continuing. See console log for more info`,
                        `Trouble parsing "${humanReadableName}"\nError was ${exception}\n\nPlease file an issue at ${url}, include this message, and attach the character sheet`
                    );
                    continue;
                }

                if (getCompareData.size > 0) {
                    changedData.push({
                        actor: actor,
                        actorItem: actorItem,
                        originItem: originItem,
                        comparativeData: getCompareData,
                        canRefreshFromCompendium: canRefreshFromCompendium(actorItem.sourceId, actorItem.system.rules),
                    });
                }
            }
        }

        debug("Calculation took " + (Date.now()-start) + " milliseconds");

        return changedData;
    }
}
