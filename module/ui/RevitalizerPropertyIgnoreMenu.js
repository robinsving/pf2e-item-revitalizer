import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../../module.json";
import { getSettings, settings } from "../utilities/RevitalizerUtilities.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class RevitalizerPropertyIgnoreMenu extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "pir-property-ignore-menu",
        actions: {
            addProperty: RevitalizerPropertyIgnoreMenu.addProperty,
            removeProperty: RevitalizerPropertyIgnoreMenu.removeProperty,
        },
        position: { width: 400, height: "auto" },
        classes: ["dialog", "pir-dialog"],
        window: {
            title: SCRIPT_NAME,
            icon: "fas fa-list",
            frame: true,
            resizable: true,
        }
    };

    static PARTS = {
        form: { template: `modules/${SCRIPT_ID}/templates/property-ignore-menu.hbs` },
    };

    _prepareContext() {
        return {
            properties: getSettings(settings.propertyIgnoreList.id),
        };
    }

    static async addProperty(_, target) {
        const selector = target?.dataset?.input;
        const input = target?.matches?.(selector ?? "#pir-new-property")
            ? target
            : target?.closest?.(".pir-add-property")?.querySelector?.(selector ?? "#pir-new-property");
        const value = (input?.value ?? "").trim();
        if (!value) return;
        const current = getSettings(settings.propertyIgnoreList.id);
        if (!current.includes(value)) {
            await game.settings.set(SCRIPT_ID, settings.propertyIgnoreList.id, [...current, value]);
        }
        if (input) input.value = "";
        this.render();
    }

    static async removeProperty(event, target) {
        const value = target.dataset.property;
        const current = getSettings(settings.propertyIgnoreList.id);
        await game.settings.set(SCRIPT_ID, settings.propertyIgnoreList.id, current.filter(p => p !== value));
        this.render();
    }
}
