import { describe, it, expect } from 'vitest'
import { getNestedProperty, isEmpty } from "../module/utilities/RevitalizerUtilities.js";


describe('RevitalizerUtilities.isEmpty', () => {
    it('should work', () => {
        const object = {};
        const result = isEmpty(object);
        expect(result).toBe(true);
    })

    it('should work with nested empties', () => {
        const object = {a:[{}, {b:{}}]};
        const result = isEmpty(object);
        expect(result).toBe(true);
    })
})