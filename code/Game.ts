/**
 * The main game class. Handles the overall state and timing of the game.
 */
class Game {
    // Current amount of gold the player has.
    private gold = new Component(0);

    // Amount of gold received each second as passive income.
    private income = new Component(1);
    // Current level of the income upgrade.
    private incomeLevel = new Component(1);
    // Amount of gold required to upgrade the income to the next level.
    private upgradeIncomePrice = new Component(10);

    // Amount of gold earned by clicking the gold mine once.
    private goldPerClick = new Component(1);
    // Current level of the gold per click upgrade.
    private clickLevel = new Component(1);
    // Amount of gold required to upgrade the gold per click to the next level.
    private upgradeClickPrice = new Component(10);

    // Total amount of gold earned throughout the game (from all sources).
    private totalGoldEarned = new Component(0);
    // Total amount of gold earned exclusively by clicking the gold mine.
    private totalGoldMined = new Component(0);
    // Total number of times the player has clicked the gold mine.
    private totalClicks = new Component(0);
    // Total time that has been accounted for by the game loop.
    // Basically this is the total amount of time played, not including time between sessions.
    private totalTimePlayed = new Component(0, $.timeSpan);

    // Used to display the current framerate
    private frameTime = 0;
    private frameCount = 0;
    private frameRate = new Component(0);

    constructor(storage: StorageDevice) {
        storage.bind("gd", this.gold);
        storage.bind("in", this.income);
        storage.bind("il", this.incomeLevel);
        storage.bind("up", this.upgradeIncomePrice);
        storage.bind("gp", this.goldPerClick);
        storage.bind("cl", this.clickLevel);
        storage.bind("cp", this.upgradeClickPrice);

        storage.bind("tg", this.totalGoldEarned);
        storage.bind("tm", this.totalGoldMined);
        storage.bind("tc", this.totalClicks);
        storage.bind("tt", this.totalTimePlayed);

        this.gold.addValueListener(() => {
            $.id("upgrade-income-button").style.backgroundColor
                = (this.gold.val >= this.upgradeIncomePrice.val) ? "#33cc33" : "#ee2222";
        });
        this.gold.addValueListener(() => {
            $.id("upgrade-click-button").style.backgroundColor
                = (this.gold.val >= this.upgradeClickPrice.val) ? "#33cc33" : "#ee2222";
        });

        $.id("gold-mine").addEventListener("click", () => this.clickGoldMine());
        $.id("upgrade-income-button").addEventListener("click", () => this.tryUpgradeIncome());
        $.id("upgrade-click-button").addEventListener("click", () => this.tryUpgradeClick());
    }

    private earnGold(value: number): void {
        // assert (value > 0)

        this.gold.val += value;
        this.totalGoldEarned.val += value;
    }

    /**
     * Invoked when the player clicks the gold mine.
     */
    private clickGoldMine(): void {
        const income = this.goldPerClick.val;
        this.earnGold(income);
        this.totalGoldMined.val += income;
        this.totalClicks.val++;
    }

    /**
     * Upgrades the player's passive income, if he has enough gold.
     */
    private tryUpgradeIncome(): void {
        if (this.gold.val < this.upgradeIncomePrice.val) {
            // Not enough gold
            return;
        }

        this.gold.val -= this.upgradeIncomePrice.val;
        this.income.val++;
        this.incomeLevel.val++;
        this.upgradeIncomePrice.val *= 1.2;
    }

    /**
     * Upgrades the player's gold per click, if he has enough gold.
     */
    private tryUpgradeClick(): void {
        if (this.gold.val < this.upgradeClickPrice.val) {
            // Not enough gold
            return;
        }

        this.gold.val -= this.upgradeClickPrice.val;
        this.goldPerClick.val++;
        this.clickLevel.val++;
        this.upgradeClickPrice.val *= 1.2;
    }

    public update(elapsedMS: number): void {
        this.earnGold(this.income.val*(elapsedMS/1000));

        this.totalTimePlayed.val += elapsedMS;

        this.frameCount++;
        this.frameTime += elapsedMS;
        if (this.frameTime >= 1000) {
            this.frameRate.val = (this.frameCount*1000/this.frameTime);

            this.frameTime = 0;
            this.frameCount = 0;
        }
    }
}
