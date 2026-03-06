import { describe, it, expect } from "vitest";
import { hasOnlyIgnorableTraits, isDeepEmpty, canRefreshFromCompendium } from "../module/utilities/RevitalizerCalculationUtilities.js";

describe("RevitalizerUtilities.isDeepEmpty", () => {
    it("returns true for empty structures", () => {
        expect(isDeepEmpty({})).toBe(true);
        expect(isDeepEmpty({ a: [{}, { b: {} }] })).toBe(true);
        expect(isDeepEmpty("   ")).toBe(true);
        expect(isDeepEmpty(0)).toBe(true);
        expect(isDeepEmpty(undefined)).toBe(true);
    });

    it("returns false when nested values are present", () => {
        expect(isDeepEmpty({ a: [{}, { b: { c: 1 } }] })).toBe(false);
        expect(isDeepEmpty({ a: ["", "x"] })).toBe(false);
        expect(isDeepEmpty(false)).toBe(false);
    });
});

describe("RevitalizerUtilities.hasOnlyIgnorableTraits", () => {
    it("returns true for identical empty arrays", () => {
        expect(hasOnlyIgnorableTraits([], [])).toBe(true);
    });

    it("returns true when all differences are ignorable in either direction", () => {
        expect(
            hasOnlyIgnorableTraits(
                ["magical", "invested", "good", "evil", "arcane", "divine", "occult", "primal", "skill", "general", "move"],
                []
            )
        ).toBe(true);

        expect(
            hasOnlyIgnorableTraits(
                [],
                ["magical", "invested", "good", "evil", "arcane", "divine", "occult", "primal", "skill", "general", "move"]
            )
        ).toBe(true);
    });

    it("returns true for class-only trait differences", () => {
        expect(
            hasOnlyIgnorableTraits(
                ["alchemist", "fighter", "wizard", "exemplar"],
                ["fighter"]
            )
        ).toBe(true);
    });

    it("returns false when any difference is non-ignorable", () => {
        expect(hasOnlyIgnorableTraits([], ["rare", "magical"])).toBe(false);
        expect(hasOnlyIgnorableTraits(["rare", "magical"], [])).toBe(false);
        expect(hasOnlyIgnorableTraits(undefined, ["magical"])).toBe(false);
    });
});

describe("RevitalizerUtilities.canRefreshFromCompendium", () => {
    it("returns true for valid compendium source and non-special rules", () => {
        expect(canRefreshFromCompendium("Compendium.banana", [{ key: "Damage" }])).toBe(true);
        expect(canRefreshFromCompendium("Compendium.banana", [])).toBe(true);
    });

    it("returns false for blocked rule keys", () => {
        expect(canRefreshFromCompendium("Compendium.banana", [{ key: "ChoiceSet" }])).toBe(false);
        expect(canRefreshFromCompendium("Compendium.banana", [{ key: "GrantItem" }])).toBe(false);
    });

    it("returns false for invalid source or undefined rules", () => {
        expect(canRefreshFromCompendium("Source.banana", [{ key: "Damage" }])).toBe(false);
        expect(canRefreshFromCompendium(undefined, [{ key: "Damage" }])).toBe(false);
        expect(canRefreshFromCompendium("Compendium.banana", undefined)).toBe(false);
    });
});
