import { supabase } from '@/lib/supabase';

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  itemType: string;
  content: {
    currency?: number;
    gems?: number;
    energy?: number;
    items?: Array<{ itemId: string; amount: number }>;
  };
  priceGems: number;
  priceMoney: string | null;
  displayOrder: number;
  maxPurchasesPerDay: number | null;
  currentPurchases: number;
}

export class ShopService {
  static async getItems(): Promise<ShopItem[]> {
    const { data, error } = await supabase.rpc('rpc_shop_get_items');
    if (error) throw error;
    return (data || []).map((item: Record<string, unknown>) => ({
      itemId: item.item_id,
      name: item.item_name,
      description: item.item_description,
      itemType: item.item_type,
      content: item.content,
      priceGems: item.price_gems,
      priceMoney: item.price_money,
      displayOrder: item.display_order,
      maxPurchasesPerDay: item.max_purchases_per_day,
      currentPurchases: item.current_purchases,
    }));
  }

  static async purchase(itemId: string): Promise<void> {
    const { error } = await supabase.rpc('rpc_shop_purchase', { p_item_id: itemId });
    if (error) throw error;
  }
}
