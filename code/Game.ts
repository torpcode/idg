/**
 * The main game class. Handles the overall state and timing of the game.
 */
class Game {
    private gold = new Component(0);

    constructor() {
        this.gold.attachElement(document.getElementById("gold-counter"));
    }

    public update(elapsedMS: number): void {
        this.gold.val += elapsedMS;
    }
}
