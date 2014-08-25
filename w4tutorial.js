// w4scene.js
// Copyright (c) James Mithen 2014.

'use strict';
/*global game*/
/*global w4*/

var v4 = w4 || {};

var tutorial = game.namespace('tutorial', w4);

tutorial.tutData = {
    "1": [["Welcome W"],
          ["Use the arrow keys to move", "and space to jump"],
          ["You'll have to get to the door", "if you ever want to escape", "these connected worlds"],
          ["That's the box with the red border over on the right"],
          ["And about the only thing around here I'm afraid"],
          ["Apart from those pesky spikes!"]
          ],
    "2": [["This might take some getting used to..."],
          ["By the way, in case you hadn't noticed", "the arrows tell you the direction of gravity"],
          ["Good luck!"]],
    "3": [["You can try 'bouncing' between worlds", "to pick up some extra speed"]]
};

tutorial.hasTutorial = function (lnum) {
    if (tutorial.tutData.hasOwnProperty(lnum.toString())) {
        return true;
    }
    return false;
};

tutorial.tutorialScene = function (lnum) {
    var ctx = w4.screen.ctx;

    this.isFinished = false;
    this.index = 0;
    this.data = tutorial.tutData[lnum.toString()];

    if (this.data) {
        w4.jukebox.playSfx('advance');
    }

    this.update = function () {
        var i,
            e,
            k = game.key;

        for (i = 0; i < k.events.length; i += 1) {
            e = k.events[i];
            if (e.kc === k.keys.RETURN && (!e.down)) {
                this.index += 1;
                if (this.index === this.data.length) {
                    this.isFinished = true;
                } else {
                    w4.jukebox.playSfx('advance');
                }
            }
        }
        game.key.events = [];
    };

    this.draw = function () {
        var i,
            line,
            y = 100,
            x = 100;

        if (this.isFinished) {
            return;
        }
        ctx.font = "15px Shadows Into Light Two";
        for (i = 0; i < this.data[this.index].length; i += 1) {
            line = this.data[this.index][i];
            ctx.fillText(line, x, y);
            y += 20;
        }
        ctx.font = "9px Shadows Into Light Two";
        ctx.fillText("[Press Return]", x, y);
    };
};

tutorial.tutorialScene.prototype = new game.scene.BaseScene();
