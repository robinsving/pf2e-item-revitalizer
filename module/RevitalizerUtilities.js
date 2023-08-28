import { id as SCRIPT_ID, title } from "../module.json";
export { getAutoStyleSnippet, debug, info, settings, popup, selectionTemplate, resultsTemplate };

const selectionTemplate = `modules/${SCRIPT_ID}/templates/selection-dialog.hbs`;
const resultsTemplate = `modules/${SCRIPT_ID}/templates/results-dialog.hbs`;

const settings = {
    gm: { id: "forGmOnly", name: "Access to GM only", hint: "If 'false', users will be able to run for their owned characters" },
    debug: { id: "debugMode", name: "Enable Debugging", hint: "Print debug to console log" },
    rulesElementArrayLengthOnly: { id: "useArrayLength", name: "Simplified Rule Element discovery", hint: "Faster run. Performs RE comparisons using array length. This gives fewer false positives, but also misses more true positives" },
    userIgnoreList: { id: "userIgnoreList", name: "Ignored Actor Items", hint: "User-expanded ignore list, comma-separated" },
    revitalize: { id: "allowRevitalize", name: "Allow updating Item version from Compendium", hint: "WARNING: this may destroy your Items, and may potentially cause issues with the Actor" },
}

function popup(message) {
    ui.notifications.info(`${title}: ${message}`);
}

function debug(message) {
    if (game.settings.get(SCRIPT_ID, settings.debug.id))
        console.debug(`${title}: ${message}`);
}

function info(message) {
    console.info(`${title}: ${message}`);
}

// Function to test if CSS "has"-selector is enabled in browser
function testHasSelector() {
    //create three connected elements
    let container = document.createElement("div");
    let parent = document.createElement("div");
    let child = document.createElement("div");
    child.className = "pir-test-class";

    container.appendChild(parent);
    parent.appendChild(child);
    try {
        // see if we can select "parent"
        return (container.querySelector(`div:has(.${child.className})`) !== null);
    } catch {
        return false;
    } finally {
        container.remove();
    }
}

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
function getAutoStyleSnippet() {
    let hasHasSelectorSupport = testHasSelector();
    debug(`Browser has 'Has'-selector support: ${hasHasSelectorSupport}`);
    return `
    <style>
    ${hasHasSelectorSupport ? `.dialog:has(#pir-container)` : ".dialog"} {
        width: auto !important;
        height: auto !important;
    }
    </style>`;
}