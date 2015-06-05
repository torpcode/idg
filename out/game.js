"use strict";
(function () {
    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main() {
        var game = new Game();
        // Start the game loop
        var lastTick = Date.now();
        setInterval(function () {
            // Calculate elapsed time
            var now = Date.now();
            var elapsedMS = now - lastTick;
            lastTick = now;
            // Update game logic
            game.update(elapsedMS);
        }, 1000 / 30);
    }
})();
/**
 * An object which wraps a numeric value, ensuring it always stays valid.
 */
var Component = (function () {
    function Component(initValue) {
        this._value = initValue;
    }
    Object.defineProperty(Component.prototype, "val", {
        get: function () {
            // Just a simple getter
            return this._value;
        },
        set: function (value) {
            if (typeof value !== "number" || value < 0 || value === 1 / 0 || value !== value) {
                // Ensure the value of the component is always a primitive, positive, finite number.
                return;
            }
            if (this._value === value) {
                // New value is same as old, do nothing.
                return;
            }
            this._value = value;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype.render = function () {
        var elements = this.elements;
        if (!elements) {
            // No elements to render
            return;
        }
        // Render attached elements to represent the
        // current value of the element.
        var text = "" + Math.floor(this._value);
        for (var i = 0; i < elements.length; i++) {
            elements[i].innerHTML = text;
        }
    };
    Component.prototype.attachElement = function (elementID) {
        var element = document.getElementById(elementID);
        if (!element) {
            // Throw now, instead of a less clear error later on.
            throw new Error("No element matches the specified id.");
        }
        // Update the contents of the element immediately,
        // instead of it being outdated until the next
        // time the value of this component changes.
        element.innerHTML = "" + this._value;
        if (!this.elements) {
            // Initialize the 'elements' array on first call.
            this.elements = [];
        }
        this.elements.push(element);
    };
    return Component;
})();
/**
 * The main game class. Handles the overall state and timing of the game.
 */
var Game = (function () {
    function Game() {
        var _this = this;
        this.gold = new Component(0);
        this.income = new Component(1);
        this.goldPerClick = new Component(1);
        this.gold.attachElement("gold-counter");
        this.income.attachElement("income");
        this.goldPerClick.attachElement("gold-per-click");
        document.getElementById("gold-mine").addEventListener("click", function () {
            _this.gold.val += _this.goldPerClick.val;
        });
    }
    Game.prototype.update = function (elapsedMS) {
        this.gold.val += this.income.val * (elapsedMS / 1000);
    };
    return Game;
})();
/// <reference path="define.ts" />
/// <reference path="main.ts" />
/// <reference path="Component.ts" />
/// <reference path="Game.ts" />
//# sourceMappingURL=game.js.map