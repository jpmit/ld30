// w4.js
// Copyright (c) James Mithen 2014.
// My entry for Ludum Dare 30.

'use strict';
/*jslint browser:true */

var w4 = w4 || {};

w4.constants = {
    nWorlds: 4,
    worldWidth: 480,
    worldHeight: 320,
    tileSize: 16,
    totalTileWidth: 60,
    totalTileHeight: 40,
    bgColors: ["#F2F1E5", "#DDDBB6", "#CCC97F", "#ECE89E"],
    gravityDir: ["down", "right", "left", "up"],
    arrowImages: ["arrowdown.png", "arrowright.png", "arrowleft.png", "arrowup.png"],

    /* physics constants */
    gravity: 100,
    maxdx: 15,
    maxdy: 60,
    accel: 0.5,
    friction: 1 / 6,
    impulse: 1500
};


w4.mainScene = function () {
    var canvas = document.getElementById("w4"),
        ctx = canvas.getContext('2d'),
        w = w4.constants.worldWidth,
        h = w4.constants.worldHeight,
        worlds = [new w4.world.World(0, 0, w, h, 0), new w4.world.World(w, 0, w, h, 1),
                   new w4.world.World(w, h, w, h, 2), new w4.world.World(0, h, w, h, 3)],
        nWorlds = w4.constants.nWorlds;

    this.next = this;

    canvas.width = 2 * w4.constants.worldWidth;
    canvas.height = 2 * w4.constants.worldHeight;
    ctx = canvas.getContext('2d');

    this.update = function (dt) {
        var i;

        for (i = 0; i < nWorlds; i += 1) {
            worlds[i].update(dt);
        }
    };

    this.loadLevel = function (num) {
        var ldata =  w4.leveldata["" + num],
            celldata = ldata.layers[0].data,
            i;

        // player should eventually be loaded from json data
        w4.player.player = new w4.sprite.PhysicsSprite(20, 30, 50, 50);

        for (i = 0; i < nWorlds; i += 1) {
            worlds[i].loadLevel(celldata);
        }
    };

    this.draw = function () {
        var i,
            w;

        for (i = 0; i < nWorlds; i += 1) {
            w = worlds[i];
            ctx.save();
            ctx.translate(w.x0, w.y0);
            w.draw(ctx);
            ctx.restore();
        }

        /* draw the player */
        w4.player.player.draw(ctx);
    };

};

w4.mainScene.prototype = new game.scene.BaseScene();
