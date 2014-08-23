/*global game*/

'use strict';

var w4 = w4 || {};

var sprite = game.namespace('sprite', w4);

sprite.Sprite = function () {

    this.update = function (dt) {
        return dt;
    };

    this.draw = function (ctx) {
//        console.log(this.rect.x, this.rect.y);
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    };
};

sprite.PhysicsSprite = function (width, height, x, y) {
    /* rect uses the World co-ordinate system */
    this.rect = {x: x, y: y, width: width, height: height};
    this.hitbox = {x: this.rect.x, y: this.rect.y, width: this.rect.width,
                   height: this.rect.height};
    this.hitbox.xoff = 0;
    this.hitbox.yoff = 0;
    /* global co-ords for the entire canvas */
    this.globalRect = {x: x, y: y, width: width, height: height};
    this.dx = 0;
    this.dy = 0;
    this.ddx = 0;
    this.ddy = 0;
    this.gravity = w4.constants.gravity;
    this.maxdx = w4.constants.maxdx;
    this.maxdy = w4.constants.maxdy;
    this.impulse = w4.constants.impulse;
    this.accel = w4.constants.accel;
    this.friction = w4.constants.friction;
    this.left = false;
    this.right = true;
    this.jump = null;

    this.update = function (world, dt) {
        var xnew,
            ynew,
            hDisp,
            yDisp;

        /* set state based on any pressed keys */
        if (game.key.pressed[game.key.keys.LEFT]) {
            this.left = true;
        } else {
            this.left = false;
        }
        if (game.key.pressed[game.key.keys.RIGHT]) {
            this.right = true;
        } else {
            this.right = false;
        }
        if (game.key.pressed[game.key.keys.SPACE]) {
            this.jump = true;
        } else {
            this.jump = false;
        }

        xnew = w4.physics.worldStepX(this, world, dt);
        w4.physics.worldCollideX(this, world, xnew);

        ynew = w4.physics.worldStepY(this, world, dt);
        w4.physics.worldCollideY(this, world, ynew);
    };

    /* return co-ords of bottom right corner in global co-ords */
    this.getBottomRight = function () {
        return [this.globalRect.x + this.rect.width, this.globalRect.y + this.rect.height];
    };
};

sprite.PhysicsSprite.prototype = new sprite.Sprite();
