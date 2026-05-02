import { CombatUnit, StatusEffect as CombatStatusEffect, EffectType } from '../types/combat';

export type EventType = 'on_hit' | 'on_crit' | 'on_kill' | 'on_skill_use' | 'on_damage_taken' | 'on_death' | 'turn_start' | 'turn_end';

export interface Skill {
  id: string;
  name: string;
  description: string;
  basePower: number;
  cooldown: number;
  tags: string[];
}

export interface Effect {
  id: string;
  type: string;
  value: number | null;
  duration: number | null;
  extra: Record<string, unknown>;
}

export interface Trigger {
  id: string;
  name: EventType;
}

export interface SkillEffect {
  id: string;
  skillId: string;
  triggerId: string;
  trigger: Trigger;
  effect: Effect;
  condition: Record<string, unknown>;
  orderIndex: number;
}

export interface Condition {
  target_has_status?: string;
  target_status_count?: number;
  stacks_gte?: number;
  source_has_status?: string;
  source_status_count?: number;
  after_effect_id?: string;
  before_effect_id?: string;
  has_shield?: boolean;
  health_below_pct?: number;
}

export interface EffectExecutionContext {
  source: CombatUnit;
  target: CombatUnit;
  skill: Skill;
  event: EventType;
  isCrit: boolean;
  killedTarget: boolean;
  previousEffects: EffectResult[];
  executionOrder: number;
}

export interface EffectResult {
  targetId: string;
  type: string;
  value?: number;
  status?: CombatStatusEffect;
  targets?: string[];
  log: string;
  effectId?: string;
  consumedStatuses?: string[];
}

export interface Modifier {
  id: string;
  name: string;
  description: string;
  appliesToTag: string;
  effect: ModifierEffectConfig;
}

export interface ModifierEffectConfig {
  allow_crit?: boolean;
  crit_chance_bonus?: number;
  damage_multiplier?: number;
  extend_duration?: number;
  duplicate_effects?: boolean;
  duplicate_on_crit?: boolean;
  new_effects?: Effect[];
  modify_value?: number;
  modify_condition?: Record<string, unknown>;
  add_trigger?: EventType;
  chain_effects?: ModifierChainEffect[];
}

export interface ModifierChainEffect {
  trigger: EventType;
  effect: Effect;
  condition?: Record<string, unknown>;
}

export interface AppliedModifiers {
  allowCrit: boolean;
  critChanceBonus: number;
  damageMultiplier: number;
  extendDuration: number;
  duplicateEffects: boolean;
  duplicateOnCrit: boolean;
  newEffects: Effect[];
  modifyValue: number;
  modifyCondition: Record<string, unknown> | null;
  chainEffects: { trigger: EventType; effect: Effect; condition?: Record<string, unknown> }[];
}

export function modifyEffect(
  effect: Effect,
  modifier: Modifier
): Effect {
  const config = modifier.effect;
  const modified = { ...effect };

  if (config.modify_value !== undefined && modified.value !== null) {
    modified.value = Math.floor(modified.value * (1 + config.modify_value / 100));
  }

  if (config.damage_multiplier && modified.value !== null) {
    modified.value = Math.floor(modified.value * config.damage_multiplier);
  }

  if (config.extend_duration && modified.extra) {
    modified.extra = {
      ...modified.extra,
      duration: (modified.extra.duration as number || 3) + config.extend_duration
    };
  }

  if (config.new_effects) {
    const existingExtra = modified.extra as Record<string, unknown> || {};
    modified.extra = {
      ...existingExtra,
      _modifier_effects: [...(existingExtra._modifier_effects as Effect[] || []), ...config.new_effects]
    };
  }

  return modified;
}

export function modifyCondition(
  condition: Record<string, unknown>,
  modifier: Modifier
): Record<string, unknown> {
  const config = modifier.effect;
  
  if (!config.modify_condition) {
    return condition;
  }

  return {
    ...condition,
    ...config.modify_condition
  };
}

export class StatusSystem {
  private static instance: Map<string, Map<string, CombatStatusEffect>> = new Map();

  static addStatus(
    unitId: string,
    status: Omit<CombatStatusEffect, 'id'> & { stacks?: number }
  ): CombatStatusEffect {
    let unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) {
      unitStatuses = new Map();
      this.instance.set(unitId, unitStatuses);
    }

    const statusId = `${status.name}_${unitId}_${Date.now()}`;
    const newStatus: CombatStatusEffect = {
      ...status,
      id: statusId,
      remainingTurns: status.duration
    };

    const existing = unitStatuses.get(status.name);
    if (existing) {
      existing.remainingTurns = status.duration;
      const existingStacks = (existing as { stacks?: number }).stacks || 0;
      const newStacks = (status as { stacks?: number }).stacks || 1;
      (existing as { stacks?: number }).stacks = existingStacks + newStacks;
      return existing;
    }

    unitStatuses.set(status.name, newStatus);
    return newStatus;
  }

  static getStacks(unitId: string, statusName: string): number {
    const unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) return 0;
    
    const status = unitStatuses.get(statusName);
    if (!status) return 0;
    
    return (status as { stacks?: number }).stacks || 1;
  }

  static hasStatus(unitId: string, statusName: string): boolean {
    const unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) return false;
    return unitStatuses.has(statusName);
  }

  static getAllStatuses(unitId: string): CombatStatusEffect[] {
    const unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) return [];
    return Array.from(unitStatuses.values());
  }

  static tickDown(unitId: string): void {
    const unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) return;

    for (const [name, status] of unitStatuses) {
      status.remainingTurns -= 1;
      if (status.remainingTurns <= 0) {
        unitStatuses.delete(name);
      }
    }
  }

  static clear(unitId: string): void {
    this.instance.delete(unitId);
  }

  static consumeStatus(unitId: string, statusName: string): number {
    const unitStatuses = this.instance.get(unitId);
    if (!unitStatuses) return 0;

    const status = unitStatuses.get(statusName);
    if (!status) return 0;

    const stacks = (status as { stacks?: number }).stacks || 1;
    unitStatuses.delete(statusName);
    return stacks;
  }

  static clearAll(): void {
    this.instance.clear();
  }
}

export function checkCondition(
  condition: Condition,
  context: EffectExecutionContext
): boolean {
  if (!condition || Object.keys(condition).length === 0) {
    return true;
  }

  if (condition.target_has_status) {
    if (!StatusSystem.hasStatus(context.target.id, condition.target_has_status)) {
      return false;
    }
    if (condition.target_status_count !== undefined) {
      const stacks = StatusSystem.getStacks(context.target.id, condition.target_has_status);
      if (stacks < condition.target_status_count) {
        return false;
      }
    }
  }

  if (condition.stacks_gte !== undefined) {
    const stacks = StatusSystem.getStacks(context.target.id, context.target.id);
    if (stacks < condition.stacks_gte) {
      return false;
    }
  }

  if (condition.source_has_status) {
    if (!StatusSystem.hasStatus(context.source.id, condition.source_has_status)) {
      return false;
    }
    if (condition.source_status_count !== undefined) {
      const stacks = StatusSystem.getStacks(context.source.id, condition.source_has_status);
      if (stacks < condition.source_status_count) {
        return false;
      }
    }
  }

  if (condition.after_effect_id) {
    const hasExecuted = context.previousEffects.some(e => e.effectId === condition.after_effect_id);
    if (!hasExecuted) return false;
  }

  if (condition.before_effect_id) {
    const hasNotExecuted = !context.previousEffects.some(e => e.effectId === condition.before_effect_id);
    if (hasNotExecuted) return false;
  }

  if (condition.has_shield !== undefined) {
    const hasShield = StatusSystem.hasStatus(context.source.id, 'shield');
    if (condition.has_shield !== hasShield) return false;
  }

  if (condition.health_below_pct !== undefined) {
    const healthPct = (context.target.currentHp / context.target.maxHp) * 100;
    if (healthPct >= condition.health_below_pct) return false;
  }

  return true;
}

export function applyEffect(
  effect: Effect,
  context: EffectExecutionContext,
  modifiers?: AppliedModifiers
): EffectResult {
  const { source, target } = context;
  const applied = modifiers || {
    allowCrit: false,
    critChanceBonus: 0,
    damageMultiplier: 1,
    extendDuration: 0,
    duplicateEffects: false,
    duplicateOnCrit: false,
    newEffects: [],
    modifyValue: 0,
    modifyCondition: null,
    chainEffects: []
  };

  const effectiveValue = (() => {
    let val = effect.value;
    if (val !== null && applied.damageMultiplier !== 1) {
      val = Math.floor(val * applied.damageMultiplier);
    }
    if (val !== null && applied.modifyValue !== 0) {
      val = Math.floor(val * (1 + applied.modifyValue / 100));
    }
    return val;
  })();

  switch (effect.type) {
    case 'apply_status': {
      const statusName = effect.extra?.status as string || 'unknown';
      let duration = effect.extra?.duration as number || 3;
      const stacks = effect.extra?.stacks as number || 1;
      duration += applied.extendDuration;
      
      const status = StatusSystem.addStatus(target.id, {
        name: statusName,
        type: 'debuff',
        duration,
        remainingTurns: duration,
        appliedById: source.id,
        stacks
      } as unknown as Omit<CombatStatusEffect, 'id'>);

      return {
        targetId: target.id,
        type: 'apply_status',
        status,
        effectId: effect.id,
        log: `${target.name} recibe ${statusName} (${duration} turnos, ${stacks} stack${stacks > 1 ? 's' : ''})`
      };
    }

    case 'explode': {
      const baseDamage = effectiveValue || 50;
      const radius = effect.extra?.radius as number || 1;
      const ignoreDef = effect.extra?.ignore_def as boolean || false;
      
      const targetsInArea: string[] = [target.id];
      
      return {
        targetId: target.id,
        type: 'explode',
        value: baseDamage,
        targets: targetsInArea,
        effectId: effect.id,
        log: `${target.name} explota causando ${baseDamage} daño en área ${radius}${ignoreDef ? ' (ignora defensa)' : ''}`
      };
    }

    case 'chain_damage': {
      const baseDamage = effectiveValue || 20;
      const maxTargets = effect.extra?.max_targets as number || 3;
      const jumpRange = effect.extra?.jump_range as number || 100;
      const damageReduction = effect.extra?.damage_reduction as number || 0.5;
      const canCrit = effect.extra?.can_crit as boolean || false;

      const chainTargets: string[] = [target.id];
      let currentDamage = baseDamage;
      const chainLog: string[] = [];

      for (let i = 1; i < maxTargets; i++) {
        const reducedDamage = Math.floor(currentDamage * damageReduction);
        chainTargets.push(`chain_target_${i}`);
        chainLog.push(`${reducedDamage} damage`);
        currentDamage = reducedDamage;
      }

      return {
        targetId: target.id,
        type: 'chain_damage',
        value: baseDamage,
        targets: chainTargets,
        effectId: effect.id,
        log: `Chain hit ${maxTargets} targets: ${chainLog.join(' → ')}`
      };
    }

    case 'gain_shield': {
      let shieldValue = effectiveValue || 20;
      const shieldType = effect.extra?.shield_type as string || 'physical';
      
      if (effect.extra?.scaling_stat) {
        const scalingStat = effect.extra.scaling_stat as keyof typeof source.stats;
        const multiplier = effect.extra.multiplier as number || 1.5;
        shieldValue = Math.floor((source.stats[scalingStat] || 0) * multiplier);
      }

      const status = StatusSystem.addStatus(source.id, {
        name: 'shield',
        type: 'buff',
        duration: effect.duration || 2,
        remainingTurns: effect.duration || 2,
        appliedById: source.id
      } as unknown as Omit<CombatStatusEffect, 'id'>);

      (status as { shieldValue?: number }).shieldValue = shieldValue;

      return {
        targetId: source.id,
        type: 'gain_shield',
        value: shieldValue,
        status,
        effectId: effect.id,
        log: `${source.name} obtiene ${shieldValue} shield (${shieldType})`
      };
    }

    case 'consume_status': {
      const statusToConsume = effect.extra?.status as string || 'poison';
      const consumedStacks = StatusSystem.consumeStatus(target.id, statusToConsume);
      
      if (consumedStacks === 0) {
        return {
          targetId: target.id,
          type: 'consume_status',
          effectId: effect.id,
          log: `No hay ${statusToConsume} para consumir`
        };
      }

      const damagePerStack = effect.extra?.damage_per_stack as number || 5;
      const totalDamage = damagePerStack * consumedStacks;
      
      const effectOnConsume = effect.extra?.effect as string;
      const logPrefix = `${statusToConsume} consumido (${consumedStacks} stacks)`;

      if (effectOnConsume === 'explode') {
        const radius = effect.extra?.radius as number || 2;
        return {
          targetId: target.id,
          type: 'consume_status',
          value: totalDamage,
          effectId: effect.id,
          consumedStatuses: [statusToConsume],
          log: `${logPrefix} → explota por ${totalDamage} daño (radio ${radius})`
        };
      }

      return {
        targetId: target.id,
        type: 'consume_status',
        value: totalDamage,
        effectId: effect.id,
        consumedStatuses: [statusToConsume],
        log: `${logPrefix} → ${totalDamage} daño`
      };
    }

    case 'repeat_skill': {
      const maxTimes = effect.value || 2;
      const chance = effect.extra?.chance as number || 1.0;
      const canRepeat = Math.random() < chance;
      
      if (!canRepeat) {
        return {
          targetId: target.id,
          type: 'repeat_skill',
          effectId: effect.id,
          log: `Skill no se repite (chance: ${chance * 100}%)`
        };
      }

      return {
        targetId: target.id,
        type: 'repeat_skill',
        value: maxTimes,
        effectId: effect.id,
        log: `Skill se repetirá ${maxTimes} vez${maxTimes > 1 ? 'es' : ''}`
      };
    }

    case 'modify_stat': {
      const stat = effect.extra?.stat as string || 'atk';
      const operation = effect.extra?.operation as string || 'add';
      const value = effect.extra?.value as number || 10;
      const isDebuff = effect.extra?.is_debuff as boolean || false;

      let statChange = '';
      let newValue = 0;

      if (operation === 'multiply') {
        newValue = Math.floor(value * (stat === 'crit_chance' ? 1 : (source.stats.atk || 100)));
        statChange = `${value * 100}%`;
      } else {
        newValue = value;
        statChange = `${value}`;
      }

      return {
        targetId: stat === 'all' ? source.id : target.id,
        type: 'modify_stat',
        value: newValue,
        effectId: effect.id,
        log: `${stat === 'all' ? source.name : target.name}: ${stat} ${operation} ${statChange}${isDebuff ? ' (debuff)' : ''}`
      };
    }

    case 'reduce_cooldown': {
      const reduction = effectiveValue || -1;
      return {
        targetId: source.id,
        type: 'reduce_cooldown',
        value: reduction,
        effectId: effect.id,
        log: `${source.name} reduce su cooldown en ${Math.abs(reduction)}`
      };
    }

    case 'damage_per_stack': {
      const statusToCheck = effect.extra?.status as string || 'poison';
      const stacks = StatusSystem.getStacks(target.id, statusToCheck);
      const damagePerStack = effectiveValue || 5;
      const totalDamage = damagePerStack * stacks;

      return {
        targetId: target.id,
        type: 'damage_per_stack',
        value: totalDamage,
        effectId: effect.id,
        log: `${stacks} stacks de ${statusToCheck} → ${totalDamage} daño (${damagePerStack} por stack)`
      };
    }

    case 'apply_shield': {
      const shieldValue = effectiveValue || 25;
      const status = StatusSystem.addStatus(source.id, {
        name: 'shield',
        type: 'buff',
        duration: 2,
        remainingTurns: 2,
        appliedById: source.id
      } as unknown as Omit<CombatStatusEffect, 'id'>);

      (status as { shieldValue?: number }).shieldValue = shieldValue;

      return {
        targetId: source.id,
        type: 'apply_shield',
        value: shieldValue,
        status,
        effectId: effect.id,
        log: `${source.name} obtiene ${shieldValue} shield`
      };
    }

    default:
      return {
        targetId: target.id,
        type: 'none',
        effectId: effect.id,
        log: `Tipo de efecto desconocido: ${effect.type}`
      };
  }
}

export function resolveEvent(
  skillEffects: SkillEffect[],
  context: EffectExecutionContext,
  modifiers?: AppliedModifiers
): EffectResult[] {
  const results: EffectResult[] = [];

  const matchingEffects = skillEffects
    .filter(se => se.trigger.name === context.event)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  for (const skillEffect of matchingEffects) {
    const effectContext: EffectExecutionContext = {
      ...context,
      previousEffects: results,
      executionOrder: results.length
    };

    let condition = skillEffect.condition as Condition;
    if (modifiers?.modifyCondition) {
      condition = { ...condition, ...modifiers.modifyCondition } as Condition;
    }

    if (!checkCondition(condition, effectContext)) {
      continue;
    }

    const result = applyEffect(skillEffect.effect, effectContext, modifiers);
    results.push(result);

    if (modifiers?.duplicateEffects) {
      const duplicatedResult = applyEffect(skillEffect.effect, effectContext, modifiers);
      duplicatedResult.log = `[DUPLICADO] ${duplicatedResult.log}`;
      results.push(duplicatedResult);
    }

    if (modifiers?.duplicateOnCrit && context.isCrit) {
      const critDuplicatedResult = applyEffect(skillEffect.effect, effectContext, modifiers);
      critDuplicatedResult.log = `[CRIT DUPLICADO] ${critDuplicatedResult.log}`;
      results.push(critDuplicatedResult);
    }
  }

  if (modifiers?.chainEffects && modifiers.chainEffects.length > 0) {
    for (const chain of modifiers.chainEffects) {
      if (chain.trigger === context.event) {
        const chainCondition = chain.condition || {};
        if (checkCondition(chainCondition as Condition, context)) {
          const chainResult = applyEffect(chain.effect, context, modifiers);
          chainResult.log = `[CHAIN] ${chainResult.log}`;
          results.push(chainResult);
        }
      }
    }
  }

  if (modifiers?.newEffects && modifiers.newEffects.length > 0) {
    for (const extraEffect of modifiers.newEffects) {
      const extraResult = applyEffect(extraEffect, context, modifiers);
      results.push(extraResult);
    }
  }

  return results;
}

export function resolveSkill(
  skill: Skill,
  skillEffects: SkillEffect[],
  context: EffectExecutionContext,
  modifiers: Modifier[] = []
): EffectResult[] {
  const applied = applyModifiers(skill, modifiers);
  const actualCrit = context.isCrit || (applied.allowCrit && Math.random() * 100 < applied.critChanceBonus);
  
  const resolvedContext: EffectExecutionContext = {
    ...context,
    isCrit: actualCrit
  };

  return resolveEvent(skillEffects, resolvedContext, applied);
}

export function applyModifiers(
  skill: Skill,
  modifiers: Modifier[]
): AppliedModifiers {
  const matchingModifiers = modifiers.filter(m =>
    skill.tags.includes(m.appliesToTag)
  );

  if (matchingModifiers.length === 0) {
    return {
      allowCrit: false,
      critChanceBonus: 0,
      damageMultiplier: 1,
      extendDuration: 0,
      duplicateEffects: false,
      duplicateOnCrit: false,
      newEffects: [],
      modifyValue: 0,
      modifyCondition: null,
      chainEffects: []
    };
  }

  let allowCrit = false;
  let critChanceBonus = 0;
  let damageMultiplier = 1;
  let extendDuration = 0;
  let duplicateEffects = false;
  let duplicateOnCrit = false;
  let modifyValue = 0;
  let modifyCondition: Record<string, unknown> | null = null;
  const newEffects: Effect[] = [];
  const chainEffects: { trigger: EventType; effect: Effect; condition?: Record<string, unknown> }[] = [];

  for (const mod of matchingModifiers) {
    const config: ModifierEffectConfig = mod.effect;
    
    if (config.allow_crit) allowCrit = true;
    if (config.crit_chance_bonus) critChanceBonus += config.crit_chance_bonus;
    if (config.damage_multiplier) damageMultiplier *= config.damage_multiplier;
    if (config.extend_duration) extendDuration += config.extend_duration;
    if (config.duplicate_effects) duplicateEffects = true;
    if (config.duplicate_on_crit) duplicateOnCrit = true;
    if (config.new_effects) newEffects.push(...config.new_effects);
    if (config.modify_value) modifyValue = config.modify_value;
    if (config.modify_condition) modifyCondition = config.modify_condition;
    if (config.chain_effects) chainEffects.push(...config.chain_effects);
  }

  return { 
    allowCrit, 
    critChanceBonus, 
    damageMultiplier, 
    extendDuration, 
    duplicateEffects,
    duplicateOnCrit,
    newEffects, 
    modifyValue,
    modifyCondition,
    chainEffects 
  };
}

export async function loadSkillModule(
  skillId: string
): Promise<{ skill: Skill; effects: SkillEffect[] } | null> {
  const { supabase } = await import('../supabase');
  
  const { data: skillData, error: skillError } = await supabase
    .from('skill_modules')
    .select('*')
    .eq('id', skillId)
    .single();

  if (skillError || !skillData) {
    return null;
  }

  const { data: tagData } = await supabase
    .from('skill_module_tags')
    .select('tags(name)')
    .eq('skill_id', skillId) as { data: { tags: { name: string } }[] | null };

  const tags = tagData?.map(t => t.tags?.name).filter(Boolean) || [];

  const skill: Skill = {
    id: skillData.id,
    name: skillData.name,
    description: skillData.description,
    basePower: skillData.base_power,
    cooldown: skillData.cooldown,
    tags
  };

  const { data: effectsData } = await supabase
    .from('skill_module_effects')
    .select(`
      id,
      skill_id,
      trigger_id,
      condition,
      order_index,
      triggers(id, name),
      effects(id, type, value, duration, extra)
    `)
    .eq('skill_id', skillId) as { data: {
      id: string;
      skill_id: string;
      trigger_id: string;
      condition: Record<string, unknown>;
      order_index: number;
      triggers: { id: string; name: string };
      effects: { id: string; type: string; value: number | null; duration: number | null; extra: Record<string, unknown> };
    }[] | null };

  const skillEffects: SkillEffect[] = (effectsData || []).map(e => ({
    id: e.id,
    skillId: e.skill_id,
    triggerId: e.trigger_id,
    trigger: { id: e.triggers.id, name: e.triggers.name as EventType },
    effect: e.effects,
    condition: e.condition,
    orderIndex: e.order_index
  }));

  return { skill, effects: skillEffects };
}

export async function loadModifiers(
  modifierIds: string[]
): Promise<Modifier[]> {
  if (modifierIds.length === 0) return [];

  const { supabase } = await import('../supabase');

  const { data, error } = await supabase
    .from('modifiers')
    .select('*')
    .in('id', modifierIds);

  if (error || !data) return [];

  return data.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    appliesToTag: m.applies_to_tag,
    effect: m.effect
  }));
}