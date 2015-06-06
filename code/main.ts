(function () {

    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main(): void {
        // Create a StorageDevice instance which automatically loads
        // data from the previous session, and also helps with saving
        // the game later.
        const storage = new StorageDevice("idg_save_data");

        const game = new Game(storage);
        const achievements = new AchievementTracker(game);

        let view = new HtmlView();
        view.define("game", game);
        view.define("achievements", achievements);
        view.parseHtml();
        view = null; // No more use of the view object

        // Start the game loop at 30 fps
        let autoSaveTimer = 0;
        let lastTick = Date.now();
        setInterval(function (): void {
            // Calculate elapsed time
            const now = Date.now();
            const elapsedMS = now - lastTick;
            lastTick = now;

            // Update game logic
            game.update(elapsedMS);

            // Auto save the game every 7 seconds
            autoSaveTimer += elapsedMS;
            if (autoSaveTimer >= 7000) {
                autoSaveTimer = 0;
                storage.saveCurrentState();
            }

            // Render
            Display.render();

        }, 1000/30);
    }

})();