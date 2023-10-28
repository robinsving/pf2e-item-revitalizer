import { id as SCRIPT_ID } from "../../module.json";
import { popup, info, settings, getSettings } from "../RevitalizerUtilities.js";
import { SPECIAL_ITEM_PROPERTIES } from "../RevitalizerSignificantProperties.js";

// interim solution
window.toggleAllActors = (source) => Hooks.call(SCRIPT_ID + "-toggle-all-actors", source);

export default class RevitalizerCallbackHookRegister {

    constructor() {
        // register Hooks for callbacks

        // A function to clone the data from Compendium source
        Hooks.on(SCRIPT_ID + "-toggle-all-actors", (source) => {
            var checkboxes = document.getElementsByName('pir-actors');
            for (var i = 0, n = checkboxes.length; i < n; i++) {
                checkboxes[i].checked = source.checked;
            }
        });

        // A function to clone the data from Compendium source
        Hooks.on(SCRIPT_ID + "-revitalize", async (element, UUID, csvProperties) => {
            var properties = csvProperties.split(", ");
            // sanity check
            try {
                var actorItem = await fromUuid(UUID);
                var actor = actorItem.actor;
                var sourceItem = await fromUuid(actorItem.sourceId);
            } catch (error) {
                console.error(error);
                popup(`Something went wrong with finding the UUID or the sourceId`);
                return false;
            }
            properties.forEach(property => {
                try {
                    info(`Property ${property} will be updated`);
        
                    // if this is a special property, rather than a "normal" system property
                    const specialProperty = SPECIAL_ITEM_PROPERTIES.find(obj => obj.name === property);
                    if (specialProperty)
                        actor.items.find(i => i._id == actorItem._id).update({ [specialProperty.path]: sourceItem[specialProperty.path] });
                    else
                        actor.items.find(i => i._id == actorItem._id).update({ [`system.${property}`]: sourceItem.system[property] });
                } catch (error) {
                    console.error(error);
                    popup(`Something went wrong with revitalizing the property ${property}`);
                    return false;
                }
            });
            popup(`Item ${actorItem.slug} successfully Revitalized`);
            element.parentNode.parentNode.remove()
        });

        // A function to store Actor Item UUID to Settings
        Hooks.on(SCRIPT_ID + "-hide", async (element, UUID) => {
            var currentIgnoreList = new Set(await getSettings(settings.userIgnoreList.id).filter(a=>a));

            // Add to list, unless it exists
            currentIgnoreList.add(UUID);

            // Save to settings
            game.settings.set(SCRIPT_ID, settings.userIgnoreList.id, [...currentIgnoreList]);
            element.parentNode.parentNode.remove()
        });

        // A function to remove an element
        Hooks.on(SCRIPT_ID + "-remove", (element) => element.parentNode.parentNode.remove());

    }
}