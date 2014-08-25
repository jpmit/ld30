// w4world.js
// Copyright (c) James Mithen 2014.

'use strict';
/*global game*/
/*global Image*/
/*global w4*/
/*jslint browser:true*/

var w4 = w4 || {};

var world = game.namespace('world', w4);

world.constants = {ydir: 0, // named constants for gravity direction
                   xdir: 1};

world.World = function (x0, y0, w, h, num) {
    var backCanvas = document.createElement('canvas'),
        backCtx = backCanvas.getContext('2d'),
        tSize = w4.constants.tileSize;

    this.rect = {x: x0, y: y0, width: w, height: h};

    this.x0 = x0;
    this.y0 = y0;
    this.tx0 = x0 / tSize;
    this.ty0 = y0 / tSize;
    this.num = num;
    this.width = w;
    this.height = h;
    this.tw = w / tSize;
    this.th = h / tSize;
    this.bgColor = w4.constants.bgColors[num];
    this.celldata = []; // need to call loadLevel to get celldata
    this.arrowImage = new Image();
    this.arrowImage.src = "images/" + w4.constants.arrowImages[num];

    this.hasPlayer = false;

    // set gravity for the world
    if (this.num === 0) {
        this.gravity = w4.constants.gravity;
        this.impulse = -w4.constants.impulse;
        this.gravityDir = world.constants.ydir;
    } else if (this.num === 1) {
        this.gravity = w4.constants.gravity;
        this.impulse = -w4.constants.impulse;
        this.gravityDir = world.constants.xdir;
    } else if (this.num === 2) {
        this.gravity = -w4.constants.gravity;
        this.impulse = w4.constants.impulse;
        this.gravityDir = world.constants.xdir;
    } else if (this.num === 3) {
        this.gravity = -w4.constants.gravity;
        this.impulse = w4.constants.impulse;
        this.gravityDir = world.constants.ydir;
    }

    // render the entire background to my own canvas (called once)
    this.renderBackground = function () {
        var x,
            y,
            level = w4.level.currentLevel,
            tVal,
            tx,
            ty,
            tImage = w4.level.tileImage;

        backCanvas.width = w4.constants.worldWidth;
        backCanvas.height = w4.constants.worldHeight;

        backCtx.fillStyle = this.bgColor;
        backCtx.fillRect(0, 0, this.width, this.height);

        // draw the tiles
        backCtx.fillStyle = w4.level.tileGrd;
        for (y = 0; y < this.th; y += 1) {
            for (x = 0; x < this.tw; x += 1) {
                tVal = level.getTileValue(x + this.tx0, y + this.ty0);
                if (tVal > 0) {
                    if (tVal === 1) {
                        // actual level; we don't use a tile for this,
                        // but just a rect since that gives us this
                        // nice? looking gradient.
                        backCtx.fillRect(x * tSize, y * tSize, tSize, tSize);
                    } else {
                        // the tileset is 2 * 3 but top left index is 1
                        tx = ((tVal - 1) % 2);
                        ty = Math.floor((tVal - 1) / 2);
                        // use a tile image
                        backCtx.drawImage(tImage, tx * tSize, ty * tSize, tSize, tSize, x * tSize, y * tSize, tSize, tSize);
                    }
                }
            }
        }
    };

    this.drawBackground = function (ctx) {
        // easy!
        ctx.drawImage(backCanvas, 0, 0);
    };

    this.drawForeground = function (ctx) {
        ctx.drawImage(this.arrowImage, this.width / 2 - this.arrowImage.width / 2,
                          this.height / 2 - this.arrowImage.height / 2);
        if (this.hasPlayer) {
            w4.player.player.draw(ctx);
        }
    };

    this.pixelToTile = function (p) {
        return Math.floor(p / w4.constants.tileSize);
    };

    // x and y are local (world) tile co-ords here
    this.tileHitbox = function (x, y) {
        var level = w4.level.currentLevel,
            hitBox = null,
            tileIndx,
            xGlob,
            yGlob,
            xWorld,
            yWorld,
            tval;

        // get the global tile index, which takes account for periodic bcs
        tileIndx = level.globalTileIndexPeriodic(x, y, this.tx0, this.ty0);

        // get the tile value
        tval = level.getTileValue(tileIndx[0], tileIndx[1]);

        // could have different size hitboxes for different tiles here
        if (tval > 0) {
            xGlob = tileIndx[0] * tSize;
            yGlob = tileIndx[1] * tSize;
            // we need to return the position of the tile in local co-ords
            xWorld = xGlob - this.x0;
            yWorld = yGlob - this.y0;

            hitBox = {x : xWorld,
                      y: yWorld,
                      width: tSize,
                      height: tSize,
                      isSpike: tval > w4.constants.spikeTileVal ? true : false
                     };
        }

        return hitBox;
    };

    this.update = function (dt) {
        if (this.hasPlayer) {
            w4.player.player.update(this, dt);
        }
    };

};
