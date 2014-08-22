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
        pg1 = new game.polygon.Polygon([[0, 0], [100, 0], [100, 100]]),
        pg2 = new game.polygon.Polygon([[400, 400], [500, 450], [500, 500]]);

    // main draw function (called every frame)
    function draw() {
        ctx.clearRect(0, 0, width, height);
        pg1.draw(ctx);
        pg2.draw(ctx);
    }

    // main update function (called every frame)
    function update(dt) {
        var dx = 0,
            dy = 0,
            col;
        if (game.key.pressed[game.key.keys.LEFT]) {
            dx = -100 * dt;
        }            
        if (game.key.pressed[game.key.keys.RIGHT]) {
            dx = 100 * dt;
        }            
        if (game.key.pressed[game.key.keys.UP]) {
            dy = -100 * dt;
        }            
        if (game.key.pressed[game.key.keys.DOWN]) {
            dy = 100 * dt;
        }            
           
        pg1.displace(dx, dy);

        // disp should be minimum displacement vector to resolve collision
        col = game.polygon.collide(pg1, pg2);
        pg1.color = '#f00';
        if (col) {
            console.log(col); 
            pg1.color = '#0f0';
            //pg1.displace(col[0], col[1]);
            pg1.displace(-dx, -dy);
        }
    }

    // process user input (called every frame)
    function processInput() {
        var k = game.key;
        k.events = [];
    }

    // called by window.onload
    function init() {
        var x, mainDraw;

        // requestAnimationFrame
        (function () {
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (x = 0; x < vendors.length && !window.requestAnimFrame; x += 1) {
                window.requestAnimFrame = window[vendors[x] + 'RequestAnimationFrame'];
            }
        }());

        // we use setInterval for the logic, and requestAnimationFrame
        // for the *drawing only*. If requestAnimationFrame is not
        // supported, the entire game loop is executed by a single
        // setTimeout call (hence why we don't have a setTimeout
        // fallback above).
        if (!window.requestAnimFrame) {
            mainDraw = draw;
        } else {
            mainDraw = function () { return; };
        }

        // logic only (and draw if requestAnimationFrame not supported)
        function main() {
            var now = Date.now(),
                // time elapsed since last tick in s
                dt = (now - then) / 1000;
            processInput();
            update(dt);
            mainDraw();
            then = now;
        }

        window.setInterval(main, 1000 / game.constants.fps);

        function keepDrawing() {
            draw();
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
