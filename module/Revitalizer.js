import { runPIR, waitForElementToBeRendered } from "../src/pf2e-item-revitalizer.js";
import { info, debug } from "../src/pf2e-item-revitalizer";
import { title as SCRIPT_NAME } from "../module.json";

export class Revitalizer {
    dialog = undefined;
    HTMLtemplate = undefined;

    loadTemplate() {
        this.HTMLtemplate = `
    <section id="pir-container">
        <header>
            <h1>Compatibility Check Results</h1>
        </header>
        <div class="loader"></div>
        Loading actors, and looking at their respective data...
        <br>
    </section>`;
    }

    async renderPirContainerElement() {
        info(`Toggling display`);

        this.dialog = await new Dialog({
            title: SCRIPT_NAME,
            content: this.HTMLtemplate,
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
        return await runPIR(actors);
    }
}