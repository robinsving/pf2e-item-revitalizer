import { id as SCRIPT_ID } from "../module.json";
export { getAutoStyleSnippet, debug, info, settings };

const settings = {
    gm: "forGmOnly",
    debug: "debugMode"
}

function debug(message) {
    if (game.settings.get(SCRIPT_ID, settings.debug))
        console.debug(`${SCRIPT_ID}: ${message}`);
}

function info(message) {
    console.info(`${SCRIPT_ID}: ${message}`);
}

// Function to test if CSS "has"-selector is enabled in browser
function testHasSelector(){
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
    } catch(e) {
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
    ${hasHasSelectorSupport ? `.dialog:has(#pir-container)`:".dialog"} {
        width: auto !important;
        height: auto !important;
    }
    </style>`;
}