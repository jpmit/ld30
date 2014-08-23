// game.js
// Copyright (c) James Mithen 2014.
// Basic javascript game engine

'use strict';
/*jslint browser:true */

var game = {};

// adapted from the book 'Javascript Design Patterns' by Stefanov
game.namespace = function (ns_string, par) {
    var parts = ns_string.split('.'),
        parent = par || game,
        i;

    // strip redundant leading global
    if (parts[0] === "game") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        // create a property if it doesn't exist
        if (parent[parts[i]] === undefined) {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

// game constants (these should not modified during game)
game.namespace('constants');
game.constants = {
    screenWidth: 800,
    screenHeight: 600,
    // frames per second for the logic (and the rendering if
    // RequestAnimationFrame is not supported)
    fps: 40,
};

game.namespace('key');

// track pressed keys
game.key.keys = {
    // normal arrow keys
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    // ctrl
    CTRL: 17,
    // shift
    SHIFT: 32,
    // return key
    RETURN: 13,
    SPACE: 32,
};

// pressed stores keycode as key, boolean as value
game.key.pressed = {};
// array storing all used key codes
game.key.allkeys = [];
// store events (clear this every frame)
game.key.events = [];

game.key.allkeys = (function () {
    var pl, k, i, allkeys, parray;
    allkeys = [];
    parray = [game.key.keys];
    for (i = 0; i !== parray.length; i += 1) {
        pl = parray[i];
        for (k in pl) {
            if (pl.hasOwnProperty(k)) {
                allkeys.push(pl[k]);
            }
        }
    }
    return allkeys;
}());

// initialisation of pressed keys
(function () {
    /*jslint browser:true */
    var i,
        akeys = game.key.allkeys;
    // set all pressed to False
    for (i = 0; i < akeys.length; i += 1) {
        game.key.pressed[akeys[i]] = false;
    }

    // handle any user input
    function inputListener(e) {
        var kc, down;
        kc = e.keyCode;
        down = e.type === "keydown" ? true : false;
        if ((!down) || (down && game.key.pressed[kc] === false)) {
            game.key.pressed[kc] = down;
        }
        // events list
        game.key.events.push({'down': down,
                              'kc': kc});
        e.preventDefault();
    }

    window.addEventListener("keydown", inputListener, false);
    window.addEventListener("keyup", inputListener, false);
}());

// game scenes used in main loop
game.namespace('scene');
game.scene.BaseScene = function () {
    this.next = this;

    this.update = function (dt) {
        return dt;
    };

    this.draw = function () {
    };

    this.processInput = function () {
    };
}

game.main = (function () {
    var then = Date.now(),
        currentScene = new game.scene.BaseScene();

    // called by window.onload
    function start(startScene) {
        var mainDraw;

        currentScene = startScene || currentScene,

        // requestAnimationFrame
        window.requestAnimFrame = window.requestAnimationFrame || window.msRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                                  window.oRequestAnimationFrame;

        // we use setInterval for the logic, and requestAnimationFrame
        // for the *drawing only*. If requestAnimationFrame is not
        // supported, the entire game loop is executed by a single
        // setTimeout call (hence why we don't have a setTimeout
        // fallback above).
        mainDraw = window.requestAnimFrame ? currentScene.draw : function () { return; };

        // logic only (and draw if requestAnimationFrame not supported)
        function main() {
            var now = Date.now(),
                // time elapsed since last tick in s
                dt = (now - then) / 1000;
            currentScene.processInput();
            currentScene.update(dt);
            mainDraw();
            // possible scene change
            currentScene = currentScene.next;
            then = now;
        }

        window.setInterval(main, 1000 / game.constants.fps);

        function keepDrawing() {
            currentScene.draw();
            window.requestAnimFrame(keepDrawing);
        }

        if (window.requestAnimFrame) {
            window.requestAnimFrame(keepDrawing);
        }
    }

    // public API
    return {start: start,
            };
}());
