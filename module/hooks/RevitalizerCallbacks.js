import { id as SCRIPT_ID } from "../../module.json";
import { popup, info, settings, getSettings } from "../utilities/RevitalizerUtilities.js";
import { SPECIAL_ITEM_PROPERTIES, IMPORTANT_ITEM_PROPERTIES } from "../utilities/RevitalizerSignificantProperties.js";

export const toggleAllHook          = SCRIPT_ID + "-toggle-all-actors";
export const revitalizeHook         = SCRIPT_ID + "-revitalize";
export const hideHook               = SCRIPT_ID + "-hide";
export const removeHook             = SCRIPT_ID + "-remove";
export const refreshFromCompendiumHook = SCRIPT_ID + "-refresh";

export default class RevitalizerCallbackHookRegister {

    constructor() {

        // A function to clone the data from Compendium source
        Hooks.on(toggleAllHook, (source) => {
            var checkboxes = document.getElementsByName('pir-actors');
            for (var i = 0, n = checkboxes.length; i < n; i++) {
                checkboxes[i].checked = source.checked;
            }
        });

        Hooks.on(refreshFromCompendiumHook, async (element, UUID) => {
            var actorItem = await fromUuid(UUID);
            let replaceName = true;
            if (actorItem.name.includes("(At Will)")) {
                replaceName = false;
                popup(`Will not rename ${actorItem.name} as it contains vital information`);
            }

            await actorItem.refreshFromCompendium({name: replaceName});
            element.parentNode.parentNode.remove()
        });

        // A function to clone the data from Compendium source
        Hooks.on(revitalizeHook, async (element, UUID, csvProperties) => {
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
                    const specialProperty = SPECIAL_ITEM_PROPERTIES.find(obj => obj.name === property);
                    if (IMPORTANT_ITEM_PROPERTIES.includes(property)) {         // if this is an unrevitalizable property, skip it
                        info(`Property ${property} will not be updated`);
                    } else if (specialProperty) {                               // if this is a special property, rather than a "normal" system property
                        info(`Property ${property} will be updated`);
                        actor.items.find(i => i._id == actorItem._id).update({ [specialProperty.path]: sourceItem[specialProperty.path] });
                    } else {
                        info(`Property ${property} will be updated`);
                        actor.items.find(i => i._id == actorItem._id).update({ [`system.${property}`]: sourceItem.system[property] });
                    }
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
        Hooks.on(hideHook, async (element, UUID) => {
            const currentIgnoreSetting = await getSettings(settings.itemIgnoreList.id);
            
            var currentIgnoreList = currentIgnoreSetting ? new Set(currentIgnoreSetting.split(",")) : new Set();

            // Add to list, unless it exists
            currentIgnoreList.add(UUID);

            // Save to settings
            game.settings.set(SCRIPT_ID, settings.itemIgnoreList.id, [...currentIgnoreList].join(","));
            element.parentNode.parentNode.remove()
        });

        // A function to remove an element
        Hooks.on(removeHook, (element) => element.parentNode.parentNode.remove());
    }
}