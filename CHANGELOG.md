# Changelog

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