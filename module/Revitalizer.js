import { runPIR } from "../src/pf2e-item-revitalizer.js";
import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../module.json";

export class Revitalizer {
    toggled = false;
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
        
        //await renderTemplate("../templates/dialog.html");
    }

    async toggleElement() {
        console.log(`${SCRIPT_ID} | Toggling display`);

        /*if (this.toggled) {
            this.toggled = false;
            calendar.close();
        } else {
            calendar.toggled = true;*/
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

            await runPIR()
        //}
    }

    async runCalculation() {
        return await this.toggleElement();
    }
}