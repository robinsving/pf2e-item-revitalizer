import { title as SCRIPT_NAME } from "../module.json";
import { info, selectionTemplate, resultsTemplate } from "./RevitalizerUtilities";
import Revitalizer from "./Revitalizer";
import RevitalizerSheetRegister from "./RevitalizerSheetRegister";
import RevitalizerSettingsRegister from "./RevitalizerSettingsRegister";
import RevitalizerSceneControlRegister from "./RevitalizerSceneControlRegister";
import RevitalizerLayerRegister from "./RevitalizerLayerRegister";
import "./RevitalizerCallbacks";

$(document).ready(() => {
    let revitalizer = new Revitalizer();

    Hooks.once("init", () => {
        info(`Initializing ${SCRIPT_NAME}`);
        loadTemplates([selectionTemplate, resultsTemplate]);
        CONFIG.supportedLanguages['en'] = 'English';
        new RevitalizerSettingsRegister();
    });

    // register on Character sheets
    Hooks.once("ready", () => {
        new RevitalizerSheetRegister(revitalizer);
    });

    // register Scene Control Buttons
    Hooks.on('getSceneControlButtons', (control) => {
        info("Add hook on getSceneControlButtons");

        // Don't render buttons for non-GM
        if (!game.user.isGM)
            return;

        new RevitalizerSceneControlRegister(revitalizer, control);
    });
});
