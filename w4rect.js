// w4rect.js
// Copyright (c) James Mithen 2014.

'use strict';
/*global game*/

var w4 = w4 || {};

var rect = game.namespace('rect', w4);

rect.overlapAABB = function (bb1, bb2) {
    return !(((bb1.x + bb1.width) < bb2.x) ||
             ((bb2.x + bb2.width) < bb1.x) ||
             ((bb1.y + bb1.height) < bb2.y) ||
             ((bb2.y + bb2.height) < bb1.y));
};

rect.inAABB = function (bb, point) {
    return ((point[0] > bb.x) && (point[0] < bb.x + bb.width) &&
            (point[1] > bb.y) && (point[1] < bb.y + bb.height));
};

