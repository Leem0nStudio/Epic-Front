import { OnboardingService } from './services/onboarding-service';
import { UnitService } from './services/unit-service';
import { RecruitmentService } from './services/recruitment-service';
import { PartyService } from './services/party-service';
import { GachaService } from './services/gacha-service';

/**
 * MOCK SIMULATION OF THE EARLY GAME FLOW
 */
export async function simulateEarlyGame() {
    console.log("--- Starting Early Game Simulation ---");

    // 1. Onboarding: Player starts with 3 Novices
    console.log("Step 1: Onboarding player...");
    const startData = await OnboardingService.initializePlayer("NewHero");
    console.log(`Initialized with units: ${startData.units.map((u: any) => u.name).join(", ")}`);

    // 2. Simulate Evolution: Evolve the Physical Novice to Swordman
    const physicalUnit = startData.units.find((u: any) => u.affinity === 'physical');
    if (physicalUnit) {
        console.log(`Step 2: Evolving ${physicalUnit.name} to Swordman...`);
        // Note: Real DB check would verify level 10
        await UnitService.evolveUnit(physicalUnit.id, 'swordman');
        console.log(`${physicalUnit.name} is now a Swordman!`);
    }

    // 3. Recruitment: Check Tavern
    console.log("Step 3: Refreshing Tavern recruits...");
    await RecruitmentService.refreshTavern();

    // 4. Gacha Pull: Obtain components (Cards/Weapons)
    console.log("Step 4: Pulling components from Gacha (10-pull)...");
    const pulls = await GachaService.pull(10);
    console.log(`Gained ${pulls.length} components!`);

    // 5. Party Swap: Change unit in party
    console.log("Step 5: Reorganizing party positions...");
    await PartyService.assignToParty(0, startData.units[2].id);

    console.log("--- Simulation Complete ---");
}
