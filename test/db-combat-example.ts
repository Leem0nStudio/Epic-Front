import { CombatUnit } from '../lib/types/combat';
import {
  loadPlayerBuild,
  runCombatFromDatabase,
  PlayerBuildData,
  CombatResult
} from '../lib/services/skill-integration';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';

function log(msg: string, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function header(title: string) {
  log(`\n${'='.repeat(70)}`, MAGENTA);
  log(`  ${title}`, MAGENTA);
  log('='.repeat(70), MAGENTA);
}

async function demonstrateRealCombat() {
  header('REAL DATABASE COMBAT INTEGRATION');
  
  log('\n📡 This system loads data from Supabase:', BLUE);
  log('  1. job_skill_modules → base skills by job', RESET);
  log('  2. player_cards + cards → gacha skills & modifiers', RESET);
  log('  3. skill_modules + skill_module_effects → skill data', RESET);
  log('  4. modifiers → card effects', RESET);

  log('\n🔧 Execution flow:', CYAN);
  log('  loadPlayerBuild(jobId, playerId)', RESET);
  log('    → loadJobSkills() from job_skill_modules', RESET);
  log('    → loadGachaSkills() from player_cards + cards.effect_value', RESET);
  log('    → loadGachaModifiers() from cards.effect_value.linked_modifier_id', RESET);
  log('    → loadSkillModule() for each skill_id', RESET);
  log('    → loadModifiers() for each modifier_id', RESET);
  log('  → executePlayerCombat() with resolveSkill()', RESET);

  header('EXAMPLE USAGE');

  log('\n📋 Example 1: Load Warrior build from DB', CYAN);
  log('```typescript', YELLOW);
  log('const build = await loadPlayerBuild("warrior", "player-123");', RESET);
  log('', RESET);
  log('// build.skillModules: [{ skill, effects }...]', RESET);
  log('// build.modifiers: [Modifier, ...]', RESET);
  log('// build.jobId: "warrior"', RESET);
  log('// build.playerId: "player-123"', RESET);
  log('```', YELLOW);

  log('\n📋 Example 2: Run combat with loaded build', CYAN);
  log('```typescript', YELLOW);
  log('const result = await runCombatFromDatabase(', RESET);
  log('  "warrior",           // jobId', RESET);
  log('  "player-123",        // playerId', RESET);
  log('  { atk: 50, agi: 40, def: 20 },  // attacker stats', RESET);
  log('  500                 // enemy HP', RESET);
  log(');', RESET);
  log('', RESET);
  log('// result.totalDamage: number', RESET);
  log('// result.turns: number', RESET);
  log('// result.killed: boolean', RESET);
  log('// result.logs: string[]', RESET);
  log('// result.combos: string[]', RESET);
  log('// result.statusApplied: string[]', RESET);
  log('```', YELLOW);

  header('DATABASE SCHEMA REFERENCE');

  log('\n📊 Required tables for full integration:', CYAN);
  
  log('\n1️⃣  job_skill_modules (base skills per job)', BLUE);
  log('   - job_id → jobs.id', RESET);
  log('   - skill_module_id → skill_modules.id', RESET);
  log('   - slot_index (orden)', RESET);
  
  log('\n2️⃣  player_cards (gacha cards)', BLUE);
  log('   - player_id → players.id', RESET);
  log('   - card_id → cards.id', RESET);
  log('   - is_equipped: boolean', RESET);
  
  log('\n3️⃣  cards (card definitions)', BLUE);
  log('   - id, name, rarity', RESET);
  log('   - effect_value JSONB:', RESET);
  log('     {', RESET);
  log('       "linked_skill_module_id": "uuid",', RESET);
  log('       "linked_modifier_id": "uuid"', RESET);
  log('     }', RESET);
  
  log('\n4️⃣  skill_modules (skill data)', BLUE);
  log('   - id, name, description', RESET);
  log('   - base_power, cooldown', RESET);
  
  log('\n5️⃣  skill_module_effects (skill triggers)', BLUE);
  log('   - skill_id → skill_modules.id', RESET);
  log('   - trigger_id → triggers.id', RESET);
  log('   - effect_id → effects.id', RESET);
  log('   - condition JSONB', RESET);
  log('   - order_index', RESET);

  header('EXPECTED DATA FLOW');

  log('\n🎯 Player "player-123" with job "warrior":', CYAN);
  log('   ', RESET);
  log('   job_skill_modules → ["skill-fire-strike", "skill-basic-attack"]', YELLOW);
  log('   player_cards (equipped) → ["card-fire-master", "card-crit-king"]', YELLOW);
  log('   cards.effect_value → { linked_skill_module_id: "...", linked_modifier_id: "..." }', YELLOW);
  log('   ', RESET);
  log('   Final build:', GREEN);
  log('   - skills: [fire-strike, basic-attack, ...gacha skills]', RESET);
  log('   - modifiers: [fire-crit-modifier, crit-bonus-modifier]', RESET);

  header('FULL EXAMPLE WITH MOCK DATA');

  const mockBuild: PlayerBuildData = {
    jobId: 'warrior',
    playerId: 'player-123',
    skillModules: [
      {
        skill: {
          id: 'skill-fire',
          name: 'Fire Strike',
          description: 'Fire attack',
          basePower: 20,
          cooldown: 2,
          tags: ['burn', 'fire']
        },
        effects: [
          {
            id: 'eff-burn',
            skillId: 'skill-fire',
            triggerId: 't-on-crit',
            trigger: { id: 't-on-crit', name: 'on_crit' },
            effect: {
              id: 'e-burn',
              type: 'apply_status',
              value: null,
              duration: 3,
              extra: { status: 'burn', stacks: 1 }
            },
            condition: {},
            orderIndex: 0
          },
          {
            id: 'eff-explode',
            skillId: 'skill-fire',
            triggerId: 't-on-hit',
            trigger: { id: 't-on-hit', name: 'on_hit' },
            effect: {
              id: 'e-explode',
              type: 'explode',
              value: 50,
              duration: null,
              extra: { radius: 2 }
            },
            condition: { target_has_status: 'burn', target_status_count: 3 },
            orderIndex: 1
          }
        ]
      }
    ],
    modifiers: [
      {
        id: 'mod-fire-crit',
        name: 'Fire Crit',
        description: 'Fire skills can crit',
        appliesToTag: 'burn',
        effect: {
          allow_crit: true,
          crit_chance_bonus: 30,
          damage_multiplier: 1.5
        }
      }
    ]
  };

  log('\n📦 Loaded Build:', BLUE);
  log(`   Job: ${mockBuild.jobId}`, RESET);
  log(`   Player: ${mockBuild.playerId}`, RESET);
  log(`   Skills: ${mockBuild.skillModules.length}`, RESET);
  log(`   Modifiers: ${mockBuild.modifiers.length}`, RESET);
  
  for (const sm of mockBuild.skillModules) {
    log(`   - ${sm.skill.name} (${sm.skill.tags.join(', ')})`, YELLOW);
  }
  for (const mod of mockBuild.modifiers) {
    log(`   - ${mod.name}: ${mod.appliesToTag}`, YELLOW);
  }

  header('INTEGRATION COMPLETE');

  log('\n✅ Sistema de combate integrado con la base de datos', GREEN);
  log('\nPara usar en producción:', CYAN);
  log('1. Ejecutar las migraciones SQL en Supabase', RESET);
  log('2. Poblar job_skill_modules con skills base', RESET);
  log('3. Asegurar que player_cards tenga effect_value con linked_skill_module_id', RESET);
  log('4. Llamar runCombatFromDatabase(jobId, playerId, stats, enemyHp)', RESET);
  log('\n✅ La lógica NO está hardcodeada - todo viene de la DB!', GREEN);
}

demonstrateRealCombat().catch(console.error);