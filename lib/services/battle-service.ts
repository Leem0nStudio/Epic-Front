import { BaseStats } from '../rpg-system/types';

export interface CombatUnit {
    id: string;
    name: string;
    stats: BaseStats;
    currentHp: number;
    team: 'player' | 'enemy';
    isDead: boolean;
    position: number;
}

export class BattleService {
    /**
     * Calculates damage: (Atk * Multiplier) - (Def / 2)
     */
    static calculateDamage(attacker: CombatUnit, defender: CombatUnit, multiplier: number = 1.0): number {
        const rawDamage = (attacker.stats.atk * multiplier);
        const reduction = defender.stats.def * 0.5;
        const finalDamage = Math.max(1, Math.floor(rawDamage - reduction));
        return finalDamage;
    }

    /**
     * Simple Turn Order: Sorted by AGI
     */
    static getTurnOrder(units: CombatUnit[]): CombatUnit[] {
        return [...units]
            .filter(u => !u.isDead)
            .sort((a, b) => b.stats.agi - a.stats.agi);
    }

    /**
     * AI logic for enemy turn
     */
    static getEnemyAction(enemy: CombatUnit, players: CombatUnit[]) {
        const targets = players.filter(p => !p.isDead);
        if (targets.length === 0) return null;
        // Attack the one with lowest HP
        const target = targets.sort((a, b) => a.currentHp - b.currentHp)[0];
        return target;
    }
}
