export interface PlayerSaveData {
    username: string;
    currency: number;
    premiumCurrency: number;
    inventory: any;
    roster: any[];
    party: (string | null)[];
    tavernSlots: any[];
}
