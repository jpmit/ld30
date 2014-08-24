'use strict';
/*global game*/

var w4 = w4 || {};

var scene = game.namespace('scene', w4);

scene.mainScene = function (lnum) {
    var ctx = w4.screen.ctx,
        worlds = w4.world.worlds,
        nWorlds = worlds.length,
        tStep = 1 / game.constants.fps,
        dtTot = 0,
        tutorialFinished = w4.tutorial.hasTutorial(lnum) ? false : true,
        tutorial = new w4.tutorial.tutorialScene(lnum),
        i;

    this.next = this;
    this.lnum = lnum;

    w4.level.loadLevel(this.lnum);
    w4.jukebox.playSfx('nice');

    // draw backgrounds for each of the worlds (since these don't change)
    for (i = 0; i < nWorlds; i += 1) {
        worlds[i].renderBackground(ctx);
    }

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

        if (!tutorialFinished) {
            tutorial.update(dt);
            tutorialFinished = tutorial.isFinished;
            game.dt = 0;
            return;
        }

        // update worlds: this will move the player.
        // note the constant time stepping here!!!
        while (game.dt > tStep) {
            game.dt = game.dt - tStep;
            for (i = 0; i < nWorlds; i += 1) {
                worlds[i].update(tStep);
            }
            dtTot += tStep;
        }

        // assign the player to the correct world
        worldIn = this.assignToWorld(player);

        if (worldIn !== prevWorldIn) {
            w4.jukebox.playSfx('switch');

            // compute local co-ords from the global co-ords
            wi = worlds[worldIn];
            locx = player.globalRect.x - wi.x0;
            locy = player.globalRect.y - wi.y0;
//            console.log(worldIn, prevWorldIn, player.globalRect.x, player.globalRect.y, locx, locy);

            player.worldIn = worldIn;
            player.setAngle(worlds[worldIn]);
            // set the local world coords
            player.hitbox.x = locx;
            player.hitbox.y = locy;
            player.rect.x = locx;
            player.rect.y = locy;
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

        // check if we hit a spike
        if (player.hitSpike) {
            w4.jukebox.playSfx('spike');
            // increment number of deaths here
            w4.level.nDeath += 1;
            w4.level.currentLevel.resetPlayer();
        }

        // check if we completed the level
        if (this.isComplete(player)) {
            this.next = new scene.levelCompleteScene(this);
        }

        // allow escaping back to main menu
        if (game.key.pressed[game.key.keys.ESCAPE]) {
            this.next = new scene.titleScene();
        }

        return dt;
    };

    this.isComplete = function(player) {
        return w4.rect.overlapAABB(player.globalRect, w4.level.doorSprite.hitBox);
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

        // draw the number of deaths
        ctx.font = "15px Shadows Into Light Two";
        ctx.fillStyle = "black";
        ctx.fillText("deaths: " + w4.level.nDeath, 30, 50);

        // and the level number
        ctx.fillText("level " + this.lnum.toString() + " / " + 
                     w4.constants.numLevels.toString(), 30, 65);

        // draw the door sprite
        w4.level.doorSprite.draw(ctx);

        for (i = 0; i < nWorlds; i += 1) {
            wor = worlds[i];
            ctx.save();
            ctx.translate(wor.x0, wor.y0);
            wor.drawForeground(ctx);
            ctx.restore();
        }

        if (!tutorialFinished) {
            tutorial.draw();
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
        line3 = "press space to start",
        k = game.key.keys,
        numKeyCodes = [k.NUM0, k.NUM1, k.NUM2, k.NUM3, k.NUM4,
                       k.NUM5, k.NUM6, k.NUM7, k.NUM8, k.NUM9],
        i;

    this.next = this;

    w4.level.nDeath = 0;

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

        for (i = 0; i < numKeyCodes.length; i += 1) {
            if (game.key.pressed[numKeyCodes[i]]) {
                if (i <= w4.constants.numLevels) {
                    this.next = new scene.mainScene(i);
                }
            }
        }

        game.dt = 0;
    };
};

scene.titleScene.prototype = new game.scene.BaseScene();

scene.gameCompleteScene = function () {
    var ctx = w4.screen.ctx,
        width = w4.screen.canvas.width,
        height = w4.screen.canvas.height,
        line1 = "Game complete!",
        line2 = "Well done!",
        nDeath = w4.level.nDeath,
        line3 = "You died " + nDeath + " times",
        line4 = nDeath > 0 ? "Try for better next time..." : "Perfect!",
        tPassed = 0;

    this.next = this;

    w4.jukebox.playSfx('applause');

    function drawCenteredText(txt, ypos) {
        ctx.fillText(txt, width / 2 - ctx.measureText(txt).width / 2, ypos);
    }
        
    this.draw = function () {
        ctx.fillStyle = "#9CA0FF";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.font = "80px Lobster";
        drawCenteredText(line1, 200);
        ctx.font = "50px Lobster";
        drawCenteredText(line2, 280);
        ctx.font = "40px Lobster";
        drawCenteredText(line3, 380);
        drawCenteredText(line4, 430);
    };

    this.update = function (dt) {
        tPassed += dt;
        if (tPassed > 5) {
            this.next = new scene.titleScene();
        }
        game.dt = 0;
    };
};

scene.gameCompleteScene.prototype = new game.scene.BaseScene();

scene.levelCompleteScene = function (mScene) {
    var oldCanvas = w4.screen.canvas,
        newCanvas = document.createElement('canvas'),
        newctx = newCanvas.getContext('2d'),
        ctx = w4.screen.ctx;

    this.mScene = mScene;
    this.next = this;

    this.nextlev = mScene.lnum + 1;
    this.angle = 0;

    w4.jukebox.playSfx('complete');
    
    // copy the old canvas to the new canvas
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    // apply the old canvas to the new one
    newctx.drawImage(oldCanvas, 0, 0);

    // next scene
//    console.log(this.nextlev, w4.constants.numLevels);
    if (this.nextlev > w4.constants.numLevels) {
        this.nextScene = new scene.gameCompleteScene();
        // immediately change scene
        this.next = this.nextScene;
    } else {
        this.nextScene = new scene.mainScene(this.nextlev);
    }

    this.update = function (dt) {
        this.tPassed += dt;
        if (this.angle > Math.PI / 2) {
            this.next = this.nextScene;
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
