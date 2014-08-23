// w4.js
// Copyright (c) James Mithen 2014.
// My entry for Ludum Dare 30.

'use strict';
/*jslint browser:true */

var w4 = {};

w4.constants = {
    nWorlds: 4,
    worldWidth: 480,
    worldHeight: 320
};

w4.World = function (x0, y0, w, h, bgColor) {
    this.x0 = x0;
    this.y0 = y0;
    this.width = w;
    this.height = h;
    this.bgColor = bgColor || "white";

    this.draw = function (ctx) {
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
    }
};

w4.mainScene = function () {
    var canvas = document.getElementById("w4"),
        ctx = canvas.getContext('2d'),
        w = w4.constants.worldWidth,
        h = w4.constants.worldHeight,
        worlds = [new w4.World(0, 0, w, h, "#F2F1E5"), new w4.World(w, 0, w, h, "#DDDBB6"),
                  new w4.World(0, h, w, h, "#ECE89E"), new w4.World(w, h, w, h, "#CCC97F")];

    canvas.width = 2 * w4.constants.worldWidth;
    canvas.height = 2 * w4.constants.worldHeight;
    ctx = canvas.getContext('2d');

    this.draw = function () {
        var i,
            w;
        for (i = 0; i < w4.constants.nWorlds; i += 1) {
            w = worlds[i];
            ctx.save();
            ctx.translate(w.x0, w.y0);
            w.draw(ctx);
            ctx.restore();
        }
    };

};

w4.mainScene.prototype = new game.scene.BaseScene();
