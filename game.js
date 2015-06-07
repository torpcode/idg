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
     * Converts a time span of milliseconds into a string representation in the format of: `(D days, )HH:MM:SS`.
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
        // days
        ms /= 24;
        var days = Math.floor(ms % 24);
        if (days > 0) {
            return days + " days, " + HH + ":" + MM + ":" + SS;
        }
        else {
            return HH + ":" + MM + ":" + SS;
        }
    }
    $.timeSpan = timeSpan;
    // A RegExp object used to add commas to numeric strings
    var COMMIFY_REGEX = /\B(?=(\d{3})+(?!\d))/g;
    /**
     * Floors and adds commas to a number.
     */
    function commify(value) {
        // TODO: Improve documentation and handle edge cases more elegantly.
        if (typeof value !== "number") {
            // Hopefully this never happens, but if it does
            // return a value different from "NaN" to make
            // it more obvious what has happened.
            return "Invalid number";
        }
        value = Math.floor(value * 10) / 10;
        // Commas not needed for numbers with
        // less than four integer digits.
        if (value > 1000 && value < 1000) {
            return "" + value;
        }
        // Add commas to number
        return ("" + value).replace(COMMIFY_REGEX, ",");
    }
    $.commify = commify;
})($ || ($ = {}));
/**
 * Contains assertion methods for verifying conditions.
 */
var Assert;
(function (Assert) {
    /**
     * Asserts that a value is a primitive boolean `true`.
     */
    function is(value) {
        if (value !== true) {
            fail("Expected value to be true.");
        }
    }
    Assert.is = is;
    /**
     * Asserts that a value is a primitive boolean `false`.
     */
    function not(value) {
        if (value === true) {
            fail("Expected value to be false.");
        }
    }
    Assert.not = not;
    /**
     * Assert that a value is 'truthy'.
     * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Truthy}
     */
    function truthy(value) {
        if (!value) {
            fail("Expected value to be truthy.");
        }
    }
    Assert.truthy = truthy;
    /**
     * Asserts that a value is 'falsy'.
     * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy}
     */
    function falsy(value) {
        if (value) {
            fail("Expected value to be falsy.");
        }
    }
    Assert.falsy = falsy;
    /**
     * Asserts that a value is a primitive boolean.
     */
    function bool(value) {
        if (typeof value !== "boolean") {
            fail("Expected value to be falsy.");
        }
    }
    Assert.bool = bool;
    /**
     * Throws an assertion error with the specified error message.
     */
    function fail(errorMessage) {
        throw new Error("Assertion error: " + errorMessage);
    }
    Assert.fail = fail;
})(Assert || (Assert = {}));
/**
 * A mechanism for using an HTML element as a custom tooltip.
 */
var Tooltip;
(function (Tooltip) {
    // The element that will be used as the tooltip.
    var tooltipElem;
    var visible = false;
    var textGetter;
    /**
     * Attaches markup/text to appear as a tooltip besides the element when the cursor
     * hovers over it.
     */
    function attachText(element, htmlText) {
        if (!tooltipElem) {
            // Init on first use
            init();
        }
        element.addEventListener("mouseover", function () {
            Assert.not(visible);
            visible = true;
            var bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";
            tooltipElem.innerHTML = htmlText;
            tooltipElem.style.display = "block";
            textGetter = null;
        });
        element.addEventListener("mouseout", function () {
            Assert.is(visible);
            visible = false;
            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
            textGetter = null;
        });
    }
    Tooltip.attachText = attachText;
    /**
     * Attaches a function that returns markup/text to appear as a tooltip besides the
     * element when the cursor hovers over it. This should be used instead of `attachText()`
     * when the content of the tooltip is dynamic and may change, as the function will
     * be invoked each time the tooltip is shown.
     */
    function attachFunc(element, htmlTextGetter) {
        if (!tooltipElem) {
            // Init on first use
            init();
        }
        element.addEventListener("mouseover", function () {
            Assert.not(visible);
            visible = true;
            var bounds = element.getBoundingClientRect();
            tooltipElem.style.left = (bounds.right + 5) + "px";
            tooltipElem.style.top = bounds.top + "px";
            tooltipElem.innerHTML = htmlTextGetter();
            tooltipElem.style.display = "block";
            textGetter = htmlTextGetter;
        });
        element.addEventListener("mouseout", function () {
            Assert.is(visible);
            visible = false;
            tooltipElem.style.display = "none";
            tooltipElem.innerHTML = "";
            textGetter = null;
        });
    }
    Tooltip.attachFunc = attachFunc;
    function init() {
        tooltipElem = $.id("tooltip");
    }
    function update() {
        if (visible && textGetter) {
            tooltipElem.innerHTML = textGetter();
        }
    }
    Tooltip.update = update;
})(Tooltip || (Tooltip = {}));
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
            // Data found, but is corrupt?
            return;
        }
        this.loadedData = data;
    };
    StorageDevice.prototype.bind = function (key, load, getSaveData) {
        // Load data immediately, if there is
        // any data matching the key.
        var loadedData = this.loadedData;
        if (loadedData) {
            if (loadedData.hasOwnProperty(key)) {
                load(loadedData[key]);
            }
        }
        // Ensure that keys are unique, as duplicate keys
        // will result in save data being overwriting.
        var bindings = this.bindings;
        for (var i = 0; i < bindings.length; i++) {
            var b = bindings[i];
            if (b.key === key) {
                // Key collision
                throw new Error("Binding keys for components must be unique.");
            }
        }
        this.bindings.push({ key: key, getSaveData: getSaveData });
    };
    StorageDevice.prototype.bindCmp = function (key, cmp) {
        this.bind(key, function (x) { return cmp.val; }, function () { return cmp.val; });
    };
    StorageDevice.prototype.saveCurrentState = function () {
        // Populate an object with the required save data
        var data = {};
        var bindings = this.bindings;
        for (var i = 0; i < bindings.length; i++) {
            var b = bindings[i];
            data[b.key] = b.getSaveData();
        }
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    };
    return StorageDevice;
})();
/**
 * Handles the rendering of the visual elements of the game.
 */
var Display;
(function (Display) {
    // The head and tail of a singly-linked-list structure
    // used internally to store display nodes queued for
    // rendering.
    var firstNode, lastNode;
    /**
     * Queues a DisplayNode to be rendered at the end of the current frame.
     * This method is always `O(1)` runtime due to the linked-list-likeness of DisplayNodes.
     */
    function queueForRender(node) {
        if (node.isQueuedForRender) {
            // This node is already queued for rendering; there's
            // no point of rendering a node twice in the same frame.
            return;
        }
        node.isQueuedForRender = true;
        if (!firstNode) {
            // Render queue is empty.
            Assert.falsy(lastNode);
            firstNode = lastNode = node;
        }
        else {
            // Render queue is not empty.
            Assert.truthy(lastNode);
            lastNode.nextQueued = node;
            lastNode = node;
        }
        // Invalidate new node
        node.nextQueued = null;
    }
    Display.queueForRender = queueForRender;
    /**
     * Renders all the DisplayNodes that are currently queued to be rendered.
     */
    function render() {
        // Render queued nodes
        var node = firstNode;
        while (node) {
            node.render();
            node.isQueuedForRender = false;
            // Invalidating the 'next' reference of the node is
            // currently not required, since its value isn't used
            // for anything other than when the node is queued for
            // rendering; in which case the 'next' property of
            // the node is specifically set when it is queued.
            node = node.nextQueued;
        }
        // Empty the render queue
        firstNode = lastNode = null;
    }
    Display.render = render;
})(Display || (Display = {}));
/**
 * A simple MVC tool for to link the HTML with the game stuff.
 */
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
var Button = (function () {
    function Button(elementId, onColor, offColor) {
        this.element = $.id(elementId);
        this.onColor = onColor;
        this.offColor = offColor;
    }
    Button.prototype.setState = function (state) {
        Assert.bool(state);
        if (state === this.state) {
            // Same state
            return;
        }
        this.state = state;
        Display.queueForRender(this);
    };
    Button.prototype.render = function () {
        if (this.state === this.renderedState) {
            // State haven't changed since the last render,
            // no need to re-render anything.
            return;
        }
        this.element.style.backgroundColor = this.state ? this.onColor : this.offColor;
    };
    return Button;
})();
/**
 * An object which wraps a numeric value, ensuring it always stays valid.
 */
var Component = (function () {
    function Component(initValue, formatter) {
        this._value = initValue;
        this.maxValueReached = initValue;
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
            this.invokeValueListeners(value);
            this.checkMaxValue(value);
            // Request a render at the end of the frame
            Display.queueForRender(this);
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
        if (text === this.valueAsText) {
            // Same text as what was previously rendered,
            // so re-rendering the attached elements to
            // the same value can be avoided.
            return;
        }
        this.valueAsText = text;
        for (var i = 0; i < elements.length; i++) {
            elements[i].innerHTML = text;
        }
    };
    /**
     * Invoke all the value listeners.
     */
    Component.prototype.invokeValueListeners = function (value) {
        var listeners = this.valueListeners;
        if (!listeners) {
            // No listeners
            return;
        }
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](value);
        }
    };
    /**
     * Checks if a new maximum value has been reached, and potentially invokes the appropriate listeners.
     */
    Component.prototype.checkMaxValue = function (value) {
        // Check if a new max value has been reached
        if (value > this.maxValueReached) {
            // Remember new max value
            this.maxValueReached = value;
            // Invoke appropriate listeners
            var listeners = this.milestoneListeners;
            if (listeners) {
                while (listeners.length > 0) {
                    var entry = listeners[listeners.length - 1];
                    if (entry.value > value) {
                        // Entry value is too large; so there's no point
                        // of checking further since the listener array
                        // is sorted in ascending order, thus consecutive
                        // values will only be larger.
                        break;
                    }
                    // The listener must be removed before it is invoked.
                    // If the listener is invoked before it is removed, a
                    // endless recursion might occur if the listener sets
                    // the value of the component.
                    listeners.pop();
                    // Now the listener can be safely invoked.
                    entry.listener();
                }
            }
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
            return $.commify(this._value);
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
     * Attach a listener to the component. The listener will be invoked whenever the value of the component changes.
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
    /**
     * Attaches a listener to the component that will be invoked when the value of the component reaches/passes
     * the specified threshold value. The listener will be invoked only once, on the first time when the
     * threshold is reached. If the threshold has been previously reached by the component the listener will
     * be invoked immediately.
     */
    Component.prototype.whenReached = function (value, listener) {
        if (this.maxValueReached >= value) {
            // Value has been previously reached, so
            // just invoke the listener immediately
            // and be done with it.
            listener();
            return;
        }
        var entry = { value: value, listener: listener };
        var listeners = this.milestoneListeners;
        if (!listeners) {
            // Create the listener array when a listener
            // is added for the first time.
            this.milestoneListeners = [entry];
            return;
        }
        // Find insert index to keep array sorted by value from
        // largest to smallest.
        var insertAt = -1;
        for (var i = 0; i < listeners.length; i++) {
            if (value > listeners[i].value) {
                insertAt = i;
                break;
            }
        }
        // Note: Binary search could potentially be used,
        // but a single component isn't expected to have a
        // large amount of listeners, so this should suffice.
        // Insert into the correct index to keep the array sorted by value
        if (insertAt === -1) {
            listeners.push(entry);
        }
        else {
            listeners.splice(insertAt, 0, entry);
        }
    };
    return Component;
})();
/**
 * Manages the state of the various achievements in the game.
 */
var AchievementTracker = (function () {
    function AchievementTracker(game) {
        this.totalUnlocked = new Component(0);
        this.totalAchievements = new Component(0);
        this.game = game;
        this.createAchievements();
    }
    AchievementTracker.prototype.createAchievements = function () {
        var game = this.game;
        this.create("Gold Digger", "gold_coin.png", game["totalGoldEarned"], 1e4, "Earn {$} gold.");
        this.create("Golden Touch", "golden_touch.png", game["totalGoldMined"], 1e4, "Mine {$} gold by clicking on the gold mine.");
        this.create("Alchemist's Bane", "transmute.png", game["totalGoldEarned"], 1e6, "Earn {$} gold.");
        this.create("Longevity", "longevity.png", game["totalTimePlayed"], 5 * 3600 * 1000, "Play for {$}.", $.timeSpan);
    };
    /**
     * Creates a new achievement.
     */
    AchievementTracker.prototype.create = function (name, icon, cmp, value, description, formatter) {
        var _this = this;
        // Create the element representing the achievement
        var element = document.createElement("div");
        element.className = "achievement";
        element.innerHTML = "<span class='achievement-mask'></span>";
        element.style.backgroundImage = "url('resources/" + icon + "')";
        $.id("achievement-container").appendChild(element);
        // The state of the achievement
        var isUnlocked = false;
        // Default formatter, if none was specified
        if (!formatter) {
            formatter = $.commify;
        }
        // Show description in tooltip
        description = description.replace("{$}", "<span style='color: #ff7700;'>" + formatter(value) + "</span>");
        Tooltip.attachFunc(element, function () {
            // Text that appears in the tooltip of the achievement.
            // Kinda messy, but works fine...
            var progress;
            if (isUnlocked) {
                progress = "<div style=\"font-size: 16px; margin-top: 8px; color: #22cc22;\">Unlocked</div>";
            }
            else {
                var pp = formatter(cmp.val) + " / " + formatter(value);
                var pctWidth = (100 * cmp.val / value);
                progress = ("<div style=\"margin-top: 8px;color: #999999; font-size: 11px;\">Progress: [" + Math.floor(pctWidth) + "%]&nbsp;&nbsp;" + pp + "</div>")
                    + "<div style=\"margin-top: 7px; height: 5px; background-color: #770000\">"
                    + ("<div style=\"width: " + pctWidth + "%; height: 100%; background-color: #229922;\"></div>")
                    + "</div>";
            }
            return ("<div style=\"margin-bottom: 8px; font-size: 18px; color: #ff7700;\">" + name + "</div>")
                + ("<div style=\"font-size: 12px; color: #cccccc;\">" + description + "</div>")
                + ("" + progress);
        });
        // Add listener to component
        cmp.whenReached(value, function () {
            // Add the unlocked achievement class
            element.className += " achievement-unlocked";
            // Clear the 'locked achievement' mask
            element.innerHTML = "";
            // Mark as unlocked
            isUnlocked = true;
            console.log("Achievement unlocked:", name);
            // Increment unlocked achievement count
            _this.totalUnlocked.val++;
        });
        // Increment total achievement count
        this.totalAchievements.val++;
    };
    return AchievementTracker;
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
        this.incomeUpgradePrice = new Component(10);
        // Amount of gold earned by clicking the gold mine once.
        this.goldPerClick = new Component(1);
        // Current level of the gold per click upgrade.
        this.clickLevel = new Component(1);
        // Amount of gold required to upgrade the gold per click to the next level.
        this.clickUpgradePrice = new Component(10);
        // Total amount of gold earned throughout the game (from all sources).
        this.totalGoldEarned = new Component(0);
        // Total amount of gold earned exclusively by clicking the gold mine.
        this.totalGoldMined = new Component(0);
        // Total number of times the player has clicked the gold mine.
        this.totalClicks = new Component(0);
        // Total time that has been accounted for by the game loop.
        // Basically this is the total amount of time played, not including time between sessions.
        this.totalTimePlayed = new Component(0, $.timeSpan);
        // Used to display the current frame rate
        this.frameTime = 0;
        this.frameCount = 0;
        this.frameRate = new Component(0);
        storage.bindCmp("gd", this.gold);
        storage.bindCmp("tg", this.totalGoldEarned);
        storage.bindCmp("tm", this.totalGoldMined);
        storage.bindCmp("tc", this.totalClicks);
        storage.bindCmp("tt", this.totalTimePlayed);
        storage.bind("cp", function (data) {
            data >>>= 0;
            while (data-- > 1) {
                _this.tryUpgradeIncome(true);
            }
        }, function () { return _this.incomeLevel.val; });
        storage.bind("il", function (data) {
            data >>>= 0;
            while (data-- > 1) {
                _this.tryUpgradeClick(true);
            }
        }, function () { return _this.clickLevel.val; });
        // VVVVV Needs work! VVVVV
        var upgIncomeBtn = new Button("upgrade-income-button", "#33cc33", "#ee2222");
        this.gold.addValueListener(function () { return upgIncomeBtn.setState(_this.gold.val >= _this.incomeUpgradePrice.val); });
        var upgClickBtn = new Button("upgrade-click-button", "#33cc33", "#ee2222");
        this.gold.addValueListener(function () { return upgClickBtn.setState(_this.gold.val >= _this.clickUpgradePrice.val); });
        /*this.gold.addValueListener(() => {
            $.id("upgrade-income-button").style.backgroundColor
                = (this.gold.val >= this.incomeUpgradePrice.val) ? "#33cc33" : "#ee2222";
        });
        this.gold.addValueListener(() => {
            $.id("upgrade-click-button").style.backgroundColor
                = (this.gold.val >= this.clickUpgradePrice.val) ? "#33cc33" : "#ee2222";
        });*/
        $.id("gold-mine").addEventListener("click", function () { return _this.clickGoldMine(); });
        $.id("upgrade-income-button").addEventListener("click", function () { return _this.tryUpgradeIncome(false); });
        $.id("upgrade-click-button").addEventListener("click", function () { return _this.tryUpgradeClick(false); });
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
        var income = this.goldPerClick.val;
        this.earnGold(income);
        this.totalGoldMined.val += income;
        this.totalClicks.val++;
    };
    /**
     * Upgrades the player's passive income, if he has enough gold.
     */
    Game.prototype.tryUpgradeIncome = function (forFree) {
        if (!forFree) {
            if (this.gold.val < this.incomeUpgradePrice.val) {
                // Not enough gold
                return;
            }
            this.gold.val -= this.incomeUpgradePrice.val;
        }
        this.income.val = Math.floor(this.income.val * 1.1 + 1);
        this.incomeLevel.val++;
        this.incomeUpgradePrice.val *= 1.2;
    };
    /**
     * Upgrades the player's gold per click, if he has enough gold.
     */
    Game.prototype.tryUpgradeClick = function (forFree) {
        if (!forFree) {
            if (this.gold.val < this.clickUpgradePrice.val) {
                // Not enough gold
                return;
            }
            this.gold.val -= this.clickUpgradePrice.val;
        }
        this.goldPerClick.val = Math.floor(this.goldPerClick.val * 1.1 + 1);
        this.clickLevel.val++;
        this.clickUpgradePrice.val *= 1.2;
    };
    Game.prototype.update = function (elapsedMS) {
        this.earnGold(this.income.val * (elapsedMS / 1000));
        this.totalTimePlayed.val += elapsedMS;
        this.frameCount++;
        this.frameTime += elapsedMS;
        if (this.frameTime >= 1000) {
            this.frameRate.val = (this.frameCount * 1000 / this.frameTime);
            this.frameTime = 0;
            this.frameCount = 0;
        }
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
        var achievements = new AchievementTracker(game);
        var view = new HtmlView();
        view.define("game", game);
        view.define("achievements", achievements);
        view.parseHtml();
        view = null; // No more use of the view object
        // Start the game loop at 30 fps
        var tooltipTimer = 0;
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
                storage.saveCurrentState();
            }
            // Update the tooltip twice a second
            tooltipTimer += elapsedMS;
            if (tooltipTimer >= 500) {
                tooltipTimer = 0;
                Tooltip.update();
            }
            // Render
            Display.render();
        }, 1000 / 30);
    }
})();
/// <reference path="define.ts" />
/// <reference path="utils/utils.ts" />
/// <reference path="utils/Assert.ts" />
/// <reference path="utils/Tooltip.ts" />
/// <reference path="utils/StorageDevice.ts" />
/// <reference path="graphics/Display.ts" />
/// <reference path="graphics/DisplayNode.ts" />
/// <reference path="graphics/HtmlView.ts" />
/// <reference path="graphics/Button.ts" />
/// <reference path="Component.ts" />
/// <reference path="AchievementTracker.ts" />
/// <reference path="Game.ts" />
/// <reference path="main.ts" />
//# sourceMappingURL=game.js.map