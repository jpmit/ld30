// w4.js
// Copyright (c) James Mithen 2014.
// w4 is my entry for Ludum Dare 30.

'use strict';
/*jslint browser:true */
/*global w4*/
/*global game*/

var w4 = w4 || {};

w4.constants = {
    nWorlds: 4,
    worldWidth: 480,
    worldHeight: 320,
    tileSize: 16,
    totalTileWidth: 60,
    totalTileHeight: 40,
    // all tiles in the cell data with values greater than spikeTile
    // are treated as spikes
    spikeTileVal: 2,
    bgColors: ["#F2F1E5", "#DDDBB6", "#CCC97F", "#ECE89E"],
    gravityDir: ["down", "right", "left", "up"],
    arrowImages: ["arrowdown.png", "arrowright.png", "arrowleft.png", "arrowup.png"],
    // physics constants (for the normal axes)
    gravity: 1000,
    maxdx: 150,
    maxdy: 300,
    accel: 4000,
    friction: 500,
    impulse: 24000
};

w4.constants.globWidth = 2 * w4.constants.worldWidth;
w4.constants.globHeight = 2 * w4.constants.worldHeight;

w4.screen = {};
w4.player = {};
w4.jukebox = null;

w4.init = function () {
    var startScene,
        w = w4.constants.worldWidth,
        h = w4.constants.worldHeight;

    w4.screen.canvas = document.getElementById("w4");
    w4.screen.canvas.width = 2 * w4.constants.worldWidth;
    w4.screen.canvas.height = 2 * w4.constants.worldHeight;

    w4.screen.ctx = w4.screen.canvas.getContext("2d");

    // gradient for drawing the levels
    w4.level.tileGrd = w4.screen.ctx.createLinearGradient(0, 100, 150, 0);
    w4.level.tileGrd.addColorStop(0, "#00051D");
    w4.level.tileGrd.addColorStop(1, "#A2ABD4");

    // num times the player has been spiked
    w4.level.nDeath = 0;

    w4.level.doorSprite = new w4.sprite.Sprite("images/door.png", -100, -100, 10, 10);

    // number of levels in the game (zeroth level is for testing ;)
    w4.constants.numLevels = Object.keys(w4.leveldata).length - 1;

    // the four worlds
    w4.world.worlds = [new w4.world.World(0, 0, w, h, 0), new w4.world.World(w, 0, w, h, 1),
                       new w4.world.World(w, h, w, h, 2), new w4.world.World(0, h, w, h, 3)];

    w4.jukebox = new game.juke.Juke();
    w4.jukebox.loadMusic({'main': 'sounds/song1'});
    w4.jukebox.loadSfx({'complete': 'sounds/complete',
                        'jump': 'sounds/jump',
                        'spike': 'sounds/spike',
                        'switch': 'sounds/switch',
                        'nice': 'sounds/nice',
                        'applause': 'sounds/applause',
                        'advance': 'sounds/advance'
                       });
    w4.jukebox.playMusic('main');

    w4.player.player = new w4.sprite.PhysicsSprite("images/w.png");
    w4.player.worldIn = 0;

    startScene = new w4.scene.titleScene();
    game.main.start(startScene);
};
