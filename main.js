// main.js
// Copyright (c) James Mithen 2014.
// Main game logic

'use strict';
/*global game*/
/*jslint browser:true*/


game.namespace('main');

game.main = (function () {
    var then = Date.now(),
        ctx = game.screen.ctx,
        width = game.screen.width,
        height = game.screen.height,
        currentScene = new game.scene.BaseScene();

    // called by window.onload
    function init(startScene) {
        var mainDraw;

        currentScene = startScene || currentScene,

        // requestAnimationFrame
        window.requestAnimFrame = window.requestAnimationFrame || window.msRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                                  window.oRequestAnimationFrame;

        // we use setInterval for the logic, and requestAnimationFrame
        // for the *drawing only*. If requestAnimationFrame is not
        // supported, the entire game loop is executed by a single
        // setTimeout call (hence why we don't have a setTimeout
        // fallback above).
        mainDraw = window.requestAnimFrame ? currentScene.draw : function () { return; };

        // logic only (and draw if requestAnimationFrame not supported)
        function main() {
            var now = Date.now(),
                // time elapsed since last tick in s
                dt = (now - then) / 1000;
            currentScene.processInput();
            currentScene.update(dt);
            mainDraw();
            // possible scene change
            currentScene = currentScene.next;
            then = now;
        }

        window.setInterval(main, 1000 / game.constants.fps);

        function keepDrawing() {
            currentScene.draw();
            window.requestAnimFrame(keepDrawing);
        }

        if (window.requestAnimFrame) {
            window.requestAnimFrame(keepDrawing);
        }
    }

    // public API
    return {init: init,
            };
}());
