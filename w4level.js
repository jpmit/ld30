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
    level.currentLevel.resetPlayerPosition();
    
    // the door
    level.doorSprite = new w4.sprite.Sprite("images/door.png", doorX, doorY, 10, 10);
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

    this.resetPlayerPosition = function () {
        w4.player.player.setPosition(level.playerPosition.x, level.playerPosition.y);
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
