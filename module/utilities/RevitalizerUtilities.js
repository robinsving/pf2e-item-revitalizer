import { id as SCRIPT_ID, title } from "../../module.json";
export { debug, info, popup, warn, settings, getSettings, selectionTemplate, resultsTemplate, getNestedProperty, isTokenUUID };

const selectionTemplate = `modules/${SCRIPT_ID}/templates/selection-dialog.hbs`;
const resultsTemplate = `modules/${SCRIPT_ID}/templates/results-dialog.hbs`;

const settings = {
    gm: { id: "forGmOnly", name: "PIR.settings.forGmOnly.name", hint: "PIR.settings.forGmOnly.hint" },
    debug: { id: "debugMode", name: "PIR.settings.debug.name", hint: "PIR.settings.debug.hint" },
    rulesElementArrayLengthOnly: { id: "useArrayLength", name: "PIR.settings.rulesElementArrayLengthOnly.name", hint: "PIR.settings.rulesElementArrayLengthOnly.hint" },
    itemIgnoreList: { id: "userIgnoreList", name: "PIR.settings.itemIgnoreList.name", hint: "PIR.settings.itemIgnoreList.hint" },
    propertyIgnoreList: { id: "propertyIgnoreList", name: "PIR.settings.propertyIgnoreList.name", hint: "PIR.settings.propertyIgnoreList.hint" },
    revitalize: { id: "allowRevitalize", name: "PIR.settings.revitalize.name", hint: "PIR.settings.revitalize.hint" },
    showSheetButtonNPC: { id: "showSheetButtonNPC", name: "PIR.settings.showSheetButtonNPC.name", hint: "PIR.settings.showSheetButtonNPC.hint" },
    completedMigration: { id: "migration", name: "PIR.settings.completedMigration.name", hint: "PIR.settings.completedMigration.hint" },
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
    const localizedTitle = game.i18n.localize("PIR.revitalizer.name");
    ui.notifications.info(`${localizedTitle}: ${message}`, options);
}


function warn(popup, consoleMessage) {
    const localizedTitle = game.i18n.localize("PIR.revitalizer.name");
    ui.notifications.warn(`${localizedTitle}: ${popup}`);

    if (consoleMessage)
        console.warn(`${localizedTitle}: ${consoleMessage}`);
}

function debug(message) {
    if (getSettings(settings.debug.id))
    console.debug(`${game.i18n.localize("PIR.revitalizer.name")}: ${message}`);
}

function info(message) {
    console.info(`${game.i18n.localize("PIR.revitalizer.name")}: ${message}`);
}

export const isRunning = () => {
    if (document.getElementById("pir-container-body")) {
        popup(game.i18n.localize("PIR.revitalizer.selection_already_ongoing"));
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