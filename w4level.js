'use strict';
/*global game*/

var w4 = w4 || {};

var level = game.namespace('level', w4);

level.loadLevel = function (num) {
    var ldata =  w4.leveldata[num.toString()],
        doorObj = ldata.layers[1].objects[0],
        doorX = doorObj.x,
        doorY = doorObj.y,
        playerObj = ldata.layers[1].objects[1],
        playerX = playerObj.x,
        playerY = playerObj.y;

    level.currentLevel = new w4.level.Level(ldata);

    level.playerPosition = {x: playerX, y: playerY};
    level.currentLevel.resetPlayer();
    
    // the door
    level.doorSprite.setPosition(doorX, doorY);
};

level.Level = function (ldata) {
    var nTilesX = w4.constants.totalTileWidth,
        nTilesY = w4.constants.totalTileHeight;

    this.cellData = ldata.layers[0].data;

    this.globalTileIndexPeriodic = function (worldtX, worldtY, worldtX0, worldtY0) {
        var globalPos = [worldtX + worldtX0, worldtY + worldtY0];

        // periodic boundaries
        if (globalPos[0] < 0) {
            globalPos[0] = globalPos[0] + nTilesX;
        } else if (globalPos[0] >= nTilesX) {
            globalPos[0] = globalPos[0] - nTilesX;
        }
        if (globalPos[1] < 0) {
            globalPos[1] = globalPos[1] + nTilesY;
        } else if (globalPos[1] >= nTilesY) {
            globalPos[1] = globalPos[1] - nTilesY;
        }
        return globalPos;
    };

    this.getTileValue = function (tX, tY) {
        return this.cellData[tX + tY * nTilesX];
    };

    this.resetPlayer = function () {
        var wWidth = w4.constants.worldWidth,
            wHeight = w4.constants.worldHeight,
            player = w4.player.player,
            pX = level.playerPosition.x,
            pY = level.playerPosition.y,
            worlds = w4.world.worlds,
            worldIn,
            i;

        w4.player.player.setPosition(pX, pY);
        // get world number
        if (level.playerPosition.x < wWidth) {
            if (level.playerPosition.y < wHeight) {
                worldIn = 0;
            } else {
                worldIn = 3;
            }
        } else {
            if (level.playerPosition.y < wHeight) {
                worldIn = 1;
            } else {
                worldIn = 2;
            } 
        }
        // set angle and velocities and accels etc.
        player.dy = 0;
        player.ddy = 0;
        player.dx = 0;
        player.ddx = 0;
        player.setAngle(worlds[worldIn]);
        for (i = 0; i < w4.constants.nWorlds; i += 1) {
            if (i === worldIn) {
                worlds[i].hasPlayer = true;
            } else {
                worlds[i].hasPlayer = false;
            }
        }
    };
};

// currentLevel is accessed by other stuff
level.currentLevel = null;

// load the tileset
level.tileImage = null;
(function () {
    var img = new Image();
    img.src = "images/tileset.png";
    img.onload = function () {
        level.tileImage = img;
    }
})();
