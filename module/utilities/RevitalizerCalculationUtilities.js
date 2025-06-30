export { canRefreshFromCompendium, hasOnlyIgnorableTraits, isDeepEmpty };

function isDeepEmpty(value) {
    // Check for null, undefined, or 0
    if (value === null || value === undefined || value === 0) {
        return true;
    }

    // Check arrays
    if (Array.isArray(value)) {
        return value.every(isDeepEmpty);
    }

    // Check objects
    if (typeof value === 'object') {
        return Object.values(value).every(isDeepEmpty);
    }

    // Check strings
    if (typeof value === 'string') {
        return value.trim() === '';
    }

    // All other types are considered non-empty
    return false;
}

function hasOnlyIgnorableTraits(actorItemTraits, originItemTraits) {
    if (!actorItemTraits) {
        return false;
    }

    const traitIgnoreList = [
        "magical", "invested", "good", "evil", "arcane", "divine", "occult", "primal", "skill", "general", "move",

        // All the classes
        "alchemist", "animist", "barbarian", "bard", "champion", "cleric", "druid", "fighter", "investigator",
        "kineticist", "magus", "monk", "oracle", "psychic", "ranger", "rogue", "sorcerer", "summoner", "swashbuckler",
        "thaumaturge", "witch", "wizard", "gunslinger", "inventor", "exemplar",
    ];

    const differencesInActor = originItemTraits 
        ? actorItemTraits.filter(item => !originItemTraits.includes(item))
        : actorItemTraits;

    const differencesInOrigin = originItemTraits 
        ? originItemTraits.filter(item => !actorItemTraits.includes(item))
        : [];

    const allDifferencesIgnorable = differencesInActor.every(item => traitIgnoreList.includes(item)) &&
                                    differencesInOrigin.every(item => traitIgnoreList.includes(item));

    return allDifferencesIgnorable;
}

function canRefreshFromCompendium(sourceId, rules) {
    // Check if sourceId is a valid string and starts with "Compendium."
    const isValidCompendiumSource = typeof sourceId === "string" && sourceId.startsWith("Compendium.");
    
    // Check if there are any special rules (ChoiceSet or GrantItem)
    const hasSpecialRules = rules == undefined || rules.some(rule => 
        rule.key === "ChoiceSet" || rule.key === "GrantItem"
    );

    // Can refresh if it's a valid compendium source and has no special rules
    return isValidCompendiumSource && !hasSpecialRules;
}