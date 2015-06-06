/**
 * Manages the state of the various achievements in the game.
 */
class AchievementTracker {
    private game: Game;
    private totalUnlocked = new Component(0);
    private totalAchievements = new Component(0);

    constructor(game: Game) {
        this.game = game;

        this.createAchievements();
    }

    private createAchievements(): void {
        const game = this.game;
        this.create("Gold Digger", "gold_coin.png", game["totalGoldEarned"], 1e4, "Earn {$} gold.");
        this.create("Golden Touch", "golden_touch.png", game["totalGoldMined"], 1e4, "Mine {$} gold by clicking on the gold mine.");
        this.create("Alchemist's Bane", "transmute.png", game["totalGoldEarned"], 1e6, "Earn {$} gold.");
        this.create("Longevity", "longevity.png", game["totalTimePlayed"], 5*3600*1000, "Play for {$}.", $.timeSpan);
    }

    private create(name: string, icon: string, cmp: Component, value: number, description: string, formatter?: ValueFormatter): void {
        // The state of the achievement
        let isUnlocked = false;

        if (!formatter) {
            formatter = $.commify;
        }

        // Create the element representing the achievement
        const element = document.createElement("div");
        element.className = "achievement";
        element.innerHTML = "<span class='achievement-mask'></span>";
        element.style.backgroundImage = `url('resources/${icon}')`;
        $.id("achievement-container").appendChild(element);

        // Show description in tooltip
        description = description.replace("{$}", "<span style='color: #ff7700;'>" + formatter(value) + "</span>");
        Tooltip.attachFunc(element, () => {
            // Text that appears in the tooltip of the achievement.
            // Kinda messy, but works fine...
            let progress;
            if (isUnlocked) {
                progress = `<div style="font-size: 16px; margin-top: 8px; color: #22cc22;">Unlocked</div>`;
            } else {
                let pp = formatter(cmp.val) + " / " + formatter(value);
                let pctWidth = (100*cmp.val/value);
                progress = `<div style="margin-top: 8px;color: #999999; font-size: 11px;">Progress: [${Math.floor(pctWidth)}%]&nbsp;&nbsp;${pp}</div>`
                    + `<div style="margin-top: 7px; height: 5px; background-color: #770000">`
                        // Progress bar..? Seems to be sufficient for now.
                    + `<div style="width: ${pctWidth}%; height: 100%; background-color: #229922;"></div>`
                    + `</div>`;
            }
            return `<div style="margin-bottom: 8px; font-size: 18px; color: #ff7700;">${name}</div>`
                + `<div style="font-size: 12px; color: #cccccc;">${description}</div>`
                + `${progress}`;
        });

        // Add listener to component
        cmp.whenReached(value, () => {
            // Add the unlocked achievement class
            element.className += " achievement-unlocked";
            // Clear the 'locked achievement' mask
            element.innerHTML = "";
            // Mark as unlocked
            isUnlocked = true;

            console.log("Achievement unlocked:", name);
            // Increment unlocked achievement count
            this.totalUnlocked.val++;
        });

        // Increment total achievement count
        this.totalAchievements.val++;
    }
}