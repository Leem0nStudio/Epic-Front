import { render, screen } from '@testing-library/react';
import Applet from '@/app/page';

const mockState = {
  isLoaded: true,
  isAuthenticated: true,
  isAuthLoading: false,
  error: null,
  view: 'home',
  profile: {
    id: 'profile-1',
    username: 'Aethel_Player',
    level: 65,
    currency: 3450120,
    gems: 5200,
    premium_currency: 5200,
    energy: 24,
    max_energy: 40,
    power: 9999,
  },
  activePartyUnits: [],
  roster: [],
  inventory: [],
  selectedCardId: null,
  selectedUnitId: null,
  selectedSkillId: null,
  selectedItemId: null,
  selectedStage: null,
  returnView: null,
};

const mockActions = {
  navigateTo: jest.fn(),
  handleSelectUnit: jest.fn(),
  handleAssignPartySlot: jest.fn(),
  refreshState: jest.fn(),
  handleClaimRecruit: jest.fn(),
  handleOpenInventory: jest.fn(),
  handleOpenCardDetails: jest.fn(),
  handleStartBattle: jest.fn(),
  handleEquipItem: jest.fn(),
  handleDiscardItem: jest.fn(),
  handleSelectStage: jest.fn(),
  handleOpenQuest: jest.fn(),
  handleOpenDailyRewards: jest.fn(),
  handleOpenTraining: jest.fn(),
  setSelectedCardId: jest.fn(),
  reinitializeAccount: jest.fn(),
};

jest.mock('@/hooks/useGameState', () => ({
  useGameState: () => ({
    state: mockState,
    actions: mockActions,
  }),
}));

jest.mock('@/lib/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => true,
}));

jest.mock('@/components/ui/TutorialOverlay', () => ({
  TutorialOverlay: () => null,
  hasSeenTutorial: () => true,
}));

jest.mock('@/components/ui/CardModal', () => ({
  CardModal: () => null,
}));

jest.mock('@/components/layout/GlobalHeader', () => ({
  GlobalHeader: () => <div>GLOBAL HEADER</div>,
}));

jest.mock('@/components/layout/GlobalNavigation', () => ({
  GlobalNavigation: () => <div>GLOBAL NAVIGATION</div>,
}));

jest.mock('@/components/views/RPGHomeView', () => ({
  RPGHomeView: () => <div>JRPG HOME VIEW</div>,
}));

jest.mock('@/components/views/TavernView', () => ({ TavernView: () => <div>TAVERN VIEW</div> }));
jest.mock('@/components/views/PartyManagementView', () => ({ PartyManagementView: () => <div>PARTY VIEW</div> }));
jest.mock('@/components/views/GachaView', () => ({ GachaView: () => <div>GACHA VIEW</div> }));
jest.mock('@/components/views/UnitDetailsView', () => ({ UnitDetailsView: () => <div>UNIT DETAILS VIEW</div> }));
jest.mock('@/components/views/InventoryView', () => ({ InventoryView: () => <div>INVENTORY VIEW</div> }));
jest.mock('@/components/views/BattleScreenView', () => ({ BattleScreenView: () => <div>BATTLE VIEW</div> }));
jest.mock('@/components/views/CampaignMapView', () => ({ CampaignMapView: () => <div>CAMPAIGN VIEW</div> }));
jest.mock('@/components/views/QuestLogView', () => ({ QuestLogView: () => <div>QUEST VIEW</div> }));
jest.mock('@/components/views/StageDetailsView', () => ({ StageDetailsView: () => <div>STAGE DETAILS VIEW</div> }));
jest.mock('@/components/views/DailyRewardsView', () => ({ DailyRewardsView: () => <div>DAILY REWARDS VIEW</div> }));
jest.mock('@/components/views/TrainingView', () => ({ TrainingView: () => <div>TRAINING VIEW</div> }));
jest.mock('@/components/views/AuthView', () => ({ AuthView: () => <div>AUTH VIEW</div> }));
jest.mock('@/components/views/ArenaView', () => ({ ArenaView: () => <div>ARENA VIEW</div> }));
jest.mock('@/components/views/TowerView', () => ({ TowerView: () => <div>TOWER VIEW</div> }));
jest.mock('@/components/views/GuildView', () => ({ GuildView: () => <div>GUILD VIEW</div> }));
jest.mock('@/components/views/SkillDetailView', () => ({ SkillDetailView: () => <div>SKILL DETAIL VIEW</div> }));
jest.mock('@/components/views/CardDetailView', () => ({ CardDetailView: () => <div>CARD DETAIL VIEW</div> }));
jest.mock('@/components/views/ProfileView', () => ({ ProfileView: () => <div>PROFILE VIEW</div> }));
jest.mock('@/components/ui/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
jest.mock('@/components/ui/ErrorBoundary', () => ({ ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe('app/page home shell integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('hides global chrome on home while still rendering the JRPG home view', () => {
    mockState.view = 'home';

    render(<Applet />);

    expect(screen.getByText('JRPG HOME VIEW')).toBeInTheDocument();
    expect(screen.queryByText('GLOBAL HEADER')).not.toBeInTheDocument();
    expect(screen.queryByText('GLOBAL NAVIGATION')).not.toBeInTheDocument();
  });

  test('renders lightweight side-entry views and restores global chrome off-home', () => {
    mockState.view = 'events';

    render(<Applet />);

    expect(screen.getByText('EVENTS VIEW')).toBeInTheDocument();
    expect(screen.getByText('GLOBAL HEADER')).toBeInTheDocument();
    expect(screen.getByText('GLOBAL NAVIGATION')).toBeInTheDocument();
  });
});
