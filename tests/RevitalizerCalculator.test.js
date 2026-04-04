import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../module/utilities/RevitalizerUtilities.js", () => {
    const settings = {
        gm: { id: "forGmOnly" },
        debug: { id: "debugMode" },
        rulesElementArrayLengthOnly: { id: "useArrayLength" },
        itemIgnoreList: { id: "userIgnoreList" },
        propertyIgnoreList: { id: "propertyIgnoreList" },
    };

    const state = {
        [settings.debug.id]: false,
        [settings.rulesElementArrayLengthOnly.id]: false,
        [settings.itemIgnoreList.id]: [],
        [settings.propertyIgnoreList.id]: [],
    };

    return {
        popup: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        settings,
        getSettings: vi.fn((key) => state[key] ?? ""),
        getNestedProperty: (obj, path) => {
            try {
                const value = path.split(".").reduce((acc, key) => acc[key], obj);
                return value !== undefined ? value : null;
            } catch {
                return null;
            }
        },
    };
});

import RevitalizerCalculator from "../module/RevitalizerCalculator.js";

function createActorItem(system) {
    return {
        type: "feat",
        sourceId: "Compendium.pf2e.feats-srd.Item.abc123",
        uuid: "Actor.test.Item.actorItem",
        slug: "sample-feat",
        name: "Sample Feat",
        system: {
            traits: { value: [] },
            rules: [{ key: "Damage" }],
            ...system,
        },
        toObject() {
            return {
                system: {
                    description: { value: "Actor text" },
                    slug: "sample-feat",
                    rules: [{ key: "Damage" }],
                    traits: { value: [] },
                    ...system,
                },
            };
        },
    };
}

function createOriginItem(system) {
    return {
        sourceId: "Compendium.pf2e.feats-srd.Item.abc123",
        toObject() {
            return {
                system: {
                    description: { value: "Origin text" },
                    slug: "sample-feat",
                    rules: [{ key: "Damage" }],
                    traits: { value: [] },
                    ...system,
                },
            };
        },
    };
}

describe("RevitalizerCalculator.runRevitalizerCheck", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        globalThis.foundry = undefined;
    });

    it("returns a changed item on the public happy path", async () => {
        const actorItem = createActorItem();
        const originItem = createOriginItem();
        globalThis.fromUuid = vi.fn().mockResolvedValue(originItem);
        globalThis.foundry = {
            utils: {
                diffObject: vi.fn().mockReturnValue({ description: { value: "Actor text" } }),
                isEmpty: vi.fn().mockReturnValue(false),
            },
        };

        const actor = {
            name: "Test Actor",
            items: {
                size: 1,
                filter: (predicate) => [actorItem].filter(predicate),
            },
        };

        const calculator = new RevitalizerCalculator();
        const result = await calculator.runRevitalizerCheck([actor]);

        expect(globalThis.fromUuid).toHaveBeenCalledWith(actorItem.sourceId);
        expect(result).toHaveLength(1);
        expect(result[0].actorItem).toBe(actorItem);
        expect(result[0].originItem).toBe(originItem);
        expect(result[0].canRefreshFromCompendium).toBe(true);
        expect(Object.keys(result[0].comparativeDiff)).toContain("description");
        expect(result[0].comparativeDiff.description.actor).toContain("Actor text");
        expect(result[0].comparativeDiff.description.origin).toContain("Origin text");
    });

    it("returns no changes when diffObject reports an empty system diff", async () => {
        const actorItem = createActorItem();
        const originItem = createOriginItem();
        globalThis.fromUuid = vi.fn().mockResolvedValue(originItem);
        globalThis.foundry = {
            utils: {
                diffObject: vi.fn().mockReturnValue({}),
                isEmpty: vi.fn().mockReturnValue(true),
            },
        };

        const actor = {
            name: "Test Actor",
            items: {
                size: 1,
                filter: (predicate) => [actorItem].filter(predicate),
            },
        };

        const calculator = new RevitalizerCalculator();
        const result = await calculator.runRevitalizerCheck([actor]);

        expect(result).toHaveLength(0);
    });

    it("falls back to legacy key scan when diffObject is unavailable", async () => {
        const actorItem = createActorItem();
        const originItem = createOriginItem();
        globalThis.fromUuid = vi.fn().mockResolvedValue(originItem);
        globalThis.foundry = { utils: {} };

        const actor = {
            name: "Test Actor",
            items: {
                size: 1,
                filter: (predicate) => [actorItem].filter(predicate),
            },
        };

        const calculator = new RevitalizerCalculator();
        const result = await calculator.runRevitalizerCheck([actor]);

        expect(result).toHaveLength(1);
        expect(Object.keys(result[0].comparativeDiff)).toContain("description");
        expect(result[0].comparativeDiff.description.actor).toContain("Actor text");
    });
});
