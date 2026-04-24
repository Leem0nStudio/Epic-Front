import { UnitStats } from '../rpg-system/types';

export interface CombatUnit {
    id: string;
    name: string;
    stats: UnitStats;
    currentHp: number;
    team: 'player' | 'enemy';
    isDead: boolean;
    position: number;
    skills: any[]; // Equipped skills
}

export class BattleService {
    /**
     * Calculates damage: (Atk * Multiplier) - (Def / 2)
     * For magic: (Matk * Multiplier) - (Mdef / 2)
     */
    static calculateDamage(attacker: CombatUnit, defender: CombatUnit, multiplier: number = 1.0, isMagic: boolean = false): number {
        const atkVal = isMagic ? attacker.stats.matk : attacker.stats.atk;
        const defVal = isMagic ? defender.stats.mdef : defender.stats.def;

        const rawDamage = (atkVal * multiplier);
        const reduction = defVal * 0.5;
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
        // Simple AI: Attack the one with lowest HP
        const target = targets.sort((a, b) => a.currentHp - b.currentHp)[0];
        return target;
    }
}
