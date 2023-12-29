export { PROPERTY_ALLOW_LIST, PROPERTY_ALLOW_LIST_BASE, SPECIAL_ITEM_PROPERTIES, IMPORTANT_ITEM_PROPERTIES, ALL_ITEM_TYPES };

const SPECIAL_ITEM_PROPERTIES = [
    { path: "img", name : "icon-link" },
    { path: "type", name : "type" },
];

// List of Types to locate
const ALL_ITEM_TYPES = ["class", "ancestry", "heritage", "background", "action", "armor", "backpack", "consumable", "deity", "equipment", "feat", "spell", "treasure", "weapon"];

// List of Properties which require complete remaking
const IMPORTANT_ITEM_PROPERTIES = ["traits", "slug", "rules", "heightening", "damage", "overlays", "type"];

const choiceSetRE = {
    key: true,
    // ChoiceSet
    //choices: {
        //label: true,
        //value: true,
        //predicate: true,
    //},
    prompt: true,
    definition: true,
    //rollOption: true,
    //allowedDrops: false,
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
        //includesSelf: true,
        uuid: true,
        predicate: true,
    },
    radius: true,
    traits: true,
    //appearance: true,
};

const grantItemRE = {
    //alterations: false
    onDeleteActions: {
        grantee: true,
    },
    uuid: true,
    //reevaluateOnUpdate: true,
    //inMemoryOnly: true,
    //allowDuplicate: true,
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
    //mode: true,
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
    //mode: true, (interferes with Resistance. Re-add on separated logic)
    path: true,
    //phase: true,
};

const itemAlterationRE = {
    // ItemAlteration
    itemType: true
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
    publication: true,
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

        // Item Alteration
        ...itemAlterationRE,

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
        value: true
    },
};

const baseEquipment = {
    ...PROPERTY_ALLOW_LIST_BASE,
    //"level": false
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
    //"price": false            -- runes will automatically change prices
    "stackGroup": true,
    "negateBulk": {
        "value": true,
    },
    //"size": true,
    "usage": {
        "value": true,
    },
    "bulk": {
        "worn": true,
        "per": true,
    }
};

const PROPERTY_ALLOW_LIST = {
    ancestry: {
        ...PROPERTY_ALLOW_LIST_BASE,
        // Ancestry
        boosts: {
            0: {value: true},
            1: {value: true},
            2: {value: true},
        },
        flaws: false,
        hp: true,
        languages: true,
        additionalLanguages: true,
        size: true,
        reach: true,
        speed: true,
        vision: true,
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
        boosts: {
            0: {value: true},
            1: {value: true},
            2: {value: true},
        },
        items: false, // covered by rule GrantItem
        trainedLore: true,
        trainedSkills: true,
    },

    class: {
        ...PROPERTY_ALLOW_LIST_BASE,
        // Class
        keyAbility: {
            value: true
        },
        hp: true,
        trainedSkills: true,
        perception: true,
        savingThrows: true,
        attacks: true,
        defenses: true,
    },

    equipment: {
        ...baseEquipment
    },

    consumable: {
        ...baseEquipment,
        consumableType: true,
        charges: {
            max: true,
        },
        consume: true,
        autoDestroy: true,
        spell: true,
    },

    weapon: {
        ...baseEquipment,
        usage: true,
        category: true,
        group: true,
        bonus: true,
        damage: {
            //dice: true, (auto-scaling from e.g. ABP/runes causes this to increase)
            die: true,
            damageType: true,
            persistent: true,
        },
        bonusDamage: true,
        splashDamage: true,
        range: true,
        reload: true,
        graspingAppendage: true,
        attribute: true,

        // pre-remaster
        MAP: true,
        specific: true,
    },

    armor: {
        ...baseEquipment,
        acBonus: true,              //shields
        category: true,
        group: true,                // e.g. leather
        hardness: true,
        hp: true,
        strength: true,
        runes: true,
        dexCap: true,
        checkPenalty: true,
        speedPenalty: true,

        // investigate
        "armor": {
            "value": true,
        },
        
        // pre-remaster
        dex: true,
        check: true,
        speed: true,
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
        actionType: {
            value: true,
        },
        actions: {
            value: true,
        },
        category: true,
        frequency: {
            max: true,
            per: true,
        },
        level: false,        // level differs due to level of feats being bound to the lowest applicable value, e.g. Resolve is level 7, but some classes gets it at level 11
        maxTakable: false,
        onlyLevel1: true,
        prerequisites: {
            value: true,
        },

        // investigation required

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
        selfEffect: {
            name: true,
            uuid: true
        },
    },

    deity: {
        ...PROPERTY_ALLOW_LIST_BASE,
        sanctification: true,
        domains: {
            primary: true,
            alternate: true,
        },
        font: true,
        attribute: true,
        skill: true,
        weapons: true,
        spells: true,
        // pre-remaster
        alignment: true,
        ability: true,
    },

    spell: {
        ...PROPERTY_ALLOW_LIST_BASE,
        area: {
            type: true,
            value: true,
        },
        category: {
            value: true,
        },
        cost: true,
        counteraction: true,
        damage: true,
        defense: true,
        duration: true,
        heightening: true,
        level: true,
        location: false,
        overlays: true,
        range: true,
        requirements: true,
        spellType: {
            value: true,
        },
        target: true,
        time: true,
        traits: {
            rarity: true,
            traditions: true,
            value: true
        },

        // pre-remaster - should be removed if found
        "save": true,
        "school": true,
        "components": true,
        "materials": true,
        "sustained": true,
        "ability": true,
        "prepared": true,
    },

    action: {
        ...PROPERTY_ALLOW_LIST_BASE,
        actionType: true,
        category: true,
        actions: true,
    }
};