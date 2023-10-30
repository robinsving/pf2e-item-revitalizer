export { PROPERTY_ALLOW_LIST, PROPERTY_ALLOW_LIST_BASE, SPECIAL_ITEM_PROPERTIES, IMPORTANT_ITEM_TYPES, ALL_ITEM_TYPES };

const SPECIAL_ITEM_PROPERTIES = [
    { path: "img", name : "icon-link" },
    { path: "type", name : "type" },
];

// List of Types to locate
const IMPORTANT_ITEM_TYPES = ["class", "ancestry", "heritage", "background"];
const ALL_ITEM_TYPES = ["action", "armor", "backpack", "consumable", "deity", "equipment", "feat", "spell", "treasure", "weapon", ...IMPORTANT_ITEM_TYPES];

const choiceSetRE = {
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
    allowedDrops: {
        label: true,
        predicate: true,
    },
};

const strikeRE = {
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

const craftingEntryRE = {
    // Crafting Entry
    craftableItems: true,
    isAlchemical: true,
    isDailyPrep:true,
    maxItemLevel: true,
};

const aurasRE = {
    // Aura
    effects: {
        affects: true,
        events: true,
        includesSelf: true,
        uuid: true,
        predicate: true,
    },
    radius: true,
    traits: true,
    appearance: true,
};

const grantItemRE = {
    alterations: {
        mode: true,
        property: true,
        value: true,
    },
    onDeleteActions: {
        grantee: true,
    },
    uuid: true,
    reevaluateOnUpdate: true,
    inMemoryOnly: true,
    allowDuplicate: true,
};

const rollOptionRE = {
    domain: true,
    option: true,
    toggleable: true,
    suboptions: {
        label: true,
        value: true,
    },
};

const damageDiceRE = {
    //DamageDice
    critical: true,
    predicate: true,
    label: true,
    category: true,
    damageType: true,
    diceNumber: true,
    dieSize: true,
    override: {
        damageType: true,
        dieSize: true,
        upgrade: true,
    },
};

const iwrRE = {
    exceptions: true,
    mode: true,
    type: true,
};

const noteRE = {
    title: true,
    text: true,
};

const senseRE = {
    acuity: true,
};

const adjustModifierRE = {
    relabel: true,
};

const criticalSpecializationRE = {
    alternate: true,
};

const substituteRollRE = {
    suppress: true,
    removeAfterRoll: true,
    required: true,
};

const tokenImageRE = {
    scale: true,
};

const actorTraitRE = {
    add: true,
};

const rollTwiceRE = {
    keep: true,
};

const adjustStrikeRE = {
    property: true,
};

const flatModifierRE = {
    ability: true,
    //predicate: true,
    damageType: true,
    damageCategory: true,
    selector: true,
    type: true,
    removeAfterRoll: true,
};

const activeEffectRE = {
    // ActiveEffect-like
    mode: true,
    path: true,
    phase: true,
};

const loseHitPointsRE = {
    // Lose Hit Points
    recoverable: true,
};

const changingDegreeOfSuccessRE = {
    adjustment: true,
};


// Allowlists of properties to include in the Item clones
const PROPERTY_ALLOW_LIST_BASE = {
    baseItem: true,
    description: {
        gm: true,
        value: true,
    },
    key: true,
    slug: true,
    rules: {
        // Flat Modifier
        ...flatModifierRE,
        
        // Immunity, Weakness, Resistance
        ...iwrRE,
        
        // Fast Healing
        // no new properties
        
        // Damage Dice 
        ...damageDiceRE,
        
        // Base Speed
        // no new properties
        
        // Fixed Proficiency
        // no new properties

        // Strike
        ...strikeRE,

        // Note
        ...noteRE,

        // Dexterity Modifier Cap
        // no new properties

        // Sense
        ...senseRE,

        // Weapon Potency and Striking
        // no new properties
        
        // Multiple Attack Penalty
        // no new properties

        // Lose Hit Points
        ...loseHitPointsRE,

        // Adjust Strike
        ...adjustStrikeRE,

        // Adjust Modifier
        ...adjustModifierRE,

        // Token Light
        // no new properties (everything is in "value" object)

        // Token Name
        // no new properties

        // Critical Specialization
        ...criticalSpecializationRE,

        // Substitute Roll
        ...substituteRollRE,

        // Martial Proficiency
        // no new properties

        // ActiveEffect-Like
        ...activeEffectRE,

        // RollOption
        ...rollOptionRE,
        
        // Choice Set
        ...choiceSetRE,

        // Grant Item
        ...grantItemRE,

        // Ephemeral Effect
        // no new properties

        // Item Alteration 
        // no new properties

        // Temp HP
        // no new properties

        // Token Effect Icon
        // no new properties

        // Token Image
        ...tokenImageRE,

        // Creature Size
        // no new properties

        // Adding Actor Traits
        ...actorTraitRE,

        // Roll Twice (Fortune or Misfortune)
        ...rollTwiceRE,

        // Token Mark 
        // no new properties

        // Auras
        ...aurasRE,

        // Bracket using Item Attribute
        // no new properties

        // Character stats in value formula
        // no new properties

        // Bracketed Properties
        // no new properties

        // Damage Dice override
        // (damage dice)

        // Advanced Selectors
        // no new properties

        // Predicate by proficiency
        // no new properties

        // Options vs. Traits for Strikes
        // no new properties

        // Changing Degree of Success 
        ...changingDegreeOfSuccessRE,
        
        // other
        ...craftingEntryRE,
        // Battle Form - not relevant as they are Spell Effects only
    },

    traits: {
        rarity: true,
        //value: true,
    },
};

const baseEquipment = {
    ...PROPERTY_ALLOW_LIST_BASE,
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
        "max": true,
    },
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
    "size": true,
    "usage": {
        "value": true,
    }
};

const PROPERTY_ALLOW_LIST = {
    ancestry: {
        ...PROPERTY_ALLOW_LIST_BASE,
        // Ancestry
        hp: true,
        size: true,
        reach: true,
        speed: true,
    },
    
    heritage: {
        ...PROPERTY_ALLOW_LIST_BASE,
        // Heritage
        ancestry: {
            name: true,
            uuid: true,
            slug: true,
        }
    },

    background: {
        ...PROPERTY_ALLOW_LIST_BASE,
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
        ...PROPERTY_ALLOW_LIST_BASE,
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
            "value": true
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
        }
    },

    treasure: {
        ...baseEquipment
    },

    feat: {
        ...PROPERTY_ALLOW_LIST_BASE,
        // feats
        // level: false,        // level differs due to level of feats being bound to the lowest applicable value, e.g. Resolve is level 7, but some classes gets it at level 11
        actions: {
            value: true,
        },
        prerequisites: {
            value: true,
        },
        onlyLevel1: true,
        maxTakable: true,
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
        selfEffect: true,
    },

    deity: {
        ...PROPERTY_ALLOW_LIST_BASE,
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
        ...PROPERTY_ALLOW_LIST_BASE,
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
        "overlays": true,
        "heightening": true,
        "prepared": {
            "value": true,
        }
    },

    action: {
        ...PROPERTY_ALLOW_LIST_BASE,
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
        "weapon": {
            "value": true,
        }
    }
};