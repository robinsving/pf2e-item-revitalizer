import { id as SCRIPT_ID, title as SCRIPT_NAME } from "../../module.json";
import { getSettings, settings } from "../utilities/RevitalizerUtilities.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { enrichHTML } = foundry.applications.ux.TextEditor.implementation;

export default class RevitalizerItemIgnoreMenu extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "pir-item-ignore-menu",
        actions: {
            removeItem: RevitalizerItemIgnoreMenu.removeItem,
        },
        position: { width: 1024, height: "auto" },
        classes: ["dialog", "pir-dialog"],
        window: {
            title: SCRIPT_NAME,
            icon: "fas fa-eye-slash",
            frame: true,
            resizable: true,
        }
    };

    static PARTS = {
        form: { template: `modules/${SCRIPT_ID}/templates/item-ignore-menu.hbs` },
    };

    async _prepareContext() {
        const items = getSettings(settings.itemIgnoreList.id);
        const enrichOption = { async: true };

        const enrichedItems = await Promise.all(items.map(async (uuid) => {
            try {
                const doc = await fromUuid(uuid);
                const name = doc?.name || uuid;
                const actorName = doc?.actor?.name || "Unknown";
                const type = doc?.type || "unknown";
                return {
                    uuid,
                    type,
                    itemLink: await enrichHTML(doc?.link || name, enrichOption),
                    actorLink: await enrichHTML(doc?.actor?.link || actorName, enrichOption),
                };
            } catch {
                return {
                    uuid,
                    itemLink: uuid,
                    actorLink: "Unknown Actor",
                    type: "unknown type",
                };
            }
        }));

        return {
            items: enrichedItems,
        };
    }

    static async removeItem(_, target) {
        const uuid = target.dataset.uuid;
        const current = getSettings(settings.itemIgnoreList.id);
        await game.settings.set(SCRIPT_ID, settings.itemIgnoreList.id, current.filter(entry => entry !== uuid));
        this.render();
    }
}
