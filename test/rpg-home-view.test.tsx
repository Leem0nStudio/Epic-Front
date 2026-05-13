import { fireEvent, render, screen } from '@testing-library/react';
import { RPGHomeView } from '@/components/views/RPGHomeView';
import type { GameState, GameUnit, ViewType } from '@/lib/types/game-types';

const createUnit = (overrides: Partial<GameUnit> = {}): GameUnit => ({
  id: overrides.id ?? `unit-${Math.random().toString(36).slice(2, 7)}`,
  player_id: 'player-1',
  name: overrides.name ?? 'Hero',
  level: overrides.level ?? 60,
  exp: 1200,
  current_job_id: overrides.current_job_id ?? 'knight',
  unlocked_jobs: ['knight'],
  baseStats: {
    hp: overrides.baseStats?.hp ?? 338,
    atk: overrides.baseStats?.atk ?? 384,
    def: overrides.baseStats?.def ?? 106,
    matk: overrides.baseStats?.matk ?? 92,
    mdef: overrides.baseStats?.mdef ?? 173,
    agi: overrides.baseStats?.agi ?? 80,
  },
  growthRates: {
    hp: 1,
    atk: 1,
    def: 1,
    matk: 1,
    mdef: 1,
    agi: 1,
  },
  affinity: 'physical',
  equipped_card_instance_ids: [],
  equipped_skill_instance_ids: [],
  rarity: 'UR',
  ...overrides,
} as GameUnit & { rarity: string });

const createSaveData = (): GameState =>
  ({
    isLoaded: true,
    isAuthLoading: false,
    isAuthenticated: true,
    error: null,
    needsOnboarding: false,
    profile: {
      id: 'profile-1',
      username: 'Aethel_Player',
      level: 65,
      currency: 3450120,
      gems: 5200,
      premium_currency: 5200,
      energy: 28,
      max_energy: 40,
      power: 91234,
    },
    roster: [],
    party: [],
    tavernSlots: [],
    inventory: [],
    activePartyUnits: [],
    view: 'home',
    returnView: null,
    selectedUnitId: null,
    selectedStage: null,
    selectedCardId: null,
    selectedSkillId: null,
    selectedItemId: null,
    targetSlot: null,
    version: 'test',
  }) as GameState;

describe('RPGHomeView', () => {
  test('renders JRPG top and bottom chrome with reference labels', () => {
    render(
      <RPGHomeView
        saveData={createSaveData()}
        activePartyUnits={[createUnit({ name: 'Paladin' }), createUnit({ name: 'Archer' }), createUnit({ name: 'Mage' })]}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Aethel_Player')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Party' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recruit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gacha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Battle' })).toBeInTheDocument();
  });

  test('maps bottom navigation and battle CTA to existing routes', () => {
    const onNavigate = jest.fn<(view: ViewType) => void>();

    render(
      <RPGHomeView
        saveData={createSaveData()}
        activePartyUnits={[createUnit(), createUnit(), createUnit()]}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Party' }));
    fireEvent.click(screen.getByRole('button', { name: 'Recruit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gacha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Battle' }));
    fireEvent.click(screen.getByRole('button', { name: /battle now/i }));

    expect(onNavigate).toHaveBeenNthCalledWith(1, 'party');
    expect(onNavigate).toHaveBeenNthCalledWith(2, 'tavern');
    expect(onNavigate).toHaveBeenNthCalledWith(3, 'gacha');
    expect(onNavigate).toHaveBeenNthCalledWith(4, 'campaign');
    expect(onNavigate).toHaveBeenNthCalledWith(5, 'campaign');
  });

  test('keeps hero selection interactive on the staged party showcase', () => {
    const onSelectUnit = jest.fn();

    render(
      <RPGHomeView
        saveData={createSaveData()}
        activePartyUnits={[
          createUnit({ id: 'left', name: 'Elven Archer', rarity: 'R' } as never),
          createUnit({ id: 'center', name: 'Paladin', rarity: 'UR' } as never),
          createUnit({ id: 'right', name: 'Female Mage', rarity: 'SR' } as never),
        ]}
        onNavigate={jest.fn()}
        onSelectUnit={onSelectUnit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /paladin spotlight/i }));

    expect(onSelectUnit).toHaveBeenCalledWith('center');
  });

  test('renders graceful fallback chrome when party slots or profile resource fields are missing', () => {
    const sparseSaveData = {
      ...createSaveData(),
      profile: {
        ...createSaveData().profile!,
        username: 'Jugador',
        gems: 0,
        premium_currency: 0,
      },
    } as GameState;

    render(
      <RPGHomeView
        saveData={sparseSaveData}
        activePartyUnits={[createUnit({ name: 'Solo Knight' }), null, null]}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByText('Jugador')).toBeInTheDocument();
    expect(screen.getAllByText('Empty Slot').length).toBeGreaterThan(0);
    expect(screen.getByText('Current Objective')).toBeInTheDocument();
  });
});
