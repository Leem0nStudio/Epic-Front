import { RPGUnit } from './types';

// Party management logic handles array of IDs to keep source of truth in the 'roster' Array.

export function swapPartyPositions(party: (string | null)[], index1: number, index2: number): (string | null)[] {
    if (index1 >= party.length || index2 >= party.length) return party;
    const newParty = [...party];
    const temp = newParty[index1];
    newParty[index1] = newParty[index2];
    newParty[index2] = temp;
    return newParty;
}

export function assignUnitToParty(party: (string | null)[], unitId: string, position: number): (string | null)[] {
    if (position >= party.length) return party;
    const newParty = [...party];
    
    // If unit is already in another slot, clear that slot first (prevents duplicates)
    const existingIndex = newParty.findIndex(id => id === unitId);
    if (existingIndex !== -1) {
        newParty[existingIndex] = null;
    }
    
    newParty[position] = unitId;
    return newParty;
}

export function removeUnitFromParty(party: (string | null)[], position: number): (string | null)[] {
    if (position >= party.length) return party;
    const newParty = [...party];
    newParty[position] = null;
    return newParty;
}

// Function to unlock more party slots
export function expandPartySize(party: (string | null)[], currentSize: number, newSize: number): { newParty: (string | null)[], newSize: number } {
    if (newSize <= currentSize) return { newParty: party, newSize: currentSize };
    
    const newParty = [...party];
    while (newParty.length < newSize) {
        newParty.push(null);
    }
    
    return { newParty, newSize };
}
