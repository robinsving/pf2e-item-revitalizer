import { id as SCRIPT_ID, title } from "../../module.json";
export { debug, info, popup, warn, settings, getSettings, selectionTemplate, resultsTemplate, getNestedProperty, isTokenUUID };

const selectionTemplate = `modules/${SCRIPT_ID}/templates/selection-dialog.hbs`;
const resultsTemplate = `modules/${SCRIPT_ID}/templates/results-dialog.hbs`;

const settings = {
    gm: { id: "forGmOnly", name: "Access to GM only", hint: "If unchecked, Players will be able to run this module for their *owned* characters" },
    debug: { id: "debugMode", name: "Enable Debugging", hint: "Print debug to console log" },
    rulesElementArrayLengthOnly: { id: "useArrayLength", name: "Simplified Rule Element discovery", hint: "Performs RE comparisons using array length. This gives fewer false positives, but also misses more true positives" },
    itemIgnoreList: { id: "userIgnoreList", name: "Ignored Actor Items", hint: "User-expanded Item ignore list, comma-separated" },
    propertyIgnoreList: { id: "propertyIgnoreList", name: "Ignored Item properties", hint: "Insert text separated by commas (,).  Each of these Item Properties will be ignored when finding items. E.g. publication,icon-link" },
    revitalize: { id: "allowRevitalize", name: "Allow Refreshing using non built-in method, as a backup solution", hint: "This will only be possible if the built-in Refresh is not available. It will only update certain properties, where it is safe to do" },
    showSheetButtonNPC: { id: "showSheetButtonNPC", name: "Show Revitalize Icon in the NPC Sheet", hint: "Shows a clickable button in the top bar of NPC Sheets. Note that refreshing NPC Items is not recommended" },
    completedMigration: { id: "migration", name: "Tracker for last migration", hint: "" },
}

function getSettings(setting) {
    return game.settings.get(SCRIPT_ID, setting);
}

function getNestedProperty(obj, path) {
    try {
        const value = path.split('.').reduce((acc, key) => acc[key], obj);
        return value !== undefined ? value : null;
    } catch (error) {
        return null;
    }
}

function popup(message, options = {}) {
    ui.notifications.info(`${title}: ${message}`, options);
}


function warn(popup, consoleMessage) {
    ui.notifications.warn(`${title}: ${popup}`);

    if (consoleMessage)
        console.warn(`${title}: ${consoleMessage}`);
}

function debug(message) {
    if (getSettings(settings.debug.id))
        console.debug(`${title}: ${message}`);
}

function info(message) {
    console.info(`${title}: ${message}`);
}

export const isRunning = () => {
    if (document.getElementById("pir-container-body")) {
        popup(`Selection already ongoing`);
        return true;
    }
    return false;
}

function isTokenUUID(uuid) {
    if (typeof uuid !== "string") return false;
    try {
        const parsed = foundry.utils.parseUuid(uuid);
        return parsed.documentType === "Scene" && parsed.embedded[0] === "Token";
    } catch {
        return false;
    }
}