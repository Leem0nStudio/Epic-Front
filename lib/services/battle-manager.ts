import { CombatUnit, CombatState, SkillDefinition, TargetType } from '../types/combat';
import { EffectEngine, EffectResult } from './effect-engine';

export class BattleManager {
  /**
   * Calculates the turn order based on Agility (agi).
   * Units with higher agi go first.
   */
  static getTurnOrder(units: CombatUnit[]): CombatUnit[] {
    return [...units]
      .filter(u => !u.isDead)
      .sort((a, b) => b.stats.agi - a.stats.agi);
  }

  /**
   * Finds the best target(s) based on the targeting rules.
   * Logic:
   * 1. Check for Taunt (global)
   * 2. Target must pass Front Row if they are targeting Back Row (unless Ranged/Magic)
   */
  static getTargets(
    actor: CombatUnit,
    skill: SkillDefinition,
    allUnits: CombatUnit[],
    manualTargetId?: string
  ): CombatUnit[] {
    const enemies = allUnits.filter(u => u.side !== actor.side && !u.isDead);
    const allies = allUnits.filter(u => u.side === actor.side && !u.isDead);

    // Primary target logic for single target effects
    const getPrimaryEnemy = () => {
      // 1. Manual override
      if (manualTargetId) {
        const manual = enemies.find(e => e.id === manualTargetId);
        if (manual) return manual;
      }

      // 2. Check for Taunt
      const taunters = enemies.filter(e => e.statusEffects.some(s => s.id === 'taunt'));
      if (taunters.length > 0) {
        return taunters[Math.floor(Math.random() * taunters.length)];
      }

      // 3. Row logic: Back row units can only be targeted if front row is empty
      // EXCEPT if the skill is ranged/magic or the actor is ranged.
      // (For this BF-style demo, let's keep it simple: Front Row is priority for Melee)
      const frontRow = enemies.filter(e => e.row === 'front');
      const targetPool = frontRow.length > 0 ? frontRow : enemies;

      // 4. Fallback: Lowest HP%
      return [...targetPool].sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
    };

    const firstEffect = skill.effects[0];
    if (!firstEffect) return [];

    switch (firstEffect.target) {
      case 'self':
        return [actor];
      case 'enemy':
      case 'random_enemy':
        const target = getPrimaryEnemy();
        return target ? [target] : [];
      case 'all_enemies':
        return enemies;
      case 'all_allies':
        return allies;
      case 'ally':
        return allies.filter(a => a.id !== actor.id).slice(0, 1);
      default:
        return [];
    }
  }

  /**
   * Processes a full turn for a unit using a specific skill.
   * When isBurst is true, applies 1.5x damage multiplier and resets burst to 0.
   */
  static executeTurn(
    actor: CombatUnit,
    skill: SkillDefinition,
    allUnits: CombatUnit[],
    manualTargetId?: string,
    isBurst: boolean = false
  ): { results: EffectResult[], updatedUnits: CombatUnit[] } {
    const targets = this.getTargets(actor, skill, allUnits, manualTargetId);
    const results = EffectEngine.processSkill(skill, actor, targets);

    // Create a new state of units based on results
    let updatedUnits = allUnits.map(u => ({
      ...u,
      statusEffects: [...u.statusEffects],
      cooldowns: { ...u.cooldowns }
    }));

    const actorInState = updatedUnits.find(u => u.id === actor.id);

    // Set cooldown
    if (actorInState && skill.cooldown > 0) {
      actorInState.cooldowns[skill.id] = skill.cooldown;
    }

    // Apply burst effect: 1.5x damage multiplier, reset burst to 0
    if (isBurst && actorInState) {
      actorInState.burst = 0;
    }

    for (const result of results) {
      const target = updatedUnits.find(u => u.id === result.targetId);
      if (!target) continue;

      // Apply burst damage multiplier
      if (isBurst && result.type === 'damage' && result.value) {
        result.value = Math.floor(result.value * 1.5);
      }

      if (result.type === 'damage' && result.value) {
        target.currentHp = Math.max(0, target.currentHp - result.value);
        if (target.currentHp <= 0) target.isDead = true;

        // Burst Charging: Damage dealt adds 10%, damage taken adds 5%
        if (actorInState) actorInState.burst = Math.min(100, actorInState.burst + 10);
        target.burst = Math.min(100, target.burst + 5);
      } else if (result.type === 'heal' && result.value) {
        target.currentHp = Math.min(target.maxHp, target.currentHp + result.value);
      } else if (result.status) {
        if (result.type === 'taunt') {
           if (actorInState) {
             actorInState.statusEffects.push(result.status);
             actorInState.isTaunting = true;
           }
        } else {
           target.statusEffects.push(result.status);
        }
      }
    }

    // Flat turn gain (only if not burst, burst already resets to 0)
    if (!isBurst && actorInState) actorInState.burst = Math.min(100, actorInState.burst + 5);

    return { results, updatedUnits };
  }

  /**
   * Updates status effects and cooldowns for a unit.
   */
  static updateUnitStartTurn(unit: CombatUnit): CombatUnit {
    const nextStatus = unit.statusEffects
      .map(s => ({ ...s, remainingTurns: s.remainingTurns - 1 }))
      .filter(s => s.remainingTurns > 0);

    const nextCooldowns = { ...unit.cooldowns };
    Object.keys(nextCooldowns).forEach(id => {
      nextCooldowns[id] = Math.max(0, nextCooldowns[id] - 1);
      if (nextCooldowns[id] === 0) delete nextCooldowns[id];
    });

    return {
      ...unit,
      statusEffects: nextStatus,
      cooldowns: nextCooldowns,
      isTaunting: nextStatus.some(s => s.id === 'taunt')
    };
  }
}
