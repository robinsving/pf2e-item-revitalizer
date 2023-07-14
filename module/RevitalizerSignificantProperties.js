export { PF2E_PROPERTY_ALLOW_LIST, PF2E_PROPERTY_ALLOW_LIST_BASE };

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
};

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
};

const ruleTypeChoiceSet = {
    // ChoiceSet
    choices: {
        label: true,
        value: true,
        predicate: true,
    },
    prompt: true,
    definition: true,
    label: true,
    rollOption: true,
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
    group: true,
    label: true,
    traits: true,
};

const ruleTypeCraftingEntry = {
    // Crafting Entry
    craftableItems: true,
    isAlchemical: true,
    isDailyPrep:true,
    maxItemLevel: true,
};

const ruleTypeActiveEffect = {
    // ActiveEffect-like
    mode: true,
    path: true,
    phase: true,
};

const ruleTypeAura = {
    // Aura
    effects: {
        affects: true,
        events: true,
        includesSelf: true,
        uuid: true,
    },
    radius: true,
    traits: true,
};

const ruleTypeGrantItem = {
    alterations: {
        mode: true,
        property: true,
        value: true,
    },
    onDeleteActions: {
        grantee: true,
    },
    uuid: true,
};

const ruleTypeRollOption = {
    domain: true,
    option: true,
    toggleable: true,
    suboptions: {
        label: true,
        value: true,
    },
};

const ruleTypeDamageDie = {
    //DamageDice
    predicate: {
        ...predicateTrue,
    },
    label: true,
    category: true,
    damageType: true,
    diceNumber: true,
    dieSize: true,
    override: {
        damageType: true,
        dieSize: true,
        upgrade: true,
    }
};

const ruleTypeIWR = {
    exceptions: true,
    mode: true,
    type: true,
};

const ruleTypeNote = {
    title: true,
    text: true,
};

const ruleTypeSense = {
    acuity: true,
};

const ruleTypeAdjustModifier = {
    relabel: true,
};

const ruleTypeCriticalSpecialization = {
    alternate: true,
};

const ruleTypeSubstituteRoll = {
    suppress: true,
};

const ruleElementTokenImage = {
    scale: true,
};

const ruleElementActorTrait = {
    add: true,
};

const ruleElementRollTwice = {
    keep: true,
};

// all combined values, as they will override each other using JS spread
const ruleTypeValuesCombined = {
    value: {
        // TokenLight
        animation: {
            intensity: true,
            speed: true,
            type: true,
        },
        bright: true,
        color: true,
        dim: true,
        shadows: true,
        luminosity: true,
        gradual: true,
        contrast: true,
        saturation: true,
        coloration: true,
        angle: true,
        alpha: true,
        // Common brackets
        brackets: {
            end: true,
            start: true,
            value: true,
        },
        greater: true,
        lesser: true,
        label: true,
        predicate: true,
        value: true,
    }
};

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
    damageType: true,
    damageCategory: true,
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
        ...ruleTypeChoiceSet,
        ...ruleTypeStrike,
        ...ruleTypeActiveEffect,
        ...ruleTypeCraftingEntry,
        ...ruleTypeAura,
        ...ruleTypeGrantItem,
        ...ruleTypeRollOption,
        ...ruleTypeDamageDie,
        ...ruleTypeFlatModifier,
        ...ruleTypeIWR,
        ...ruleTypeNote,
        ...ruleTypeSense,
        ...ruleTypeAdjustModifier,
        ...ruleTypeCriticalSpecialization,
        ...ruleTypeSubstituteRoll,
        ...ruleElementTokenImage,
        ...ruleElementActorTrait,
        ...ruleElementRollTwice,

        ...ruleTypeValuesCombined,
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
    "stackGroup": true,
    "negateBulk": {
        "value": true,
    },
    "preciousMaterial": {
        "value": true,
    },
    "preciousMaterialGrade": {
        "value": true,
    },
    "size": true,
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
    
    heritage: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        // Heritage
        ancestry: {
            name: true,
            uuid: true,
            slug: true,
        }
    },

    background: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        // Background
        "boosts": {
            0: {
                value: true,
            },
            1: {
                value: true,
            }
        },
        "items": true,
        "trainedLore": true,
        "trainedSkills": {
            "value": true,
        }
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
        "specific": {
            "value": true,
        },
    },

    armor: {
        ...baseEquipment,
        "armor": {
            "value": true,
        },
        "category": true,
        "group": true,
        "strength": {
            "value": true,
        },
        "dex": {
            "value": true,
        },
        "check": {
            "value": true,
        },
        "speed": {
            "value": true,
        },
    },

    backpack: {
        ...baseEquipment,
        "bulkCapacity": {
            "value": true,
        },
        "stowing": true,
    },

    treasure: {
        ...baseEquipment
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

    deity: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        alignment: {
            own: true,
            follower: true,
        },
        domains: {
            primary: true,
            alternate: true,
        },
        font: true,
        ability: true,
        skill: true,
        weapons: true,
        spells: {
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true,
            9: true,
        }
    },

    spell: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        "level": {
            "value": true,
        },
        "spellType": {
            "value": true,
        },
        "category": {
            "value": true,
        },
        "traditions": {
            "value": true,
            "custom": true,
        },
        "school": {
            "value": true,
        },
        "components": {
            "focus": true,
            "material": true,
            "somatic": true,
            "verbal": true,
        },
        "materials": {
            "value": true,
        },
        "target": {
            "value": true,
        },
        "range": {
            "value": true,
        },
        "area": {
            "type": true,
            "value": true,
        },
        "time": {
            "value": true,
        },
        "duration": {
            "value": true,
        },
        "damage": {
            "value": true,
        },
        "save": {
            "value": true,
            "basic": true,
        },
        "sustained": {
            "value": true,
        },
        "cost": {
            "value": true,
        },
        "hasCounteractCheck": {
            "value": true,
        },
        "ability": {
            "value": true,
        },
        "heightening": {
            // "levels": skipping this, as this may be too advanced for this little script
            "type": true,
        },
        "prepared": {
            "value": true,
        }
    },

    action: {
        ...PF2E_PROPERTY_ALLOW_LIST_BASE,
        "actionType": {
            "value": true,
        },
        "actions": {
            "value": true,
        },
        "requirements": {
            "value": true,
        },
        "trigger": {
            "value": true,
        },
        "deathNote": true,
        "weapon": {
            "value": true,
        }
    }
};