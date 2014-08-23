/*global game*/

var w4 = w4 || {};

var player = game.namespace('player', w4);

/* The player sprite (accessed in world updates) */
player.player = null;

/* The world the player is currently in */
player.worldIn = 0;
