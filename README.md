# pf2e-item-revitalizer
Module for handling Item obsolesence after PF2e system updates.
This module performs a likeness check between Items in the PF2e Compendium and the corresponding items (copies) on the Actors in your game.
It compares certain properties of the items and identifies any differences or changes.

## Installation
Add `https://raw.githubusercontent.com/robinsving/pf2e-item-revitalizer/main/module.json` or locate the **PF2e Item Revitalizer** in the modules menu

## Usage

### From the Actor Sheet
1. Open up an Actor Sheet
2. Click the Revitalize link in the top bar

<img src="assets/pir-sheet-title.png"/>

### From the Scene Controls
1. Open your game in Foundry VTT
2. Navigate to the desired Scene where you want to perform the compatibility check
3. Click the pf2e-item-revitalizer icon (<img src="assets/pir-main-icon.png" width="24"/>) in the Scene Control buttons and choose which selection mode to use (all, characters only)
4. Select Actors *from the current scene*

https://github.com/robinsving/pf2e-item-revitalizer/assets/3072502/f29a9951-07cc-44e8-aad9-6d863e8f3df9

## Features

### Check Items
- Runs a comparison of the Items added to an Actor with the Compendium versions
- Highlights any properties that differ between the Items
- Provides links to easily access the Compendium and Actor Items for further inspection
- Button menu to select further options
  - Performs an Item update ([see below](#automatic-item-updates)) with the **Revitalizer button**
  - Hides Items on future runs with the **Hide button**
  - Removes Items with the **Checkmark button**

<img src="assets/pir-check-results.png"/>

### Automatic Item updates
- Perform an update of an old copy by clicking the Revitalize button when you see the check results
- Handles many changes, but prevents updating of properties (e.g. Rule Engine changes) or item-types (e.g. class) that may cause issues (use manual update for these)

### Player mode
- GMs can toggle this in Settings
- Allows your players to use this mod [from the Actor Sheet title bar](#from-the-actor-sheet)
- Actor ownership is required to use the feature

## Compatibility
This module is designed for use with the PF2e system in Foundry VTT. It is not compatible with other game systems on Foundry VTT

## Issues

## Reporting issues
If you discover any issues with this module, please create an issue in the Github repo

### Common issues looking like false positives
1. Updates of PF2e icon names Description, e.g. action-glyph are not visible without the debugger
2. Updates of inline rolls, usually from [/r 1d6] to @Damage[1d6] are not visible without the debugger
3. Updates of Item images ("icon-link") to higher quality images are not always easy to spot
4. PF2e sometimes adds values to null-data when an Item is copied to an Actor

### Using debug mode to find issues
- Turn on debug mode in the Settings
- Start the Revitalizer for an Actor
- Check the console.log for the reason an Item ended up where it did
  - Filter the log by the Item slug (name) and you will get both the Actor Item's property and the Origin Items property
- Compare these and to see any differences


## License
This module is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information

## Acknowledgements
This module was created by Robin Sving. If you have any questions, please reach out to me on Github