import { CharacterData, Item } from './types';

export const CHARACTERS: CharacterData[] = [
  {
    id: 'c1', name: 'Knight Sergio', title: 'ROGUE', element: 'Water', rarity: 3, level: 1, maxLevel: 40, exp: 0, maxExp: 15, cost: 5,
    baseStats: { hp: 2050, atk: 600, def: 600, rec: 580 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0) hue-rotate(0deg)',
    skills: [
      { id: 'sk1', type: 'LEADER SKILL', title: 'Water Power', description: '10% boost to Atk Power of Water types', iconType: 'Flag', level: 1, maxLevel: 5, upgradeCost: 1000 },
      { id: 'sk2', type: 'BRAVE BURST', title: 'Aqua Slash', description: '5 combo Water powerful attack on single Enemy', cost: 18, iconType: 'Sparkles', level: 1, maxLevel: 10, upgradeCost: 1500 }
    ]
  },
  {
    id: 'c2', name: 'Vargas', title: 'SWORDSMAN', element: 'Fire', rarity: 4, level: 12, maxLevel: 40, exp: 120, maxExp: 450, cost: 8,
    baseStats: { hp: 2400, atk: 850, def: 550, rec: 400 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.5) saturate(2) hue-rotate(-50deg)',
    skills: [
      { id: 'sk1', type: 'LEADER SKILL', title: 'Fire Power', description: '15% boost to Atk Power of Fire types', iconType: 'Flag', level: 2, maxLevel: 5, upgradeCost: 2000 },
      { id: 'sk2', type: 'BRAVE BURST', title: 'Flare Ride', description: '8 combo Fire elemental attack on all Enemies', cost: 22, iconType: 'Sparkles', level: 4, maxLevel: 10, upgradeCost: 3500 }
    ]
  },
  {
    id: 'c3', name: 'Lance', title: 'PIKEMAN', element: 'Earth', rarity: 3, level: 25, maxLevel: 40, exp: 800, maxExp: 1200, cost: 6,
    baseStats: { hp: 3100, atk: 550, def: 800, rec: 350 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.5) saturate(1.5) hue-rotate(80deg)',
    skills: [
      { id: 'sk1', type: 'LEADER SKILL', title: 'Earth Power', description: '10% boost to HP of Earth types', iconType: 'Flag', level: 3, maxLevel: 5, upgradeCost: 3000 },
      { id: 'sk2', type: 'BRAVE BURST', title: 'Tremor Strike', description: '6 combo Earth attack on all Enemies', cost: 20, iconType: 'Sparkles', level: 1, maxLevel: 10, upgradeCost: 1500 }
    ]
  },
  {
    id: 'c4', name: 'Magress', title: 'KNIGHT', element: 'Dark', rarity: 5, level: 30, maxLevel: 60, exp: 4500, maxExp: 5000, cost: 12,
    baseStats: { hp: 4200, atk: 900, def: 950, rec: 200 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.8) hue-rotate(220deg) saturate(0.5) brightness(0.8)',
    skills: [
      { id: 'sk1', type: 'LEADER SKILL', title: 'Dark Aegis', description: '15% boost to Def of Dark types', iconType: 'Flag', level: 5, maxLevel: 5, upgradeCost: 5000 },
      { id: 'sk2', type: 'BRAVE BURST', title: 'Void Cleave', description: '7 combo Dark attack on all Enemies', cost: 24, iconType: 'Sparkles', level: 8, maxLevel: 10, upgradeCost: 6000 },
      { id: 'sk3', type: 'EXTRA SKILL', title: 'Shadow Veil', description: '20% boost to all parameters when equipped with specific Sphere', iconType: 'Sword', level: 1, maxLevel: 1, upgradeCost: 10000 }
    ]
  },
  {
    id: 'c5', name: 'Eze', title: 'THUNDER GOD', element: 'Thunder', rarity: 6, level: 45, maxLevel: 80, exp: 8000, maxExp: 12000, cost: 15,
    baseStats: { hp: 4500, atk: 1200, def: 800, rec: 600 },
    spriteUrl: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png',
    cssFilter: 'sepia(0.2) saturate(2) hue-rotate(20deg) brightness(1.2)',
    skills: [
      { id: 'sk1', type: 'LEADER SKILL', title: 'Thunder God Power', description: '25% boost to Atk Power and 10% boost to HP of Thunder types', iconType: 'Flag', level: 4, maxLevel: 5, upgradeCost: 4000 },
      { id: 'sk2', type: 'BRAVE BURST', title: 'Lightning Storm', description: '12 combo Thunder attack on all Enemies', cost: 30, iconType: 'Sparkles', level: 10, maxLevel: 10, upgradeCost: 8000 }
    ]
  }
];

export const INVENTORY: Item[] = [
  {
    id: 'w1', name: 'Brave Sword', type: 'Weapon', rarity: 3, description: 'A standard sword assigned to brave warriors.',
    stats: { hp: 0, atk: 120, def: 0, rec: 0 },
    sprite: { col: 2, row: 0, className: "drop-shadow-[0_2px_4px_#111]" },
    effects: ['10% chance to ignore enemy DEF']
  },
  {
    id: 'w2', name: 'Flame Dagger', type: 'Weapon', rarity: 4, description: 'A dagger imbued with fire magic.',
    stats: { hp: 0, atk: 250, def: 0, rec: 50 },
    sprite: { col: 0, row: 2, className: "drop-shadow-[0_2px_4px_#311]" },
    effects: ['Adds Fire element to attack', '15% boost to Spark damage']
  },
  {
    id: 'a1', name: 'Knight Shield', type: 'Armor', rarity: 3, description: 'Sturdy iron shield.',
    stats: { hp: 200, atk: 0, def: 150, rec: 0 },
    sprite: { col: 3, row: 0, className: "drop-shadow-[0_2px_4px_#111]" },
    effects: ['Reduces damage taken by 5%']
  },
  {
    id: 'a2', name: 'Aura Plate', type: 'Armor', rarity: 5, description: 'Legendary plate glowing with aura.',
    stats: { hp: 500, atk: 0, def: 400, rec: 100 },
    sprite: { col: 1, row: 1, className: "drop-shadow-[0_2px_4px_#111]" },
    effects: ['Negates all status ailments', 'Restores HP each turn']
  },
  {
    id: 'ac1', name: 'Hero Ring', type: 'Accessory', rarity: 4, description: 'Boosts all stats slightly.',
    stats: { hp: 100, atk: 50, def: 50, rec: 50 },
    sprite: { col: 0, row: 1, className: "drop-shadow-[0_2px_4px_#111]" }
  },
  {
    id: 'ac2', name: 'Recovery Amulet', type: 'Accessory', rarity: 3, description: 'Enhances healing capability.',
    stats: { hp: 0, atk: 0, def: 0, rec: 300 },
    sprite: { col: 1, row: 0, className: "drop-shadow-[0_2px_4px_#111]" },
    effects: ['Boosts BC & HC drop rate by 10%']
  }
];

export const SQUAD_MOCK = [
  { name: 'Trueno Eze', element: 'Thunder', hp: 2511, maxHp: 2511, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0.2) saturate(2) hue-rotate(20deg)' },
  { name: 'Elimo', element: 'Water', hp: 2465, maxHp: 2465, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0) hue-rotate(0deg)' },
  { name: 'Shida', element: 'Dark', hp: 2930, maxHp: 2930, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0.8) hue-rotate(220deg) saturate(0.5)' },
  { name: 'Dios Douglas', element: 'Earth', hp: 3986, maxHp: 3986, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0.5) saturate(1.5) hue-rotate(80deg)' },
  { name: 'Inventora Elulu', element: 'Thunder', hp: 2677, maxHp: 2677, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0.2) saturate(2) hue-rotate(20deg) brightness(1.2)' },
  { name: 'Puntería Lario', element: 'Earth', hp: 2670, maxHp: 2670, portrait: 'https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png', tint: 'sepia(0.5) saturate(1.5) hue-rotate(80deg) brightness(1.2)' },
];

export const ITEMS_MOCK = [
  { count: 10, name: 'Antídoto', sprite: {col: 1, row: 3} },
  { count: 10, name: 'Cura', sprite: {col: 2, row: 1} },
  { count: 10, name: 'Agua sagrada', sprite: {col: 3, row: 1} },
  { count: 3, name: 'Flauta Ares', sprite: {col: 2, row: 2} },
  { count: 1, name: 'Reanimador', sprite: {col: 2, row: 3} }
];
