import { supabase } from '@/lib/supabase';

export interface BannerFeaturedItem {
  itemId: string;
  itemType: string;
  rateUpMultiplier: number;
  displayOrder: number;
}

export interface Banner {
  id: string;
  name: string;
  description: string;
  bannerType: 'standard' | 'rate_up' | 'collab' | 'seasonal';
  featuredRarity: string | null;
  rateUpMultiplier: number;
  endDate: string | null;
  sparkCost: number | null;
  currencyCost: {
    premium: { single: number; multi: number };
    soft: { single: number; multi: number };
  };
  featuredItems: BannerFeaturedItem[];
}

export interface BannerPity {
  pullsSinceEpic: number;
  pullsSinceLegendary: number;
  sparkCount: number;
  sparkCost: number | null;
}

export class BannerService {
  static async getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await supabase.rpc('rpc_get_active_banners');
    if (error) throw error;
    return (data || []).map((b: Record<string, unknown>) => ({
      id: b.banner_id,
      name: b.banner_name,
      description: b.banner_description,
      bannerType: b.banner_type,
      featuredRarity: b.featured_rarity,
      rateUpMultiplier: b.rate_up_multiplier,
      endDate: b.end_date,
      sparkCost: b.spark_cost,
      currencyCost: b.currency_cost,
      featuredItems: b.featured_items || [],
    }));
  }

  static async getBannerPity(bannerId: string): Promise<BannerPity> {
    const { data, error } = await supabase.rpc('rpc_get_banner_pity', { p_banner_id: bannerId });
    if (error) throw error;
    return data;
  }

  static async getGlobalPity(): Promise<{ pullsSinceEpic: number; pullsSinceLegendary: number }> {
    const { data, error } = await supabase.rpc('rpc_get_global_pity');
    if (error) throw error;
    return data;
  }

  static async claimSpark(bannerId: string, selectedItemId: string): Promise<void> {
    const { error } = await supabase.rpc('rpc_claim_spark', {
      p_banner_id: bannerId,
      p_selected_item_id: selectedItemId,
    });
    if (error) throw error;
  }
}
