var w4 = w4 || {};

var world = game.namespace ('world', w4);

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

    this.draw = function (ctx) {
        var x,
            y,
            cell;

        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.drawImage(this.arrowImage, this.width / 2 - this.arrowImage.width / 2, this.height / 2 - this.arrowImage.height / 2);
        // draw the tiles
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

    this.tileToValue = function (x, y) {
        return this.celldata[x + (y * this.tw)];
    };

    this.loadLevel = function (levelData) {
        var i,
            j,
            tw = w4.constants.totalTileWidth,
            th = w4.constants.totalTileHeight,
            tSize = w4.constants.tileSize,
            start = (this.y0 / tSize) * tw + this.x0 / tSize ;
        for (j = 0; j < this.th; j += 1) {
            for (i = 0; i < this.tw; i += 1) {
                index = start + (j * tw) + i;
                this.celldata.push(levelData[index]);
            }
        }
    };

    this.update = function (dt) {
    };
};
