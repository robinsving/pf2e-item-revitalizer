import RevitalizerRunner from "./RevitalizerRunner";
import RevitalizerSettings from "./RevitalizerSettings";
import { info, settings, getSettings } from "./utilities/RevitalizerUtilities";

$(document).ready(() => {

    // Register callback for Setup phase, as we need game.user to be set
    Hooks.once("setup", () => {
        info(`Initializing`);

        // Register settings
        new RevitalizerSettings();

        // Determine if user is allowed access
        if (!game.user.isGM && getSettings(settings.gm.id)) {
            info("User is not permitted")
            // Don't even blink
            return;
        }

        // Create the Revitalizer
        new RevitalizerRunner();
    });
});
