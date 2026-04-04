import { describe, it, expect, vi, beforeEach } from "vitest";
import { settings } from "../module/utilities/RevitalizerUtilities.js";

// Mock the UI modules since they're not part of the test
vi.mock("../module/ui/RevitalizerPropertyIgnoreMenu.js", () => ({
    default: class MockPropertyIgnoreMenu {},
}));

vi.mock("../module/ui/RevitalizerItemIgnoreMenu.js", () => ({
    default: class MockItemIgnoreMenu {},
}));

const SCRIPT_ID = "pf2e-item-revitalizer";

function createGameState() {
    const state = new Map();
    return {
        state,
        game: {
            user: { isGM: true },
            i18n: { localize: (key) => key },
            settings: {
                register: (_moduleId, settingId, data) => {
                    if (!state.has(settingId)) {
                        state.set(settingId, data.default);
                    }
                },
                registerMenu: vi.fn(),
                get: (_moduleId, settingId) => state.get(settingId),
                set: async (_moduleId, settingId, value) => {
                    state.set(settingId, value);
                    return value;
                },
            },
        },
    };
}

describe("RevitalizerSettings migration path", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        delete globalThis.game;
        delete globalThis.Hooks;
    });

    it("marks settings from v0 as migrated without changes", async () => {
        const { game, state } = createGameState();
        state.set("migration", 0);
        state.set(
            "userIgnoreList",
            '["Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg","Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz"]'
        );
        state.set("propertyIgnoreList", '["publication", "rarity"]');

        let readyCallback;
        globalThis.Hooks = {
            once: vi.fn((event, callback) => {
                if (event === "ready") readyCallback = callback;
            }),
        };

        globalThis.game = game;
        const { default: RevitalizerSettings } = await import("../module/RevitalizerSettings.js");
        new RevitalizerSettings();
        await readyCallback();

        expect(game.settings.get(SCRIPT_ID, "migration")).toBe(2);
        expect(game.settings.get(SCRIPT_ID, settings.propertyIgnoreList.id)).toEqual(["publication", "rarity"]);
        expect(game.settings.get(SCRIPT_ID, settings.itemIgnoreList.id)).toEqual([
            "Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg",
            "Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz",
        ]);
    });

    it("migrates itemIgnoreList CSV entries from v1 to v2", async () => {
        const { game, state } = createGameState();
        state.set("migration", 1);
        state.set("userIgnoreList", "Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg,Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz");

        let readyCallback;
        globalThis.Hooks = {
            once: vi.fn((event, callback) => {
                if (event === "ready") readyCallback = callback;
            }),
        };

        globalThis.game = game;
        const { default: RevitalizerSettings } = await import("../module/RevitalizerSettings.js");
        new RevitalizerSettings();
        await readyCallback();

        expect(game.settings.get(SCRIPT_ID, "migration")).toBe(2);
        expect(game.settings.get(SCRIPT_ID, settings.itemIgnoreList.id)).toEqual([
            "Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg",
            "Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz",
        ]);
    });

    it("keeps itemIgnoreList as an array when already migrated", async () => {
        const { game, state } = createGameState();
        state.set("migration", 2);
        state.set("userIgnoreList", [
            "Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg",
            "Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz",
        ]);

        let readyCallback;
        globalThis.Hooks = {
            once: vi.fn((event, callback) => {
                if (event === "ready") readyCallback = callback;
            }),
        };

        globalThis.game = game;
        const { default: RevitalizerSettings } = await import("../module/RevitalizerSettings.js");
        new RevitalizerSettings();
        await readyCallback();

        expect(game.settings.get(SCRIPT_ID, "migration")).toBe(2);
        expect(game.settings.get(SCRIPT_ID, settings.itemIgnoreList.id)).toEqual([
            "Actor.bpZQLYUoLQvuhhyt.Item.a62H9dU3HHLiZhxg",
            "Actor.bpZQLYUoLQvuhhyt.Item.hzty7RhC21wYBEyz",
        ]);
    });

});
