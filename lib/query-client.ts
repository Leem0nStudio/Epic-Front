import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },

  // Player
  player: {
    profile: ['player', 'profile'] as const,
    energy: ['player', 'energy'] as const,
    currency: ['player', 'currency'] as const,
  },

  // Units
  units: {
    list: ['units', 'list'] as const,
    detail: (id: string) => ['units', 'detail', id] as const,
  },

  // Inventory
  inventory: {
    list: ['inventory', 'list'] as const,
    byType: (type: string) => ['inventory', 'byType', type] as const,
  },

  // Party
  party: {
    current: ['party', 'current'] as const,
  },

  // Recruitment
  recruitment: {
    queue: ['recruitment', 'queue'] as const,
  },

  // Campaign
  campaign: {
    progress: ['campaign', 'progress'] as const,
    stages: ['campaign', 'stages'] as const,
  },

  // Gacha
  gacha: {
    state: ['gacha', 'state'] as const,
  },

  // Static data
  static: {
    jobs: ['static', 'jobs'] as const,
    skills: ['static', 'skills'] as const,
    cards: ['static', 'cards'] as const,
    weapons: ['static', 'weapons'] as const,
    jobCores: ['static', 'jobCores'] as const,
  },
} as const;