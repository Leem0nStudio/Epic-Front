import { UnitStats } from '../rpg-system/types';

export interface CombatUnit {
    id: string;
    name: string;
    stats: UnitStats;
    currentHp: number;
    team: 'player' | 'enemy';
    isDead: boolean;
    position: number;
    skills: any[];
}

export interface BattleBet {
    energyWager: number;
    riskLevel: 'safe' | 'balanced' | 'all-in';
    multiplier: number;
    critChance: number;
}

export class BattleService {
    static readonly BET_OPTIONS = {
        safe: { energyWager: 0, riskLevel: 'safe' as const, multiplier: 1.0, critChance: 0 },
        balanced: { energyWager: 1, riskLevel: 'balanced' as const, multiplier: 1.3, critChance: 0.1 },
        allIn: { energyWager: 2, riskLevel: 'all-in' as const, multiplier: 1.8, critChance: 0.25 },
    } as const;

    static getBet(riskLevel: 'safe' | 'balanced' | 'allIn'): BattleBet {
        return this.BET_OPTIONS[riskLevel];
    }

    static calculateBetMultiplier(bet: BattleBet): number {
        return bet.multiplier;
    }

    static canAffordBet(bet: BattleBet, currentEnergy: number): boolean {
        return currentEnergy >= bet.energyWager;
    }

    static calculateDamage(
        attacker: CombatUnit,
        defender: CombatUnit,
        multiplier: number = 1.0,
        isMagic: boolean = false,
        bet?: BattleBet
    ): { damage: number; isCrit: boolean; bonusExp: number } {
        const atkVal = isMagic ? attacker.stats.matk : attacker.stats.atk;
        const defVal = isMagic ? defender.stats.mdef : defender.stats.def;

        let rawDamage = atkVal * multiplier;
        const reduction = defVal * 0.5;
        let damage = Math.max(1, Math.floor(rawDamage - reduction));

        let isCrit = false;
        let bonusExp = 0;

        if (bet && bet.critChance > 0) {
            isCrit = Math.random() < bet.critChance;
            if (isCrit) {
                damage *= 2;
                bonusExp = Math.floor(damage * 0.1);
            }
        }

        return { damage, isCrit, bonusExp };
    }

    static getTurnOrder(units: CombatUnit[]): CombatUnit[] {
        return [...units]
            .filter(u => !u.isDead)
            .sort((a, b) => b.stats.agi - a.stats.agi);
    }

    static getEnemyAction(enemy: CombatUnit, players: CombatUnit[]) {
        const targets = players.filter(p => !p.isDead);
        if (targets.length === 0) return null;
        const target = targets.sort((a, b) => a.currentHp - b.currentHp)[0];
        return target;
    }
}
