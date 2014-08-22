// key.js
// Copyright (c) James Mithen 2014.
// Keyboard stuff

'use strict';
/*global game*/

game.namespace('key');

// track pressed keys
game.key.keys = {
    // normal arrow keys
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    // ctrl (right ctrl intended for use)
    CTRL: 17,
    // shift
    SHIFT: 32,
    // return key
    RETURN: 13,
};
// pressed stores keycode as key, boolean as value
game.key.pressed = {};
// array storing all used key codes
game.key.allkeys = [];
// store events (clear this every frame)
game.key.events = [];

game.key.allkeys = (function () {
    var pl, k, i, allkeys, parray;
    allkeys = [];
    parray = [game.key.keys];
    for (i = 0; i !== parray.length; i += 1) {
        pl = parray[i];
        for (k in pl) {
            if (pl.hasOwnProperty(k)) {
                allkeys.push(pl[k]);
            }
        }
    }
    return allkeys;
}());

// initialisation
(function () {
    /*jslint browser:true */
    var i,
        akeys = game.key.allkeys;
    // set all pressed to False
    for (i = 0; i < akeys.length; i += 1) {
        game.key.pressed[akeys[i]] = false;
    }

    // handle any user input
    function inputListener(e) {
        var kc, down;
        kc = e.keyCode;
        down = e.type === "keydown" ? true : false;
        if ((!down) || (down && game.key.pressed[kc] === false)) {
            game.key.pressed[kc] = down;
        }
        // events list
        game.key.events.push({'down': down,
                              'kc': kc});
        e.preventDefault();
    }

    window.addEventListener("keydown", inputListener, false);
    window.addEventListener("keyup", inputListener, false);
}());
