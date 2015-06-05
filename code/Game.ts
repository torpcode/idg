/**
 * The main game class. Handles the overall state and timing of the game.
 */
class Game {
    private gold = new Component(0);

    private income = new Component(1);
    private upgradeIncomePrice = new Component(10);

    private goldPerClick = new Component(1);
    private upgradeClickPrice = new Component(10);
    private totalClicks = new Component(0);

    constructor() {
        this.gold.addValueListener(() => {
            const element = document.getElementById("upgrade-income-price");
            element.style.color = (this.gold.val >= this.upgradeIncomePrice.val) ? "#33cc33" : "#ee2222";
        });
        this.gold.addValueListener(() => {
            const element = document.getElementById("upgrade-click-price");
            element.style.color = (this.gold.val >= this.upgradeClickPrice.val) ? "#33cc33" : "#ee2222";
        });

        document.getElementById("gold-mine").addEventListener("click", () => this.clickGoldMine());
        document.getElementById("upgrade-income-button").addEventListener("click", () => this.tryUpgradeIncome());
        document.getElementById("upgrade-click-button").addEventListener("click", () => this.tryUpgradeClick());
    }

    /**
     * Invoked when the player clicks the gold mine.
     */
    private clickGoldMine(): void {
        this.gold.val += this.goldPerClick.val;
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
        this.upgradeClickPrice.val *= 1.2;
    }

    public update(elapsedMS: number): void {
        this.gold.val += this.income.val*(elapsedMS/1000);
    }
}
