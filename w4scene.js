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
        tStep = 1 / game.constants.fps,
        dtTot = 0;

    this.next = this;
    this.lnum = lnum;

    w4.level.loadLevel(this.lnum);

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
            dtTot += tStep;
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

        // check if we completed the level
        if (this.isComplete()) {
            this.next = new scene.levelCompleteScene(this);
        }

        return dt;
    };

    this.isComplete = function() {
        if (dtTot > 2) {
            return true;
        }
    }

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

scene.titleScene = function () {
    var ctx = w4.screen.ctx,
        width = w4.screen.canvas.width,
        height = w4.screen.canvas.height,
        line1 = "W4",
        line2 = "A game for Ludum Dare 30 by jpmit",
        line3 = "press space to start";

    this.next = this;

    function drawCenteredText(txt, ypos) {
        ctx.fillText(txt, width / 2 - ctx.measureText(txt).width / 2, ypos);
    }
        
    this.draw = function () {
        ctx.fillStyle = "#9CA0FF";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.font = "100px Lobster";
        drawCenteredText(line1, 220);
        ctx.font = "30px Lobster";
        drawCenteredText(line2, 290);
        ctx.font = "50px Lobster";
        ctx.fillStyle = "#C93936";
        drawCenteredText(line3, 400);
    };

    this.update = function (dt) {
        if (game.key.pressed[game.key.keys.SPACE]) {
            this.next = new scene.mainScene(1);
        }
        game.dt = 0;
    };
};

scene.titleScene.prototype = new game.scene.BaseScene();

scene.levelCompleteScene = function (mScene) {
    var oldCanvas = w4.screen.canvas,
        newCanvas = document.createElement('canvas'),
        newctx = newCanvas.getContext('2d'),
        ctx = w4.screen.ctx;

    this.mScene = mScene;
    this.next = this;

    this.tPassed = 0.0;
    this.nextlev = mScene.lnum + 1;
    this.nextTime = 10;
    this.niceTime = 1;
    this.playedNice = false;
    this.angle = 0;

    w4.jukebox.playSfx('complete');
    
    // copy the old canvas to the new canvas
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    // apply the old canvas to the new one
    newctx.drawImage(oldCanvas, 0, 0);

    // next scene
    this.nextScene = new scene.mainScene(this.nextlev);

    this.update = function (dt) {
        this.tPassed += dt;
        if (this.angle > Math.PI / 2) {
            this.next = this.nextScene;
        }
        if (this.tPassed > this.niceTime && (!this.playedNice)) {
            this.playedNice = true;
            w4.jukebox.playSfx('nice');
        }

        this.angle = this.angle + dt;

        // we have to do this unfortunately
        game.dt = 0;
    };

    // some random and entertaining (?) thing I can create in 10 mins ;)
    this.draw = function ( ) {
        this.nextScene.draw();
        ctx.save();
        ctx.rotate(this.angle);
        ctx.drawImage(newCanvas, 0, 0);
        ctx.restore();
    };
};

scene.levelCompleteScene.prototype = new game.scene.BaseScene();
