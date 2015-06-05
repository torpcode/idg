"use strict";
var HtmlView = (function () {
    function HtmlView() {
        this.definedObjects = Object.create(null);
    }
    HtmlView.prototype.define = function (key, obj) {
        this.definedObjects[key] = obj;
    };
    HtmlView.prototype.parseHtml = function () {
        this.traverse(document.body);
    };
    HtmlView.prototype.traverse = function (root) {
        var children = root.children;
        for (var i = 0; i < children.length; i++) {
            var element = children[i];
            if (element.hasAttribute("mk-value")) {
                var path = element.getAttribute("mk-value");
                var component = this.resolveComponent(path);
                component.attachElement(element);
            }
            // Continue recursive traversal through HTML element tree
            this.traverse(element);
        }
    };
    HtmlView.prototype.resolveComponent = function (path) {
        var split = path.split(".");
        if (split.length !== 2) {
            // This limits the 'resolve' function greatly, but more
            // isn't really needed. (At least not currently)
            throw new Error("Expected path to have exactly two values split by a dot.");
        }
        var ref = this.definedObjects[split[0]];
        if (!ref) {
            throw new Error("Unresolved path.");
        }
        // Resolve path
        var cmp = ref[split[1]];
        // And ensure value maps to a component
        if (!(cmp instanceof Component)) {
            throw new Error("Path does not map to a valid Component.");
        }
        return cmp;
    };
    return HtmlView;
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
            this.invokeValueListeners();
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates the contents of all attached elements to reflect the current value of the component.
     */
    Component.prototype.render = function () {
        var elements = this.elements;
        if (!elements) {
            // No elements to render
            return;
        }
        var text = this.formatValue();
        for (var i = 0; i < elements.length; i++) {
            elements[i].innerHTML = text;
        }
    };
    /**
     * Invoke all the value listeners.
     */
    Component.prototype.invokeValueListeners = function () {
        var listeners = this.valueListeners;
        if (!listeners) {
            // No listeners
            return;
        }
        var value = this._value;
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](value);
        }
    };
    /**
     * Creates a pretty textual representation of the current value of the component.
     */
    Component.prototype.formatValue = function () {
        return "" + Math.floor(this._value * 10) / 10;
    };
    /**
     * Attach an element to this component. The content of the element will be kept updated to reflect the value of the
     * component whenever it changes.
     */
    Component.prototype.attachElement = function (element) {
        // Update the contents of the element immediately,
        // instead of it being outdated until the next
        // time the value of this component changes.
        element.innerHTML = this.formatValue();
        if (!this.elements) {
            // Initialize the 'elements' array on first call.
            this.elements = [];
        }
        this.elements.push(element);
    };
    /**
     * Attach a listener to this component. The listener will be invoked whenever the value of the component changes.
     */
    Component.prototype.addValueListener = function (listener) {
        if (!this.valueListeners) {
            // Init before first use
            this.valueListeners = [];
        }
        // Invoke the listener immediately with the current value
        listener(this._value);
        this.valueListeners.push(listener);
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
        this.upgradeIncomePrice = new Component(10);
        this.goldPerClick = new Component(1);
        this.upgradeClickPrice = new Component(10);
        this.totalClicks = new Component(0);
        this.gold.addValueListener(function () {
            var element = document.getElementById("upgrade-income-price");
            element.style.color = (_this.gold.val >= _this.upgradeIncomePrice.val) ? "#33cc33" : "#ee2222";
        });
        this.gold.addValueListener(function () {
            var element = document.getElementById("upgrade-click-price");
            element.style.color = (_this.gold.val >= _this.upgradeClickPrice.val) ? "#33cc33" : "#ee2222";
        });
        document.getElementById("gold-mine").addEventListener("click", function () { return _this.clickGoldMine(); });
        document.getElementById("upgrade-income-button").addEventListener("click", function () { return _this.tryUpgradeIncome(); });
        document.getElementById("upgrade-click-button").addEventListener("click", function () { return _this.tryUpgradeClick(); });
    }
    /**
     * Invoked when the player clicks the gold mine.
     */
    Game.prototype.clickGoldMine = function () {
        this.gold.val += this.goldPerClick.val;
        this.totalClicks.val++;
    };
    /**
     * Upgrades the player's passive income, if he has enough gold.
     */
    Game.prototype.tryUpgradeIncome = function () {
        if (this.gold.val < this.upgradeIncomePrice.val) {
            // Not enough gold
            return;
        }
        this.gold.val -= this.upgradeIncomePrice.val;
        this.income.val++;
        this.upgradeIncomePrice.val *= 1.2;
    };
    /**
     * Upgrades the player's gold per click, if he has enough gold.
     */
    Game.prototype.tryUpgradeClick = function () {
        if (this.gold.val < this.upgradeClickPrice.val) {
            // Not enough gold
            return;
        }
        this.gold.val -= this.upgradeClickPrice.val;
        this.goldPerClick.val++;
        this.upgradeClickPrice.val *= 1.2;
    };
    Game.prototype.update = function (elapsedMS) {
        this.gold.val += this.income.val * (elapsedMS / 1000);
    };
    return Game;
})();
(function () {
    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main() {
        var game = new Game();
        var view = new HtmlView();
        view.define("game", game);
        view.parseHtml();
        view = null; // No more use of the view object
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
/// <reference path="define.ts" />
/// <reference path="HtmlView.ts" />
/// <reference path="Component.ts" />
/// <reference path="Game.ts" />
/// <reference path="main.ts" />
//# sourceMappingURL=game.js.map