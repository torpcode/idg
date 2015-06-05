"use strict";
/**
 * Provides various utility methods.
 */
var $;
(function ($) {
    /**
     * A wrapper of the native `document.getElementById` method, except this throws an error
     * if no element matching the specified id is found, instead of returning null.
     *
     * (Also shorter)
     */
    function id(elementId) {
        var element = document.getElementById(elementId);
        if (!element) {
            // Better throw an error now with a clear error
            // message than face an unclear error later.
            throw new Error("No element matching the specified id was found.");
        }
        return element;
    }
    $.id = id;
    /**
     * Converts a time span of milliseconds into a string representation in the format of: `D days, HH:MM:SS`.
     */
    function timeSpan(ms) {
        if (typeof ms !== "number" || ms < 0 || ms === 1 / 0 || ms !== ms) {
            // Invalid value
            return "??:??:??";
        }
        // seconds
        ms /= 1000;
        var SS = Math.floor(ms % 60);
        if (SS < 10)
            SS = "0" + SS;
        // minutes
        ms /= 60;
        var MM = Math.floor(ms % 60);
        if (MM < 10)
            MM = "0" + MM;
        // hours
        ms /= 60;
        var HH = Math.floor(ms % 24);
        if (HH < 10)
            HH = "0" + HH;
        // days
        ms /= 24;
        var days = Math.floor(ms % 24);
        return days + " days, " + HH + ":" + MM + ":" + SS;
    }
    $.timeSpan = timeSpan;
})($ || ($ = {}));
/**
 * An object that simplifies saving and loading game data.
 */
var StorageDevice = (function () {
    function StorageDevice(storageKey) {
        this.bindings = [];
        this.storageKey = storageKey;
        // Immediately load data from previous session (if such data exists)
        this.tryLoadSession();
    }
    StorageDevice.prototype.tryLoadSession = function () {
        var data = localStorage.getItem(this.storageKey);
        if (!data) {
            // Previous save doesn't exist
            return;
        }
        try {
            data = JSON.parse(data);
        }
        catch (ex) {
            // Data is corrupt?
            return;
        }
        console.log("Data loaded: ", data);
        this.loadedData = data;
    };
    StorageDevice.prototype.bind = function (key, cmp) {
        // Load data for this component immediately, it there is any
        var loadedData = this.loadedData;
        if (loadedData) {
            if (loadedData.hasOwnProperty(key)) {
                cmp.val = loadedData[key];
            }
        }
        // Ensure that both keys and components are unique.
        // A duplicate key or component will both result in
        // save data overwriting.
        var bindings = this.bindings;
        for (var i = 0; i < bindings.length; i++) {
            var b = bindings[i];
            if (b.key === key) {
                // Key collision
                throw new Error("Binding keys for components must be unique.");
            }
            if (b.cmp === cmp) {
                // Component collision
                throw new Error("The same component cannot be bound twice to the same storage device.");
            }
        }
        this.bindings.push({ key: key, cmp: cmp });
    };
    StorageDevice.prototype.save = function () {
        // Populate an object with the required save data
        var data = {};
        var bindings = this.bindings;
        for (var i = 0; i < bindings.length; i++) {
            var b = bindings[i];
            data[b.key] = b.cmp.val;
        }
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    };
    return StorageDevice;
})();
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
    function Component(initValue, formatter) {
        this._value = initValue;
        if (formatter) {
            this.formatter = formatter;
        }
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
        var formatter = this.formatter;
        if (formatter) {
            // Use a custom formatter, if there is one
            return formatter(this._value);
        }
        else {
            // Default formatting
            return "" + Math.floor(this._value * 10) / 10;
        }
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
    function Game(storage) {
        var _this = this;
        // Current amount of gold the player has.
        this.gold = new Component(0);
        // Amount of gold received each second as passive income.
        this.income = new Component(1);
        // Current level of the income upgrade.
        this.incomeLevel = new Component(1);
        // Amount of gold required to upgrade the income to the next level.
        this.upgradeIncomePrice = new Component(10);
        // Amount of gold earned by clicking the gold mine once.
        this.goldPerClick = new Component(1);
        // Current level of the gold per click upgrade.
        this.clickLevel = new Component(1);
        // Amount of gold required to upgrade the gold per click to the next level.
        this.upgradeClickPrice = new Component(10);
        // Total amount of gold earned throughout the game.
        this.totalGoldEarned = new Component(0);
        // Total number of times the player has clicked the gold mine.
        this.totalClicks = new Component(0);
        // Total time that has been accounted for by the game loop.
        // Basically this is the total amount of time played, not including time between sessions.
        this.totalTimePlayed = new Component(0, $.timeSpan);
        storage.bind("gd", this.gold);
        storage.bind("in", this.income);
        storage.bind("il", this.incomeLevel);
        storage.bind("up", this.upgradeIncomePrice);
        storage.bind("gp", this.goldPerClick);
        storage.bind("cl", this.clickLevel);
        storage.bind("cp", this.upgradeClickPrice);
        storage.bind("tg", this.totalGoldEarned);
        storage.bind("tc", this.totalClicks);
        storage.bind("tt", this.totalTimePlayed);
        this.gold.addValueListener(function () {
            $.id("upgrade-income-button").style.backgroundColor
                = (_this.gold.val >= _this.upgradeIncomePrice.val) ? "#33cc33" : "#ee2222";
        });
        this.gold.addValueListener(function () {
            $.id("upgrade-click-button").style.backgroundColor
                = (_this.gold.val >= _this.upgradeClickPrice.val) ? "#33cc33" : "#ee2222";
        });
        $.id("gold-mine").addEventListener("click", function () { return _this.clickGoldMine(); });
        $.id("upgrade-income-button").addEventListener("click", function () { return _this.tryUpgradeIncome(); });
        $.id("upgrade-click-button").addEventListener("click", function () { return _this.tryUpgradeClick(); });
    }
    Game.prototype.earnGold = function (value) {
        // assert (value > 0)
        this.gold.val += value;
        this.totalGoldEarned.val += value;
    };
    /**
     * Invoked when the player clicks the gold mine.
     */
    Game.prototype.clickGoldMine = function () {
        this.earnGold(this.goldPerClick.val);
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
        this.incomeLevel.val++;
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
        this.clickLevel.val++;
        this.upgradeClickPrice.val *= 1.2;
    };
    Game.prototype.update = function (elapsedMS) {
        this.earnGold(this.income.val * (elapsedMS / 1000));
        this.totalTimePlayed.val += elapsedMS;
    };
    return Game;
})();
(function () {
    window.addEventListener("load", main);
    /**
     * Application entry point.
     */
    function main() {
        // Create a StorageDevice instance which automatically loads
        // data from the previous session, and also helps with saving
        // the game later.
        var storage = new StorageDevice("idg_save_data");
        var game = new Game(storage);
        var view = new HtmlView();
        view.define("game", game);
        view.parseHtml();
        view = null; // No more use of the view object
        // Start the game loop at 30 fps
        var autoSaveTimer = 0;
        var lastTick = Date.now();
        setInterval(function () {
            // Calculate elapsed time
            var now = Date.now();
            var elapsedMS = now - lastTick;
            lastTick = now;
            // Update game logic
            game.update(elapsedMS);
            // Auto save the game every 7 seconds
            autoSaveTimer += elapsedMS;
            if (autoSaveTimer >= 7000) {
                autoSaveTimer = 0;
                storage.save();
            }
        }, 1000 / 30);
    }
})();
/// <reference path="define.ts" />
/// <reference path="utils.ts" />
/// <reference path="StorageDevice.ts" />
/// <reference path="HtmlView.ts" />
/// <reference path="Component.ts" />
/// <reference path="Game.ts" />
/// <reference path="main.ts" />
//# sourceMappingURL=game.js.map