import { supabase } from '@/lib/supabase';

export interface GuildInfo {
  inGuild: boolean;
  guildId?: string;
  name?: string;
  description?: string;
  level?: number;
  exp?: number;
  memberCount?: number;
  maxMembers?: number;
  leaderId?: string;
  members?: GuildMember[];
}

export interface GuildMember {
  playerId: string;
  username: string;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  joinedAt: string;
}

export class GuildService {
  static async getInfo(): Promise<GuildInfo> {
    const { data, error } = await supabase.rpc('rpc_guild_get_info');
    if (error) throw error;
    return data;
  }

  static async create(name: string, description?: string): Promise<string> {
    const { data, error } = await supabase.rpc('rpc_guild_create', {
      p_name: name,
      p_description: description,
    });
    if (error) throw error;
    return data.guildId;
  }

  static async join(guildId: string): Promise<void> {
    const { error } = await supabase.rpc('rpc_guild_join', { p_guild_id: guildId });
    if (error) throw error;
  }

  static async leave(): Promise<void> {
    const { error } = await supabase.rpc('rpc_guild_leave');
    if (error) throw error;
  }

  static async donate(amount: number = 100): Promise<void> {
    const { error } = await supabase.rpc('rpc_guild_donate', { p_amount: amount });
    if (error) throw error;
  }
}
