export { PF2E_PROPERTY_ALLOW_LIST, PF2E_PROPERTY_ALLOW_LIST_BASE };

const ruleTypeChoiceSet = {
    // ChoiceSet
    choices: true,
    prompt: true,
    //selection: false, // selection cannot be used, as that changes upon adding (selecting) it in the characted sheet
    definition: true,
    label: true,
    //value: false,     // value sets to false from nothing upon adding
};

const ruleTypeStrike = {
    // Strike
    category: true,
    damage: {
        base: {
            damageType: true,
            dice: true,
            die: true
        }
    },
    otherTags: true,
};

const ruleTypeCraftingEntry = {
    // Crafting Entry
    craftableItems: true,
    isAlchemical: true,
    isDailyPrep:true,
    maxItemLevel: true,
}

const ruleTypeActiveEffect = {
    // ActiveEffect-like
    mode: true,
    path: true,
};

const ruleTypeAura = {
    // Aura
    effects: {
        affects: true,
        events: true,
        uuid: true,
    },
    radius: true,
    traits: true,
}

const ruleTypeGrantItem = {
    uuid: true,
    //grantedId: true,              // skipping this as it only seems to cause false positives
};

const ruleTypeRollOption = {
    domain: true,
    option: true,
    toggleable: true,
    //value: true
};

const ruleTypeDamageDie = {
    "category": true,
    "damageType": true,
    "diceNumber": true,
    "dieSize": true,
}

// Predicate basics. Since I don't want to have separate logic just for this one
const predicateTrue = {
    and: true,
    or: true,
    not: true,
    nand: true,
    nor: true,
    lt: true,
    lte: true,
    gt: true,
    gte: true,
}

const predicate = {
    and: {
        ...predicateTrue
    },
    or: {
        ...predicateTrue
    },
    not: {
        ...predicateTrue
    },
    nand: {
        ...predicateTrue
    },
    nor: {
        ...predicateTrue
    },
    lt: {
        ...predicateTrue
    },
    lte: {
        ...predicateTrue
    },
    gt: {
        ...predicateTrue
    },
    gte: {
        ...predicateTrue
    },
}

const ruleTypeFlatModifier = {
    ability: true,
    predicate: {
        and: {
            ...predicate
        },
        or: {
            ...predicate
        },
        not: {
            ...predicate
        },
            nand: {
            ...predicate
        },
        nor: {
            ...predicate
        },
        lt: {
            ...predicate
        },
        lte: {
            ...predicate
        },
        gt: {
            ...predicate
        },
        gte: {
            ...predicate
        },
    }, 
    selector: true,
    type: true,
};

// Allowlists of properties to include in the Item clones
const PF2E_PROPERTY_ALLOW_LIST_BASE = {
    baseItem: true,
    description: {
        gm: true,
        value: true,
    },
    key: true,
    slug: true,
    rules: {

        //allowDuplicate: false, // changes on being added into character sheet?
        text: true,
        predicate: true,
        //flag: false,      // flag changes upon adding it in the characted sheet

        ...ruleTypeChoiceSet,
        ...ruleTypeStrike,
        ...ruleTypeActiveEffect,
        ...ruleTypeCraftingEntry,
        ...ruleTypeAura,
        ...ruleTypeGrantItem,
        ...ruleTypeRollOption,
        ...ruleTypeDamageDie,
        ...ruleTypeFlatModifier,
    },
    traits: {
        rarity: true,
        //value: true,
    },
};

const baseEquipment = {
    ...PF2E_PROPERTY_ALLOW_LIST_BASE,
    "level": {
        "value": true,
    },
    "traits": {
        "value": true,
        "rarity": true,
        "otherTags": true,
    },
    //"quantity": false,
    "baseItem": true,
    "hp": {
        "brokenThreshold": true,
        "value": true,
        "max": true,
    },
    "hardness": true,
    "weight": {
        "value": true,
    },
    "equippedBulk": {
        "value": true,
    },
    "price": {
        "value": {
            "gp": true,
            "sp": true,
            "cp": true,
            "pp": true,
        }
    },
    "equipped": {
        "carryType": true,
        "invested": true,
    },
    "stackGroup": true,
    "negateBulk": {
        "value": true,
    },
    "containerId": true,
    "preciousMaterial": {
        "value": true,
    },
    "preciousMaterialGrade": {
        "value": true,
    },
    "size": true,
    "identification": {
        "status": true,
        "unidentified": {
            "name": true,
            "img":true,
            "data": {
                "description": {
                    "value": true,
                }
            }
        },
        //"misidentified": {}
    },
    "usage": {
        "value": true,
    }
};

const PF2E_PROPERTY_ALLOW_LIST = {
    ancestry: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        // Ancestry
        hp: true,
        size: true,
        reach: true,
        speed: true,
    },

    class: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        // Class
        trainedSkills: {
            value: true,
            additional: true,
        },
        perception: true,
        savingThrows: {
            fortitude: true,
            reflex: true,
            will: true
        },
        attacks: {
            simple: true,
            martial: true,
            advanced: true,
            unarmed: true,
            other: {
                name: true,
                rank: true,
            },
        },
        defenses: {
            unarmored: true,
            light: true,
            medium: true,
            heavy: true,
        },
    },

    feat: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        // feats
        // level: false,        // level differs due to level of feats being bound to the lowest applicable value, e.g. Resolve is level 7, but some classes gets it at level 11
        actions: {
            value: true,
        },
        prerequisites: {
            value: true,
        },
        actionType: {
            value: true,
        },
        requirements: {
            value: true,
        },
        trigger: {
            value: true,
        },
        deathNote: true,
        weapon: {
            value: true,
        },
        //location: true,
        category: true,
        traits: {
            value: true,
            rarity: true,
        },
    },

    equipment: {
        ...baseEquipment
    },

    consumable: {
        ...baseEquipment,
        "consumableType": {
            "value": true,
        },
        "charges": {
            "value": true,
            "max": true,
        },
        "consume": {
            "value": true,
        },
        "autoDestroy": {
            "value": true,
        },
        "spell": true,
        "temporary": true,
    },

    weapon: {
        ...baseEquipment,

        "category": "martial",
        "group": "firearm",
        "bonus": {
            "value": 0
        },
        "damage": {
            "dice": true,
            "die": true,
            "damageType": true,
            "persistent": true,
            "value": true,
        },
        "bonusDamage": {
            "value": true,
        },
        "splashDamage": {
            "value": true,
        },
        "range": true,
        "reload": {
            "value": true,
        },
        "MAP": {
            "value": true,
        },
        "potencyRune": {
            "value": true,
        },
        "strikingRune": {
            "value": true,
        },
        "specific": {
            "value": true,
        },
        "propertyRune1": {
            "value": true,
        },
        "propertyRune2": {
            "value": true,
        },
        "propertyRune3": {
            "value": true,
        },
        "propertyRune4": {
            "value": true,
        },
        // "selectedAmmoId": "8q9cHSzMfzNKCWya"
    },

    //TODO equipment
    armor: {
        ...baseEquipment
    },
    backpack: {
        ...baseEquipment
    },
    book: {
        ...baseEquipment
    },
    kit: {
        ...baseEquipment
    },
    treasure: {
        ...baseEquipment
    },
};

// "action", "background", "condition", "deity", "effect", "heritage", "spell", "spellcastingEntry"