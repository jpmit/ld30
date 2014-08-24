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
    maxdy: 300,
    accel: 4000,
    friction: 500,
    impulse: 24000
};

w4.constants.globWidth = 2 * w4.constants.worldWidth;
w4.constants.globHeight = 2 * w4.constants.worldHeight;

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

    // gradient for drawing the levels
    w4.constants.grd = ctx.createLinearGradient(0,100,150,0);
    w4.constants.grd.addColorStop(0,"#00051D");//black");
    w4.constants.grd.addColorStop(1,"#A2ABD4");//"grey");

    this.update = function (dt) {
        var i,
            wWidth = w4.constants.worldWidth,
            wHeight = w4.constants.worldHeight,
            player = w4.player.player,
            prevWorldIn = player.worldIn,
            worldIn,
            wi,
            wo,
            xshift = 0, // xshift and yshift tell us how to get to global co-ords from world co-ords
            yshift = 0,
            xshift2 = 0,
            yshift2 = 0,
            locx,
            locy;

        // assign the player to the correct world
        worldIn = this.assignToWorld(player);


        if (worldIn !== prevWorldIn) {
            w4.jukebox.playSfx('switch');

            // compute local co-ords from the global co-ords
            wi = worlds[worldIn];
            locx = player.globalRect.x - wi.x0;
            locy = player.globalRect.y - wi.y0;
            console.log(locx, locy);

            player.worldIn = worldIn;
            player.setAngle(worlds[worldIn]);
            // set the local world coords
            player.hitbox.x = locx;
            player.hitbox.y = locy;
        }
        
        // note the constant time stepping here!!!
        while (game.dt > tStep) {
            game.dt = game.dt - tStep;
            for (i = 0; i < nWorlds; i += 1) {
                worlds[i].update(tStep);
            }
        }

        // shift applied to the local world co-ords (modified by the
        // world update) to get the global co-ords.
        if (worldIn === 1 || worldIn === 2) {
            xshift = -wWidth;
        }
        if (worldIn === 2 || worldIn === 3) {
            yshift = -wHeight;
        }

        player.globalRect.x = player.rect.x - xshift;
        player.globalRect.y = player.rect.y - yshift;

        return dt;
    };

    this.assignToWorld = function (player) {
        var pos = player.getCenter(), // global co-ords
            worldIn,
            gWidth = w4.constants.globWidth,
            gHeight = w4.constants.globHeight,
            inRect = w4.rect.inAABB,
            i;

        /* apply periodic boundary conditions */
        if (pos[0] < 0) {
            pos[0] = pos[0] + gWidth;
        } else if (pos[0] > gWidth) {
            pos[0] = pos[0] - gWidth;
        }
        if (pos[1] < 0) {
            pos[1] = pos[1] + gHeight;
        } else if (pos[1] > gHeight) {
            pos[1] = pos[1] - gHeight;
        }

        player.setCenter(pos);

        for (i = 0; i < nWorlds; i += 1) {
            if (inRect(worlds[i].rect, pos)) {
                worldIn = i;
                break;
            }
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
        var ldata =  w4.leveldata[num.toString()];

        w4.level.currentLevel = new w4.level.Level(ldata);

        // player should eventually be loaded from json data
        w4.player.player = new w4.sprite.PhysicsSprite(20, 20, 50, 50);
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
