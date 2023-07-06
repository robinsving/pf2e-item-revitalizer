import { runPIR, waitForElementToBeRendered } from "../src/pf2e-item-revitalizer.js";
import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";

export class Revitalizer {
    dialog = undefined;
    HTMLtemplate = undefined;

    loadTemplate() {
        this.HTMLtemplate = `
    <section id="pir-container">
        <header>
            <h1>Compatibility Check Results</h1>
        </header>
        Loading actors, and looking at their respective data...
        <div class="loader"></div>
    </section>`;
    }

    async renderPirContainerElement() {
        console.log(`${SCRIPT_ID} | Toggling display`);

        this.dialog = await new Dialog({
            title: SCRIPT_NAME,
            content: this.HTMLtemplate,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Done",
                },
            },
        }).render(true);
    }

    async runCalculation(runForAll) {
        let pirContainerElement = await waitForElementToBeRendered("pir-container");

        // Get all available actors
        let actors = canvas.tokens.placeables.filter((token) => token.actor).map((token) => token.actor);
        if (!runForAll)
            // Get only PCs
            actors = actors.filter((token) => token.type == "character");

        // TODO check token ownership

        // TODO add checklist for GM to select from available tokens

        return await runPIR(actors)
    }

    async run(runForAll) {
        await this.renderPirContainerElement()
        return await this.runCalculation(runForAll);
    }
}