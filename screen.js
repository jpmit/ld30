// screen.js
// Copyright (c) James Mithen 2014.
// Handle canvas resizing etc

'use strict';
/*global game*/
/*jslint browser:true*/

var screen = game.namespace('screen');

// the main context used by the game for drawing
screen.canvas = document.getElementById("game");
screen.ctx = screen.canvas.getContext('2d');

screen.canvas.width = game.constants.screenWidth;
screen.canvas.height = game.constants.screenHeight;

screen.width = screen.canvas.width;
screen.height = screen.canvas.height;
