import { id } from "../module.json";
import { info, popup, settings } from './RevitalizerUtilities';

// A function to remove an element
window.removeRow = async function (element) {
    element.parentNode.parentNode.remove();
};

// A function to store Actor Item UUID to Settings
window.hide = async function (UUID) {
    var currentIgnoreList = new Set(await game.settings.get(id, settings.userIgnoreList.id).filter(a=>a));
    // Add to list, unless it exists
    currentIgnoreList.add(UUID);

    // Save to settings
    game.settings.set(id, settings.userIgnoreList.id, [...currentIgnoreList]);
    return true;
};

// A function to clone the data from Compendium source
window.revitalize = async function (UUID, csvProperties) {
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
            info(`Property ${property} will be changed from ${JSON.stringify(sourceItem.system[property])} to ${JSON.stringify(sourceItem.system[property])}`);
            actor.items.find(i => i._id == actorItem._id).update({ [`system.${property}`]: sourceItem.system[property] });
        } catch (error) {
            console.error(error);
            popup(`Something went wrong with revitalizing the property ${property}`);
            return false;
        }
    });
    popup(`Item ${actorItem.slug} successfully Revitalized`);

    return true;
};

window.toggleAllActors = function (source) {
    var checkboxes = document.getElementsByName('pir-actors');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
};
