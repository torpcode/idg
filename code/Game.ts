/**
 * The main game class. Handles the overall state and timing of the game.
 */
class Game {
    private gold = new Component(0);
    private income = new Component(1);
    private goldPerClick = new Component(1);

    constructor() {
        this.gold.attachElement("gold-counter");
        this.income.attachElement("income");
        this.goldPerClick.attachElement("gold-per-click");

        document.getElementById("gold-mine").addEventListener("click", () => {
            this.gold.val += this.goldPerClick.val;
        });
    }

    public update(elapsedMS: number): void {
        this.gold.val += this.income.val*(elapsedMS/1000);
    }
}
