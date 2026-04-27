import { supabase } from '@/lib/supabase';
import { MAX_GACHA_SKILLS } from '../rpg-system/types';

export class EquipmentService {
    /**
     * Equips an item to a unit.
     * Enforces the 3+2 skill rule and 3 card slot rule.
     */
    static async equipItem(unitId: string, itemInstanceId: string, slot: 'weapon' | 'card' | 'skill') {
        if (!supabase) return;

        const { data: unit } = await supabase.from('units').select('*').eq('id', unitId).single();
        if (!unit) throw new Error("Unit not found");

        if (slot === 'weapon') {
            const { error } = await supabase
                .from('units')
                .update({ equipped_weapon_instance_id: itemInstanceId })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'card') {
            const currentCards = unit.equipped_card_instance_ids || [];

            // Standardizing on 3 cards for now (flexible)
            if (currentCards.length >= 3) throw new Error("Máximo 3 cartas equipadas");

            const newCards = [...currentCards, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_card_instance_ids: newCards })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'skill') {
            const currentSkills = unit.equipped_skill_instance_ids || [];

            // 3 Job Skills are automatic, 2 Equippable are from Gacha
            if (currentSkills.length >= MAX_GACHA_SKILLS) {
                throw new Error("Límite de habilidades adicionales alcanzado (Máximo 2)");
            }

            const newSkills = [...currentSkills, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_skill_instance_ids: newSkills })
                .eq('id', unitId);
            if (error) throw error;
        }

        return { success: true };
    }

    /**
     * Unequips an item from a unit.
     */
    static async unequipItem(unitId: string, itemInstanceId: string, slot: 'weapon' | 'card' | 'skill') {
        if (!supabase) return;

        if (slot === 'weapon') {
            const { error } = await supabase
                .from('units')
                .update({ equipped_weapon_instance_id: null })
                .eq('id', unitId);
            if (error) throw error;
        } else {
            const field = slot === 'card' ? 'equipped_card_instance_ids' : 'equipped_skill_instance_ids';
            const { data: unit } = await supabase.from('units').select(field).eq('id', unitId).single();
            if (!unit) return;

            const currentItems = (unit as any)?.[field] || [];
            const newItems = currentItems.filter((id: string) => id !== itemInstanceId);

            const { error } = await supabase
                .from('units')
                .update({ [field]: newItems })
                .eq('id', unitId);
            if (error) throw error;
        }

        return { success: true };
    }
}
