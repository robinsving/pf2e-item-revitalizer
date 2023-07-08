import { RevitalizerCalculator } from "./RevitalizerCalculator.js";
import { info, debug } from "./RevitalizerUtilities.js";
import { title as SCRIPT_NAME } from "../module.json";
import dialogHtml from "../templates/dialog.html?raw";

export class Revitalizer {

    revitalizerCalculator = new RevitalizerCalculator();

    async renderPirContainerElement() {
        info(`Toggling display`);

        await new Dialog({
            title: SCRIPT_NAME,
            content: dialogHtml,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Close",
                },
            },
        }).render(true);
    }

    getActorsFromSelection(actorSelection) {
        debug(`Filtering using ${actorSelection}`)
        // Get all available actors
        let actors = canvas.tokens.placeables
            .filter(token => token.actor).map(token => token.actor)  // Filter out actors
            .filter(actorSelection);                                 // Filter out according to selection, e.g. ownership

        // TODO add checklist for GM to select from available tokens
        return actors;
    }

    async run(actorSelection) {
        await this.renderPirContainerElement()
        let actors = this.getActorsFromSelection(actorSelection);
        
        return await this.revitalizerCalculator.runPIR(actors)
        //return await RevitalizerCalculator.runPIR(actors);
    }
}