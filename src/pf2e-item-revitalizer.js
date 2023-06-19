/*
// Load the language file based on the user's selected language
const language = game.i18n.lang;

const langFile = `modules/your-module/lang/${language}.json`; // Adjust the path as per your module's structure

// Load the language file or fallback to default language strings
const i18n = game.i18n.translations[language]?.COMPATIBILITY_CHECK || defaultLang.COMPATIBILITY_CHECK;
*/
const SCRIPT_NAME = "PF2e Item Revitalizer";
const SCRIPT_ID = "PIR:";

function debug (message) {
    console.debug(`${SCRIPT_ID} ${message}`)
}

// Allowlist of properties to include in the clone
const PF2E_PROPERTY_ALLOW_LIST = {
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
const PF2E_PROPERTY_ITEMS = ["action", "ancestry", "armor", "background", "backpack", "book", "class", "condition", "consumable", "deity", "effect", "equipment", "feat", "heritage", "kit", "spell", "spellcastingEntry", "treasure", "weapon"];

// List of Items to ignore
const PF2E_IGNORABLE_ITEM_UUIDS = [
    "Compendium.pf2e.equipment-srd.UJWiN0K3jqVjxvKk", // Wand, lvl 1
    "Compendium.pf2e.equipment-srd.vJZ49cgi8szuQXAD", // Wand, lvl 2
    "Compendium.pf2e.equipment-srd.wrDmWkGxmwzYtfiA", // Wand, lvl 3
    "Compendium.pf2e.equipment-srd.Sn7v9SsbEDMUIwrO", // Wand, lvl 4
    "Compendium.pf2e.equipment-srd.5BF7zMnrPYzyigCs", // Wand, lvl 5
    "Compendium.pf2e.equipment-srd.kiXh4SUWKr166ZeM", // Wand, lvl 6
    "Compendium.pf2e.equipment-srd.nmXPj9zuMRQBNT60", // Wand, lvl 7
    "Compendium.pf2e.equipment-srd.Qs8RgNH6thRPv2jt", // Wand, lvl 8
    "Compendium.pf2e.equipment-srd.Fgv722039TVM5JTc", // Wand, lvl 9

    "Compendium.pf2e.equipment-srd.RjuupS9xyXDLgyIr", // Scroll, lvl 1
    "Compendium.pf2e.equipment-srd.Y7UD64foDbDMV9sx", // Scroll, lvl 2
    "Compendium.pf2e.equipment-srd.ZmefGBXGJF3CFDbn", // Scroll, lvl 3
    "Compendium.pf2e.equipment-srd.QSQZJ5BC3DeHv153", // Scroll, lvl 4
    "Compendium.pf2e.equipment-srd.tjLvRWklAylFhBHQ", // Scroll, lvl 5
    "Compendium.pf2e.equipment-srd.4sGIy77COooxhQuC", // Scroll, lvl 6
    "Compendium.pf2e.equipment-srd.fomEZZ4MxVVK3uVu", // Scroll, lvl 7
    "Compendium.pf2e.equipment-srd.iPki3yuoucnj7bIt", // Scroll, lvl 8
    "Compendium.pf2e.equipment-srd.cFHomF3tty8Wi1e5", // Scroll, lvl 9
    "Compendium.pf2e.equipment-srd.o1XIHJ4MJyroAHfF", // Scroll, lvl 10

    "Compendium.pf2e.equipment-srd.tLa4bewBhyqzi6Ow" // Cantrip deck
];

// test if "has"-selector is enabled in browser
function testHasSelector(){
    //create three connected elements
    var container = document.createElement("div");
    var parent = document.createElement("div");
    var child = document.createElement("div");
    child.className = "wiggle";
    
    container.appendChild(parent);
    parent.appendChild(child);
    try {
        return (container.querySelector("div:has(.wiggle)") !== null);
    } catch(e) { return false; }
}

// Function to clone the allowed properties from an object
function allowedPropertyClone(obj, allowList) {
    return Object.keys(allowList).reduce(function (allowObj, key) {
        if (!obj.hasOwnProperty(key)) {
            // Exclude properties not present in the object
        } else if (typeof obj[key] === "object") {
            allowObj[key] = allowedPropertyClone(obj[key], allowList[key]);
        } else {
            allowObj[key] = obj[key];
        }
        
        return allowObj;
    }, {});
}

// Function to include only allowed properties in the cloned items
function createShallowClones(originItem, actorItem) {
    // Clone the items
    const clones = {
        origin: duplicate(originItem).system,
        actor: duplicate(actorItem).system,
    };
    
    for (let [key, value] of Object.entries(clones)) {
        clones[key] = allowedPropertyClone(value, PF2E_PROPERTY_ALLOW_LIST);
    }
    
    return clones;
}

// Function to compare two items and find their differences
function compareItems(originItem, actorItem) {
        debug(`Parsing item ${actorItem.name}`);
    
    const clones = createShallowClones(originItem, actorItem);
    
    return new Set(getDifferentiatingProperties(clones.origin, clones.actor));
}

// Function to get the properties that are different between two items
function getDifferentiatingProperties(originItem, actorItem) {
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
        const uuidNamePattern = /\{[\s\w-':()]*\}/gm
        const uuidCompendiumFix = "@UUID[Compendium."
        const actorJson     = JSON.stringify(actorItem[key]).replaceAll(inlineStylePattern, "").replaceAll(uuidNamePattern, "").replaceAll(uuidCompendiumFix, "@Compendium[");
        const originJson    = JSON.stringify(originItem[key]).replaceAll(inlineStylePattern, "").replaceAll(uuidNamePattern, "").replaceAll(uuidCompendiumFix, "@Compendium[");;
        
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

function createAdditionalNotes(changedItems) {
    console.log(changedItems.originItem.sourceId)
    const actorSourceId = changedItems.actorItem.sourceId;
    let notes = "";
    if (actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary"))
        notes = notes.concat("Bestiary abilities has known issues");
    
    return notes;
}

// Function to sort the changed items based on actor name, type, and name
function sortChangedItems(changedItems) {
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

console.info(`Starting ${SCRIPT_NAME}`);

// try to identify if the browser has support for "has" selectors
let hasHasSelectorSupport = false;
if (testHasSelector()) {
    hasHasSelectorSupport = true;
}
debug(`Browser has 'Has'-selector support: ${hasHasSelectorSupport}`)

// Create an array of objects to store change information
const changedData = [];

// Get all available actors
const actors = canvas.tokens.placeables.filter((token) => token.actor).map((token) => token.actor);

// Iterate over the actors
for (const actor of actors) {
    debug(`Parsing actor ${actor.name}`);
    
    // Iterate over the equipment
    for (const actorItem of actor.items.filter((item) => item.hasOwnProperty("type") && PF2E_PROPERTY_ITEMS.includes(item.type) && item.sourceId && item.sourceId !== null && !PF2E_IGNORABLE_ITEM_UUIDS.includes(item.sourceId))) {
        //debug(actorItem);
        // Check if the item has been changed
        const originItem = await fromUuid(actorItem.sourceId);
        
        if (originItem === null) {
            continue;
        }
        const getCompareData = compareItems(originItem, actorItem);
        
        // if we have a diff that is not just the slug (as that may differ on e.g. Eidolons' weapon choices)
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
let output = "";
// Check if any changed items are found
if (changedData.length == 0) {
    const searchedActors = actors.map(actor => actor.name).join(', ') || "none";
    output = `<h2>✅ No changed items found</h2><p>Searched through the following actors:<br>${searchedActors}</p>`;
} else {

    /**
     * Create the formatted output in a table.
     * 
     * Note: Will use the "has"-selector if the browser supports it.
     * Otherwise it will default to matching the "dialog" class
     * This is notable when using e.g. Firefox, and not having the `layout.css.has-selector.enabled`
     * 
     * The problem here is that we need to make the dialog have auto width, or the content is hidden,
     * but _if we can_ we want to avoid making changes to the entire DOM object's Dialogs.
     **/
    output = `
    <style>
    ${hasHasSelectorSupport ? ".dialog:has(.wiggle-table-wrapper)":".dialog"} {
            width: auto !important;
        }
        
        .wiggle-table-wrapper {
            display: table;
            width: 100%;
        }
        
        .wiggle-table {
            display: table-row-group;
        }
        
        .wiggle-table-header {
            display: table-row;
            font-weight: bold;
        }
        
        .wiggle-table-row {
            display: table-row;
        }
        
        .wiggle-table-cell {
            display: table-cell;
            padding: 5px;
        }
    </style>  
    
    <div class="wiggle-table-wrapper">
        <div class="wiggle-table">
            <div class="wiggle-table-header">
                <div class="wiggle-table-cell">Actor</div>
                <div class="wiggle-table-cell">Type</div>
                <div class="wiggle-table-cell">Name</div>
                <div class="wiggle-table-cell">Changed Property</div>
                <div class="wiggle-table-cell">Actor Item Link</div>
                <div class="wiggle-table-cell">Origin Item Link</div>
                <div class="wiggle-table-cell">Notes</div>
            </div>
    `;
    
    for (const data of sortChangedItems(changedData)) {
        const actor = game.actors.get(data.actor.system._id);
        
        const enrichOption = {
            async: true
        };
        
        // Create a link to the actor and items
        const actorLink = `<div>${await TextEditor.enrichHTML(data.actor.link, enrichOption)}</div>`;
        const originItemLink = `<div>${await TextEditor.enrichHTML(data.originItem.link, enrichOption)}</div>`;
        const actorItemLink = `<div>${await TextEditor.enrichHTML(data.actorItem.link, enrichOption)}</div>`;

        const notes = createAdditionalNotes(data);
        
        // Format properties with bold for matches in item.comparativeData
        const comparativeData = [...data.comparativeData].map((prop) => {
            const isImportantReference = ["description", "rules"].includes(prop);
            return isImportantReference ? `<strong>${prop}</strong>` : prop;
        })
        .join(", ");
        
        output += `
            <div class="wiggle-table-row">
                <div class="wiggle-table-cell">${actorLink}</div>
                <div class="wiggle-table-cell">${data.actorItem.type}</div>
                <div class="wiggle-table-cell">${data.actorItem.name}</div>
                <div class="wiggle-table-cell">${comparativeData}</div>
                <div class="wiggle-table-cell">${actorItemLink}</div>
                <div class="wiggle-table-cell">${originItemLink}</div>
                <div class="wiggle-table-cell">${notes}</div>
            </div>
        `;
    }
    
    output += `
        </div>
    </div>`;
}

// Create the popup
const popupContent = `<h1>Compatibility Check Results</h1>${output}`;

// Display the popup with HTML content
const dialogOptions = {
    title: 'Compatibility Check',
    content: popupContent,
    buttons: {
        ok: {
            label: 'Close',
            icon: '<i class="fas fa-check"></i>',
        },
    },
    default: 'ok',
};

// Render the Dialog, but on an error, inform the user that the CSS selector is not enabled, if applicable
try {
    const dialog = new Dialog(dialogOptions).render(true);
} catch (e) {
}
if (!hasHasSelectorSupport) {
    console.warn(`${SCRIPT_NAME} has detected that your browser is not allowing for the 'has' CSS-selector. The script's CSS has been adapted to adjust for this.
This setting is a default for Firefox, 🦊, but it can be enabled in the 'about:config', under 'layout.css.has-selector.enabled'.`)
}

console.info(`Ending ${SCRIPT_NAME}`);