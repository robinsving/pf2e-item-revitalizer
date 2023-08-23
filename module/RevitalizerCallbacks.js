import { id } from "../module.json";
import { popup, settings } from './RevitalizerUtilities';

// A function to store Actor Item UUID to Settings
window.hide = async function(UUID) {
    var currentIgnoreList = game.settings.get(id, settings.userIgnoreList);

    // Add to settings, unless exist
    if (!currentIgnoreList.includes(UUID)) {
        game.settings.set(id, settings.userIgnoreList, currentIgnoreList.concat(UUID));
        popup(`${UUID} added to ignore list`);
    }
};

window.toggleAllActors = function(source) {
    var checkboxes = document.getElementsByName('pir-actors');
    for(var i=0, n=checkboxes.length; i<n; i++) {
        checkboxes[i].checked = source.checked;
    }
};
