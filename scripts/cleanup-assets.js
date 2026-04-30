const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\User\\Desktop\\bruno\\MIS REPOS\\epic-front\\Epic-Front\\public\\assets';

// 1. Remove duplicate backgrounds/ folder (keep bg/)
const bgDir = path.join(root, 'bg');
const backgroundsDir = path.join(root, 'backgrounds');

if (fs.existsSync(backgroundsDir)) {
  const files = fs.readdirSync(backgroundsDir);
  files.forEach(f => {
    if (f === '.gitkeep') return;
    const src = path.join(backgroundsDir, f);
    const dest = path.join(bgDir, f.toLowerCase().replace(/ /g, '_'));
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log('Copied: ' + f + ' -> ' + path.basename(dest));
    } else {
      console.log('Skipped (exists): ' + f);
    }
  });
  fs.rmSync(backgroundsDir, { recursive: true, force: true });
  console.log('Removed duplicate backgrounds/ folder');
}

// 2. Rename UI assets to follow convention: ui_[name]_[size].[ext]
const uiDir = path.join(root, 'ui');
if (fs.existsSync(uiDir)) {
  const renames = [
    ['baphometh.png', 'ui_baphomet_256.png'],
    ['Icon_archer.png', 'ui_archer_64.png'],
    ['Icon_mage.png', 'ui_mage_64.png'],
    ['Icon_novice.png', 'ui_novice_64.png'],
    ['icon_knight.png', 'ui_knight_64.png'],
    ['icon_priest.png', 'ui_priest_64.png'],
    ['icon_swordman.png', 'ui_swordman_64.png'],
    ['icon_wizard.png', 'ui_wizard_64.png'],
    ['card_banshee.png', 'ui_card_banshee_256.png'],
    ['card_goblin.png', 'ui_card_goblin_256.png'],
    ['card_lamia_queen.png', 'ui_card_lamia_queen_256.png'],
    ['card_zombie.png', 'ui_card_zombie_256.png'],
    ['panel-000.png', 'ui_panel_000_128.png'],
    ['panel-007.png', 'ui_panel_007_128.png'],
    ['panel-008.png', 'ui_panel_008_128.png'],
    ['panel-009.png', 'ui_panel_009_128.png'],
    ['panel-021.png', 'ui_panel_021_128.png'],
    ['panel-border-000.png', 'ui_panel_border_000_128.png'],
    ['panel-border-001.png', 'ui_panel_border_001_128.png'],
    ['panel-border-002.png', 'ui_panel_border_002_128.png'],
    ['panel-border-010.png', 'ui_panel_border_010_128.png'],
    ['panel-transparent-border-001.png', 'ui_panel_transparent_001_128.png'],
  ];

  renames.forEach(([oldName, newName]) => {
    const oldPath = path.join(uiDir, oldName);
    const newPath = path.join(uiDir, newName);
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log('Renamed: ' + oldName + ' -> ' + newName);
    }
  });
}

// 3. Rename sprite assets
const spriteDir = path.join(root, 'sprites');
if (fs.existsSync(spriteDir)) {
  const spriteRenames = [
    ['acolyte_idle.png', 'sprite_acolyte_idle_64.png'],
    ['archer_idle.png', 'sprite_archer_idle_64.png'],
    ['knight_idle.png', 'sprite_knight_idle_64.png'],
    ['mage_idle.png', 'sprite_mage_idle_64.png'],
    ['novice_idle.png', 'sprite_novice_idle_64.png'],
    ['priest_idle.png', 'sprite_priest_idle_64.png'],
    ['warrior_idle.png', 'sprite_warrior_idle_64.png'],
    ['wizard_idle.png', 'sprite_wizard_idle_64.png'],
  ];

  spriteRenames.forEach(([oldName, newName]) => {
    const oldPath = path.join(spriteDir, oldName);
    const newPath = path.join(spriteDir, newName);
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log('Renamed: ' + oldName + ' -> ' + newName);
    }
  });
}

// 4. Rename bg assets
if (fs.existsSync(bgDir)) {
  const bgRenames = [
    ['home_bg.png', 'bg_home_1920.jpg'],
    ['partybg.png', 'bg_party_1920.jpg'],
    ['battle_bg_party.png', 'bg_battle_party_1920.jpg'],
    ['battle_scenic.png', 'bg_battle_scenic_1920.jpg'],
  ];

  bgRenames.forEach(([oldName, newName]) => {
    const oldPath = path.join(bgDir, oldName);
    const newPath = path.join(bgDir, newName);
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log('Renamed: ' + oldName + ' -> ' + newName);
    }
  });
}

console.log('Asset cleanup complete!');
