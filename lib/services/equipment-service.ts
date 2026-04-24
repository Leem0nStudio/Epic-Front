import { supabase } from '@/lib/supabase';

export class EquipmentService {
    /**
     * Equips an item to a unit.
     */
    static async equipItem(unitId: string, itemInstanceId: string, slot: 'weapon' | 'card' | 'skill') {
        if (!supabase) return;

        if (slot === 'weapon') {
            const { error } = await supabase
                .from('units')
                .update({ equipped_weapon_instance_id: itemInstanceId })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'card') {
            // Fetch current cards
            const { data: unit } = await supabase.from('units').select('equipped_cards_instances_ids').eq('id', unitId).single();
            const currentCards = unit?.equipped_cards_instances_ids || [];

            // Limit to 4 cards
            if (currentCards.length >= 4) throw new Error("Máximo 4 cartas equipadas");

            const newCards = [...currentCards, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_cards_instances_ids: newCards })
                .eq('id', unitId);
            if (error) throw error;
        } else if (slot === 'skill') {
            const { data: unit } = await supabase.from('units').select('equipped_skills_instances_ids').eq('id', unitId).single();
            const currentSkills = unit?.equipped_skills_instances_ids || [];
            if (currentSkills.length >= 3) throw new Error("Máximo 3 habilidades equipadas");

            const newSkills = [...currentSkills, itemInstanceId];
            const { error } = await supabase
                .from('units')
                .update({ equipped_skills_instances_ids: newSkills })
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
            const field = slot === 'card' ? 'equipped_cards_instances_ids' : 'equipped_skills_instances_ids';
            const { data: unit } = await supabase.from('units').select(field).eq('id', unitId).single();
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
