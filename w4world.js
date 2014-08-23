'use strict';

/*global game*/
/*global Image*/

var w4 = w4 || {};

var world = game.namespace('world', w4);

world.constants = {ydir: 0, // named constants for gravity direction
                   xdir: 1}

world.World = function (x0, y0, w, h, num) {
    var tSize = w4.constants.tileSize;

    this.x0 = x0;
    this.y0 = y0;
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
            cell;

        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.drawImage(this.arrowImage, this.width / 2 - this.arrowImage.width / 2, this.height / 2 - this.arrowImage.height / 2);
        /* draw the tiles */
        ctx.fillStyle = "#98ABFD";
        for (y = 0; y < this.th; y += 1) {
            for (x = 0; x < this.tw; x += 1) {
                cell = this.tileToValue(x, y);
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
    }

    this.tileToValue = function (x, y) {
        return this.celldata[x + (y * this.tw)];
    };

    this.pixelToTile = function (p) {
        return Math.floor(p / w4.constants.tileSize);
    };

    // this handles (i) -ve x and y values (ii) x and y values greater
    // than or equal to this.tw, this.th i.e. the adjacent world
    this.getGlobalTile = function (x, y) {
        var indx = x,
            indy = y;
        // world 0 is fine
        if (this.num == 1) {
            if (x < 0) {
                indx = x + this.tw;
            }
            if (y >= this.th) {
                indx = x + this.tw;
            }
        } else if (this.num == 2) {
            if (x < 0) {
                indx = x + this.tw;
                indy = y + this.th;
            }
        } else if (this.num == 3) {
            if (x >= this.tw) {
                indy = y + this.th;
            }
        }
        return {x: indx, y: indy};
    };

    this.globalTileToValue = function (x, y) {
        return this.levelData[x + (y * 2 * this.tw)];
    }

    this.tileHitbox = function (x, y) {
        var hitBox = null,
            val,
            t,
            xv,
            yv;

        if (x < this.tw && x >= 0 && y < this.th && y >= 0) {
            val = this.tileToValue(x, y);
            if (val > 0) {
                hitBox = {x: x * tSize,
                          y: y * tSize,
                          width: tSize,
                          height: tSize};
            }
        } else {
            // edge cases, at boundary of the world
            t = this.getGlobalTile(x, y);
//            console.log(t);
            val = this.globalTileToValue(t.x, t.y);
            if (val > 0) {
                if (t.x < 0) {
                    xv = 0;
                } else if (t.x >= this.tw) {
                    xv = this.tw * tSize;
                } else {
                    xv = x * tSize;
                }
                if (t.y < 0) {
                    yv = 0;
                } else if (t.y >= this.ty) {
                    yv = this.th * tSize;
                } else {
                    yv = y * tSize;
                }
                hitBox = {x: xv,
                          y: yv,
                          width: tSize,
                          height: tSize};
            }
        }
        return hitBox;
    };

    this.loadLevel = function (levelData) {
        var i,
            j,
            tw = w4.constants.totalTileWidth,
            start = (this.y0 / tSize) * tw + this.x0 / tSize,
            index;

        // store complete level data for 'ghosting'
        this.levelData = levelData;

        for (j = 0; j < this.th; j += 1) {
            for (i = 0; i < this.tw; i += 1) {
                index = start + (j * tw) + i;
                this.celldata.push(levelData[index]);
            }
        }
    };

    this.update = function (dt) {
        if (this.hasPlayer) {
            w4.player.player.update(this, dt);
        }
    };

};
