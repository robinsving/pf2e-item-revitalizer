# Changelog

## 1.28.1
Bugfix
  Issue when Compendium Item had defined properties,
  but the Actor Item property was set to "undefined"
  by the system (e.g. Deity Ketephys' Traits)

## 1.28.0
New config
  Show Revitalizer for NPCs

## 1.27.1
Bump build dependencies

## 1.27.0
New Rule Elements
  Special Statistics
  Effect Spinoff
  Creature Size
Minor adjustments to Rule Elements
  Adjust Modifier

## 1.26.0
Change in Calculation Item base
  Now PIR uses the build-in toObject() of the Actor/Origin Item
  This means that there will be more false positives,
  but also less true positives,
  as well as faster difference calculations.
Internal structural changes

## 1.25.0
Foundry V12 combatability verification

## 1.24.0
Skip Refresh-rename of At-will spells

## 1.23.0
Default to built-in Refresh, with (settings) option for Revitalize as a backup

## 1.22.1
Clarification for disabled Refresh button

## 1.22.0
Add property subfeatures
Add Refresh from Compendium-button (the built-in PF2e refresher)

## 1.21.0
Remove Action properties
  trigger
  requirements
  weapon

## 1.20.1
No clarification text if not required

## 1.20.0
Ignoring Darkvision, Low-light Vision
  With newer classes, these are no longer Feat Items
  (just recreate the class to get it in the proper way)
Add Publication as a common property

Bugfix: Local copy of Ignore List overwrote global
  This meant that someone adding "rules" to ignore, and then ran the Checker
  would find that the Checker never checked the "rules" property even if
  later removing if from the settings (until a browser refresh).
Bugfix: Type property Revitalized in error
  Fixed ordering of Revitalize Item updator so that it checks for negation
  before it checks for special property inclusion (as Type is in both)

## 1.19.0
Remove SceneController button
Revitalize will now run for all properties that are not prohibited
  Non-revitalizable properties will be skipped.
  Relevant information shown in Tooltip and legend
Removed notes from Revitalizer Results
Removed name from Revitalizer Results

Bugfix: Selection for Scene Sidebar didn't filter for types

## 1.18.0
Allow GM running on new Sheet types
  Vehicles, Loot, and Party sheets
Bugfix: acBonus false positive when Runes were applied

## 1.17.1
Adding "invested" as ignorable trait, as this is added by equipment becoming magical by runes

## 1.17.0
Adding client (e.g. Player) settings allowing players to Hide Items
New display information for Results
  Spell shows rank
  Feats show category

Improved sorting
Style changes
  Buttons are more compact
  Results table cells are more compact
  
## 1.16.1
Bugfix: Scene Selection error message when trying to start while selection already started

## 1.16.0
Results Dialog window CSS upgrades
  Dialog Resizability

Bugfix: Missing tooltips

## 1.15.0
Remaster improvements
- Ancestry changes
- Background changes
- Class changes
- Weapon changes
- Armor changes
- Feat changes
- Deity changes
- Spell changes
- Action changes

Trait handling
  Ignores Spell traditions, good/evil, magical

## 1.14.2
Added maximum System version as pre-master

## 1.14.1
Bugfix: Spell Damage false negative (Remaster redefined the value)
Bugfix: Armor HP removed due to Shield Ally

## 1.14.0
Fixing some false positives
Allow icon-link update even for important types

## 1.13.1
Bugfix: Hide functionality had incorrect handling

## 1.13.0
Added Revitalizer button to Actor Sidebar
Added Revitalizer button to Scene Sidebar
Adding Deprecation warning for Scene Control
Filtering properties feature
Removing price as property

## 1.12.1
Added popup text informing (first-time) users to be patient

## 1.12.0
Allow Revitalization on non-scene sheets (from sheet title bar)
Some improvements to cloning speed
Changes in notes
Changes to null-handling for JSON strings

## 1.11.0
Special properties handling for icons, names, and types
Bugfix: Result sorting suffered from old refactor

## 1.10.0
Adding trigger to Character sheets removing Scene Control button for non-GM
New RE properties: AdjustStrike, LoseHitPoints, ChangeDegreeOfSuccess
Bugfix: new layer for Scene Control button. Issue caused incompatabilities with other modules using the same "controls" layer

## 1.9.0
New significant properties
  Feat: onlyLevel1, maxTakable, selfEffect

## 1.8.0
New RE property: removeAfterRoll
Added descriptor for why Revitalizer is disabled
Improvements to Differentiation calc
Slug changes have note added. Remaster will likely cause a few of these
Better null-handling when cloning Items causing fewer false positives

## 1.7.0
Adding "Revitalize" button to reset listed keys from Compendium Item (use at own discression)
Actor selection now in alphabetical order

## 1.6.0
Adding "Toggle all" for faster actor selection
Adding simple handling for User ignore list

## 1.5.x
Testing Foundry VTT module handling capabilities

## 1.5.0
Remove false positives from default values

## 1.4.0
Rule Elements: ActiveEffect, Crafting, Aura
Using Template files for Dialog HTML renders (less error prone)
Ignore Infused Items
Separate shallow clone logic per Item type (weapon has "level", but feat doesn't)

## 1.3.0
New setting: use RE array length
New Rule Elements: Strike, ChoiceSet

## 1.2.0
Reducing false positive: PF2e devs rewrote Item references from e.g.
    @Compendium[pf2e.spell-effects.lyLMiauxIVUM3oF1] -> @Compendium[pf2e.spell-effects.Item.lyLMiauxIVUM3oF1]
    As long as the Items are the same, this module should ignore it

## 1.1.0
New Rule Elements: basics

## 1.0.0
Bigfix: prevent multiple selections as once
Adjusted wording in Settings

## 0.11.0
Adding checkboxes for actor selection
Debug settings
Scrapped loading dialog in favor of ui-notifications

## 0.10.0
Rewritten to use classes
Better handling of templates

## 0.9.0
Adding different handling for GMs and Users
Adding multiple selections for GMs

## 0.8.0
Adding Scene Control Group
Separation of All Actors and Character tokens

## 0.7.0
Adding Scene Control button
Revitalizer class added, with embedded HTML

## 0.6.1
Adjustments to the publisher script

## 0.6.0
Showing simple content while PIR is calculating

## 0.5.0
Handling of false positives, wands, scrolls, cantrip-decks
Adding notes on Bestiary abilities