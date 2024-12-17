import { describe, it, expect } from 'vitest'
import { hasOnlyIgnorableTraits, isDeepEmpty, canRefreshFromCompendium} from "../module/utilities/RevitalizerCalculationUtilities.js";


describe('RevitalizerUtilities.isDeepEmpty', () => {
    it('should work', () => {
        const object = {};
        const result = isDeepEmpty(object);
        expect(result).toBe(true);
    })

    it('should work with nested empties', () => {
        const object = {a:[{}, {b:{}}]};
        const result = isDeepEmpty(object);
        expect(result).toBe(true);
    })
})

describe('RevitalizerUtilities.hasOnlyIgnorableTraits', () => {
    //["magical", "invested", "good", "evil", "arcane","divine","occult","primal"]

    it('should work', () => {
        const object = [];
        const result = hasOnlyIgnorableTraits(object, []);
        expect(result).toBe(true);
    })

    it('should work with ignorable traits', () => {
        let result = hasOnlyIgnorableTraits(["magical", "invested", "good", "evil", "arcane","divine","occult","primal"], []);
        expect(result).toBe(true);

        result = hasOnlyIgnorableTraits([], ["magical", "invested", "good", "evil", "arcane","divine","occult","primal"]);
        expect(result).toBe(true);
    })

    it('should work with non-ignorable traits', () => {
        let result = hasOnlyIgnorableTraits([], ["a", "magical", "place"]);
        expect(result).toBe(false);

        result = hasOnlyIgnorableTraits(["a", "magical", "place"], []);
        expect(result).toBe(false);
    })
})

describe('RevitalizerUtilities.canRefreshFromCompendium', () => {

    it('should work with refreshables', () => {
        expect(
            canRefreshFromCompendium("Compendium.banana", [{key: "Damage"}])
        ).toBe(true);
    })

    it('should work with non-refreshable', () => {
        expect(
            canRefreshFromCompendium("Compendium.banana", [{key: "ChoiceSet"}])
        ).toBe(false);

        expect(
            canRefreshFromCompendium("Compendium.banana", [{key: "GrantItem"}])
        ).toBe(false);

        expect(
            canRefreshFromCompendium("Source.banana", [{key: "Damage"}])
        ).toBe(false);

        expect(
            canRefreshFromCompendium("Compendium.banana", [])
        ).toBe(true);

    })

    it('should handle erroneous input', () => {
        expect(
            canRefreshFromCompendium(undefined, [{key: "Damage"}])
        ).toBe(false);

        expect(
            canRefreshFromCompendium("Compendium.banana", undefined)
        ).toBe(false);
    })
})
