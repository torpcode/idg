(function () {

    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main(): void {
        const game = new Game();

        let view = new HtmlView();
        view.define("game", game);
        view.parseHtml();
        view = null; // No more use of the view object

        // Start the game loop
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