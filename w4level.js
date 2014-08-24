var w4 = w4 || {};

var level = game.namespace('level', w4);

level.Level = function (ldata) {
    var tSize = w4.constants.tileSize,
        nTilesX = w4.constants.totalTileWidth,
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

    this.getTileValue = function(tX, tY) {
        return this.cellData[tX + tY * nTilesX];
    };
};

level.currentLevel = null;
