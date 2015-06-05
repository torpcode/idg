(function () {

    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main(): void {
        const game = new Game();

        // Game loop
        let lastTick = Date.now();
        setInterval(function (): void {
            // Calculate elapsed time
            const now = Date.now();
            const elapsedMS = now - lastTick;
            lastTick = now;

            // Update game logic
            game.update(elapsedMS);

        }, 1000/30);
    }

})();
