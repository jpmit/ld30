// w4.js
// Copyright (c) James Mithen 2014.
// My entry for Ludum Dare 30.

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
    bgColors: ["#F2F1E5", "#DDDBB6", "#CCC97F", "#ECE89E"],
    gravityDir: ["down", "right", "left", "up"],
    arrowImages: ["arrowdown.png", "arrowright.png", "arrowleft.png", "arrowup.png"],
    /* physics constants (for the normal axes) */
    gravity: 1000,
    maxdx: 150,
    maxdy: 400,
    accel: 4000,
    friction: 500,
    impulse: 24000
};

w4.mainScene = function () {
    var canvas = document.getElementById("w4"),
        ctx = canvas.getContext('2d'),
        w = w4.constants.worldWidth,
        h = w4.constants.worldHeight,
        worlds = [new w4.world.World(0, 0, w, h, 0), new w4.world.World(w, 0, w, h, 1),
                   new w4.world.World(w, h, w, h, 2), new w4.world.World(0, h, w, h, 3)],
        nWorlds = w4.constants.nWorlds,
        tStep = 1 / game.constants.fps;

    this.next = this;

    canvas.width = 2 * w4.constants.worldWidth;
    canvas.height = 2 * w4.constants.worldHeight;
    ctx = canvas.getContext('2d');

    this.update = function (dt) {
        var i,
            wWidth = w4.constants.worldWidth,
            wHeight = w4.constants.worldHeight,
            player = w4.player.player,
            prevWorldIn = player.worldIn,
            worldIn,
            wo,
            xshift = 0, // xshift and yshift tell us how to get to global co-ords from world co-ords
            yshift = 0,
            xshift2 = 0,
            yshift2 = 0;

        /* assign the player to the correct world */
        worldIn = this.assignToWorld(player);
        if (worldIn === 1 || worldIn === 2) {
            xshift = -wWidth;
        }
        if (worldIn === 2 || worldIn === 3) {
            yshift = -wHeight;
        }

        if (worldIn !== prevWorldIn) {
            w4.jukebox.playSfx('switch');
            // compute relative
            if ((prevWorldIn === 0 || prevWorldIn === 3) && (worldIn == 1 || worldIn == 2)) {
                // moving 1 to the right
                xshift2 = -wWidth;
            } else if ((prevWorldIn == 1 || prevWorldIn == 2) && (worldIn == 0 || worldIn == 3)) {
                // moving 1 to the left
                xshift2 = wWidth;
            }
            if ((prevWorldIn === 0 || prevWorldIn === 1) && (worldIn ==  2 || worldIn == 3)) {
                // moving 1 down
                yshift2 = -wHeight;
            } else if ((prevWorldIn == 2 || prevWorldIn == 3) && (worldIn == 0 || worldIn == 1)) {
                // moving 1 up
                yshift2 = wHeight;
            }
            
            player.worldIn = worldIn;
            player.setAngle(worlds[worldIn]);
//            console.log(player.hitbox.x, player.hitbox.y);
            player.hitbox.x = player.hitbox.x + xshift2;
            player.hitbox.y = player.hitbox.y + yshift2;
            //console.log(player.hitbox.x, player.hitbox.y, xshift2, yshift2);
        }

//        console.log(player.worldIn);
        
        /* note the constant time stepping here!!! */
        while (game.dt > tStep) {
            game.dt = game.dt - tStep;
            for (i = 0; i < nWorlds; i += 1) {
                worlds[i].update(tStep);
            }
        }

        /* update the global co-ords of the player */
        player.globalRect.x = player.rect.x - xshift;
        player.globalRect.y = player.rect.y - yshift;

        return dt;
    };

    this.assignToWorld = function (player) {
        var pos = player.getBottomRight(),
            worldIn,
            i;

        /* worlds are ordered anti-clockwise from top left */
        if (pos[0] > w4.constants.worldWidth) {
            if (pos[1] > w4.constants.worldHeight) {
                worldIn = 2;
            } else {
                worldIn = 1;
            }
        } else if (pos[1] > w4.constants.worldHeight) {
            worldIn = 3;
        } else {
            worldIn = 0;
        }

        for (i = 0; i < nWorlds; i += 1) {
            if (i === worldIn) {
                worlds[i].hasPlayer = true;
            } else {
                worlds[i].hasPlayer = false;
            }
        }

        return worldIn;
    };

    this.loadLevel = function (num) {
        var ldata =  w4.leveldata[num.toString()],
            celldata = ldata.layers[0].data,
            i;

        /* player should eventually be loaded from json data */
        w4.player.player = new w4.sprite.PhysicsSprite(20, 20, 50, 50);

        for (i = 0; i < nWorlds; i += 1) {
            worlds[i].loadLevel(celldata);
        }
    };

    this.draw = function () {
        var i,
            wor;

        for (i = 0; i < nWorlds; i += 1) {
            wor = worlds[i];
            ctx.save();
            ctx.translate(wor.x0, wor.y0);
            wor.drawBackground(ctx);
            ctx.restore();
        }
        for (i = 0; i < nWorlds; i += 1) {
            wor = worlds[i];
            ctx.save();
            ctx.translate(wor.x0, wor.y0);
            wor.drawForeground(ctx);
            ctx.restore();
        }
    };

};

w4.mainScene.prototype = new game.scene.BaseScene();
