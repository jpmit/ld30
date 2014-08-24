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
    fps: 60,
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
    ESCAPE: 27,
    NUM0: 48,
    NUM1: 49,
    NUM2: 50,
    NUM3: 51,
    NUM4: 52,
    NUM5: 53,
    NUM6: 54,
    NUM7: 55,
    NUM8: 56,
    NUM9: 67
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

// sounds!
game.namespace('juke');

game.juke.constants = {musicVol: 0.4,
                       sfxVol: 0.8,
                      };

game.juke.Juke = function () {
    /*global Audio*/
    var test = new Audio(),
        ext,
        playingMusic = false,
        playingName = "",
        muted = false;

    this.music = {};
    this.sfx = {};

    // it doesn't seem that this type of thing is bulletproof, but
    // there doesn't seem to be a better alternative.
    if (test.canPlayType("audio/ogg") !== "") {
        ext = "ogg";
    } else if (test.canPlayType("audio/mp3") !== "") {
        ext = "mp3";
    }

    function loadAudio(nameMap, store, loop, volume) {
        var k, m;
        for (k in nameMap) {
            if (nameMap.hasOwnProperty(k)) {
                m = new Audio(nameMap[k] + "." + ext);
                m.loop = loop;
                m.volume = volume;
                m.load();
                store[k] = m;
            }
        }
    }

    this.loadMusic = function (musicMap) {
        loadAudio(musicMap, this.music, true, game.juke.constants.musicVol);
    };

    this.loadSfx = function (sfxMap) {
        loadAudio(sfxMap, this.sfx, false, game.juke.constants.sfxVol);
    };

    this.playMusic = function (name) {
        if (!muted && !playingMusic) {
            this.music[name].play();
            playingMusic = true;
            playingName = name;
        }
    };

    this.stopMusic = function () {
        if (playingMusic) {
            this.music[playingName].pause();
            playingMusic = false;
            // just in case
            playingName = "";
        }
    };

    this.playSfx = function (name) {
        if (!muted) {
            this.sfx[name].play();
        }
    };

    this.stopSfx = function (name) {
        this.sfx[name].pause();
        this.sfx[name].currentTime = 0;
    };

    this.mute = function () {
        muted = true;
        this.stopMusic();
    };

    this.unmute = function () {
        muted = false;
        this.playMusic('main');
    };
};

// here's how to create jukebox object for in game audio
//juke.jukebox = new game.juke.Juke();
//juke.jukebox.loadMusic({mapping of names to paths to ogg/mp3 files});
//juke.jukebox.loadSfx({mapping of names to paths to ogg/mp3 files});

// game scenes used in main loop
game.namespace('scene');
game.scene.BaseScene = function () {
    this.next = this;

    this.update = function (dt) {
        return dt;
    };

    this.draw = function () {
        return;
    };

    this.processInput = function () {
        return;
    };
};

game.dt = 0;
game.main = (function () {
    var then = Date.now(),
        currentScene = new game.scene.BaseScene();

    // called by window.onload
    function start(startScene) {
        var mainDraw;

        currentScene = startScene || currentScene;

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
            var now = Date.now();

            // time elapsed since last tick in s
            game.dt += Math.min(1, (now - then) / 1000);
            currentScene.processInput();
            currentScene.update(game.dt);
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
