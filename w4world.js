'use strict';

/*global game*/
/*global Image*/

var w4 = w4 || {};

var world = game.namespace('world', w4);

world.constants = {ydir: 0, // named constants for gravity direction
                   xdir: 1};

world.World = function (x0, y0, w, h, num) {
    var tSize = w4.constants.tileSize;

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

    this.drawBackground = function (ctx) {
        var x,
            y,
            level = w4.level.currentLevel,
            cell;

        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.drawImage(this.arrowImage, this.width / 2 - this.arrowImage.width / 2,
                      this.height / 2 - this.arrowImage.height / 2);
        /* draw the tiles */
        ctx.fillStyle = w4.level.tileGrd;
        for (y = 0; y < this.th; y += 1) {
            for (x = 0; x < this.tw; x += 1) {
                cell = level.getTileValue(x + this.tx0, y + this.ty0);
                if (cell) {
                    ctx.fillRect(x * tSize, y * tSize, tSize, tSize);
                }
            }
        }
    };

    this.drawForeground = function (ctx) {
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
                      height: tSize
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
