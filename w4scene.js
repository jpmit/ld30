'use strict';
/*global game*/

var w4 = w4 || {};

var scene = game.namespace('scene', w4);

scene.mainScene = function (lnum) {
    var ctx = w4.screen.ctx,
        w = w4.constants.worldWidth,
        h = w4.constants.worldHeight,
        worlds = [new w4.world.World(0, 0, w, h, 0), new w4.world.World(w, 0, w, h, 1),
                   new w4.world.World(w, h, w, h, 2), new w4.world.World(0, h, w, h, 3)],
        nWorlds = w4.constants.nWorlds,
        tStep = 1 / game.constants.fps;

    this.next = this;

    w4.level.loadLevel(lnum);

    this.update = function (dt) {
        var i,
            wWidth = w4.constants.worldWidth,
            wHeight = w4.constants.worldHeight,
            player = w4.player.player,
            prevWorldIn = player.worldIn,
            worldIn,
            wi,
            xshift = 0, // xshift and yshift tell us how to get to global co-ords from world co-ords
            yshift = 0,
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

scene.mainScene.prototype = new game.scene.BaseScene();
