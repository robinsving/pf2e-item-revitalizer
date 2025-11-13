import { title as SCRIPT_NAME, id as SCRIPT_ID } from "../../module.json";
import { popup, info, settings, getSettings, getNestedProperty } from "../utilities/RevitalizerUtilities.js";
import { IMPORTANT_ITEM_PROPERTIES, SPECIAL_ITEM_PROPERTIES } from "../utilities/RevitalizerSignificantProperties.js";

const resultsDialogTemplate = "modules/pf2e-item-revitalizer/templates/results-dialog.hbs";
const resultsDialogFooter = "modules/pf2e-item-revitalizer/templates/results-dialog-footer.hbs";
const resultsDialogHeader = "modules/pf2e-item-revitalizer/templates/results-dialog-header.hbs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
const { enrichHTML } = foundry.applications.ux.TextEditor.implementation;

export default class RevitalizerPresenter extends HandlebarsApplicationMixin(ApplicationV2) {
    _output

    static DEFAULT_OPTIONS = {
        id: "pir-results-dialog",

        actions: {
             refresh: RevitalizerPresenter.refreshFromCompendium,
             revitalize: RevitalizerPresenter.revitalize,
             hide: RevitalizerPresenter.hideItem,
             remove: RevitalizerPresenter.removeItem,
        },

        position: {
            width: 1024,
            height: "auto",
        },

        tag: "div",

        classes: ["dialog", "pir-dialog"],
        window: {
            title: SCRIPT_NAME,
            icon: "fas fa-solid fa-code-compare",
            frame: true,
            resizable: true,
        }
    }

    static PARTS = {
        header: {
            template: resultsDialogHeader,
        },
        form: {
            template: resultsDialogTemplate,
        },
        footer: {
            template: resultsDialogFooter,
        }
    }

    constructor() {
        super();
    }

    // A function to sort the changed items based on actorName, type, and name
    #sortChangedItems(changedItems) {
        const sortedItems = [...changedItems];

        const sortOrder = [
            "actor.name",
            "actorItem.type",
            "actorItem.system.category",
            "actorItem.system.level.value",
            "actorItem.system.traits.value",
            "actorItem.name"
        ];

        sortedItems.sort((a, b) => {
            for (const sorter of sortOrder) {
                const aSortValue = getNestedProperty(a, sorter) || "";
                const bSortValue = getNestedProperty(b, sorter) || "";

                if (aSortValue < bSortValue) {
                    return -1;
                } else if (aSortValue > bSortValue) {
                    return 1;
                }
            };

            return 0;
        });

        return sortedItems;
    }
    
    #sourceIsBestiary(actorSourceId) {
        return actorSourceId.includes("bestiary-ability-glossary-srd") || actorSourceId.includes("bestiary-family-ability-glossary");
    }

    #hasUnrevitalizableReason(data, revitalizableProperties) {
        if (!getSettings(settings.revitalize.id))
            return game.i18n.localize("PIR.presenter.unrevitalizable.disabled_in_settings");

        if (revitalizableProperties.length === 0)
            return game.i18n.localize("PIR.presenter.unrevitalizable.revitalize_will_not_recreate");

        if (this.#sourceIsBestiary(data.actorItem.sourceId))
            return game.i18n.localize("PIR.presenter.unrevitalizable.bestiary_warning");

        return "";
    }

    #isRefreshable(data) {
        let isRefreshable = data.canRefreshFromCompendium;

        if (isRefreshable && this.#sourceIsBestiary(data.actorItem.sourceId)) {
            isRefreshable = false;
        }

        return isRefreshable;
    }

    #getButtons(data) {
        const csvSeparatedProperties = [...data.comparativeData].join(", ");
        const revitalizableProperties = [...data.comparativeData].filter(item => !IMPORTANT_ITEM_PROPERTIES.includes(item));

        const unrevitalizableReason = this.#hasUnrevitalizableReason(data, revitalizableProperties);
        
        const isRevitalizable = unrevitalizableReason === "";

        const isRefreshable = this.#isRefreshable(data)

        return {
            "refresh": {
                disabled: isRefreshable ? false : (game.i18n.localize("PIR.presenter.buttons.refresh_not_available") + (getSettings(settings.revitalize.id) ? "" : game.i18n.localize("PIR.presenter.buttons.refresh_not_available_hint"))),
                hidden: !isRefreshable && isRevitalizable,
                icon: "fa-solid fa-sync-alt",
                action: "refresh",
                value: data.actorItem.uuid,
                title: game.i18n.localize("PIR.presenter.buttons.refresh")
            },
            "revitalize": {
                disabled: isRevitalizable ? false : true,
                hidden: isRefreshable || !isRevitalizable,
                icon: "fa-light fa-code-compare",
                action: "revitalize",
                value: [data.actorItem.uuid, csvSeparatedProperties].join("|"),
                title: `${game.i18n.localize("PIR.presenter.buttons.revitalize")} ${revitalizableProperties.join(", ")}`
            },
            "hide": {
                icon: "fa-regular fa-eye-slash",
                action: "hide",
                value: data.actorItem.uuid,
                title: game.i18n.localize("PIR.presenter.buttons.hide")
            },
            "remove": {
                icon: "fa-regular fa-check",
                action: "remove",
                value: '',
                title: game.i18n.localize("PIR.presenter.buttons.remove")
            },
        }
    }

    #getType(data) {
        try {
            switch(data.actorItem.type) {
                case "spell":       return getNestedProperty(data, "actorItem.system.traits.value").includes("focus") ? "spell\u00A0(focus)" : "spell\u00A0(rank\u00A0" +  getNestedProperty(data, "actorItem.system.level.value") + ")";
                case "feat":        return "feat\u00A0(" + getNestedProperty(data, "actorItem.system.category").replace("feature", "") + ")";
                case "action":      return "action\u00A0" + (this.#sourceIsBestiary(data.actorItem.sourceId) ? "(bestiary)" : "");
                default:            return data.actorItem.type;
            }
        } catch (_ignore) {
            return data.actorItem.type;
        }
    }

    async present(changedData, actors) {
        popup(game.i18n.localize("PIR.presenter.popup.parsing_complete"));

        // Check if any changed items are found
        if (changedData.length == 0) {
            this._output = { actorIds: actors.map(actor => actor.name).join(', ') };
        } else {
            const enrichOption = { async: true };

            const results = [];
            let hasImportantProperty = false;
            for (const data of this.#sortChangedItems(changedData)) {
                results.push({
                    buttons: this.#getButtons(data),
                    actorLink: await enrichHTML(data.actor.link, enrichOption),
                    type: this.#getType(data),
                    comparativeDataText: [...data.comparativeData].map((prop) => {
                        if (IMPORTANT_ITEM_PROPERTIES.includes(prop)) {
                            hasImportantProperty = true;
                            return `<strong>${prop}*</strong>`
                        } else {
                            return prop;
                        }
                    }).join(", "),
                    actorItemLink: await enrichHTML(data.actorItem.link, enrichOption),
                    originItemLink: await enrichHTML(data.originItem.link, enrichOption),
                });
            }
            this._output = { items: results, hasImportantProperty: hasImportantProperty };
        }

        this.render(true);

        info(`Ending calculation of ${SCRIPT_NAME}`);
    }

    _prepareContext() {
        return this._output;
    }

    close() {
        super.close();
        popup(game.i18n.localize("PIR.presenter.popup.reload"), { permanent: true, console: false });
    }

    // Actions handlers

    // A function to clone the data from Compendium source
    static async revitalize(event, target) {
        const [UUID, csvProperties] = target.value.split("|");

        var properties = csvProperties.split(", ");

        // sanity check
        try {
            var actorItem = await fromUuid(UUID);
            var actor = actorItem.actor;
            var sourceItem = await fromUuid(actorItem.sourceId);
        } catch (error) {
            console.error(error);
            popup(game.i18n.localize("PIR.presenter.popup.error_find_uuid"));
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
                popup(game.i18n.format("PIR.presenter.popup.error_revitalize_property", { property }));
                return false;
            }
        });
        popup(game.i18n.format("PIR.presenter.popup.item_success_revitalized", { name: actorItem.slug }));
        target.parentNode.parentNode.remove()
    };

    // A function to clone the data from Compendium source using built-in method
    static async refreshFromCompendium(event, target) {
        var actorItem = await fromUuid(target.value);
        let replaceName = true;
        if (actorItem.name.includes("(At Will)")) {
            replaceName = false;
            popup(game.i18n.format("PIR.presenter.popup.will_not_rename", { name: actorItem.name }));
        }

        await actorItem.refreshFromCompendium({name: replaceName});
        target.parentNode.parentNode.remove()
    };

    // A function to store Actor Item UUID to Settings
    static async hideItem(event, target) {
        const currentIgnoreSetting = await getSettings(settings.itemIgnoreList.id);
        
        var currentIgnoreList = currentIgnoreSetting ? new Set(currentIgnoreSetting.split(",")) : new Set();

        // Add to list, unless it exists
        currentIgnoreList.add(target.value);

        // Save to settings
        game.settings.set(SCRIPT_ID, settings.itemIgnoreList.id, [...currentIgnoreList].join(","));
        target.parentNode.parentNode.remove()
    };

    // A function to remove Item from the list
    static async removeItem(event, target) {
        target.parentNode.parentNode.remove();
    }
}