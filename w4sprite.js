// w4sprite.js
// Copyright (c) James Mithen 2014.

'use strict';
/*global game*/
/*global Image*/

var w4 = w4 || {};

var sprite = game.namespace('sprite', w4);

sprite.Sprite = function (impath, x, y, xoff, yoff) {
    var img,
        that = this;

    this.rect = {x: x, y: y};
    this.hitBox = {x: x + xoff, y: y + yoff};

    img = new Image();
    img.src = impath;
    img.onload = function () {
        that.hwidth = img.width / 2;
        that.hheight = img.height / 2;
        that.rect.width = img.width;
        that.rect.height = img.height;
        that.hitBox.width = img.width - 2 * xoff;
        that.hitBox.height = img.height - 2 * yoff;
    };
    this.img = img;

    this.update = function (dt) {
        return dt;
    };

    this.setPosition = function (x, y) {
        this.rect.x = x;
        this.rect.y = y;
        this.hitBox.x = x + xoff;
        this.hitBox.y = y + yoff;
    };

    this.draw = function (ctx) {
        ctx.save();
        if (this.img) {
            if (this.angle) {
                ctx.translate(this.rect.x + this.hwidth, this.rect.y + this.hheight);
                ctx.rotate(this.angle);
                ctx.drawImage(this.img, -this.hwidth, -this.hheight);
            } else {
                ctx.drawImage(this.img, this.rect.x, this.rect.y);
            }
        } else {
            ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        }
        ctx.restore();
    };
};

sprite.PhysicsSprite = function (impath) {
    var img,
        that = this;

    // rect uses the local (world) co-ordinate system
    this.rect = {};
    this.hitbox = {};
    this.hitbox.xoff = 0;
    this.hitbox.yoff = 0;
    // global co-ords for the entire canvas
    this.globalRect = {};

    img = new Image();
    img.src = impath;
    img.onload = function () {
        that.hwidth = img.width / 2;
        that.hheight = img.height / 2;
        that.rect.width = img.width;
        that.rect.height = img.height;
        that.hitbox.width = img.width;
        that.hitbox.height = img.height;
        that.globalRect.width = img.width;
        that.globalRect.height = img.height;
    };
    this.img = img;

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

    // we pass the global position here
    this.setPosition = function (x, y) {
        var wor = w4.world.worlds[this.worldIn],
            xWorld = x - wor.x0,
            yWorld = y - wor.y0;
        this.globalRect.x = x;
        this.globalRect.y = y;

        this.rect.x = xWorld;
        this.rect.y = yWorld;
        this.hitbox.x = xWorld;
        this.hitbox.y = yWorld;
        this.onfloor = false;
    };

    this.setAngle = function (world) {
        if (world.gravityDir === w4.world.constants.ydir) {
            if (world.gravity > 0) {
                this.angle = 0;
            } else if (world.gravity < 0) {
                this.angle = Math.PI;
            }
        } else if (world.gravityDir === w4.world.constants.xdir) {
            if (world.gravity > 0) {
                this.angle = 3 * Math.PI / 2;
            } else if (world.gravity < 0) {
                this.angle = Math.PI / 2;
            }
        }
    };

    this.update = function (world, dt) {
        var xnew,
            ynew;

        // set state based on any pressed keys
        if (game.key.pressed[game.key.keys.LEFT]) {
            if (world.gravity > 0) {
                this.left = true;
            } else {
                this.right = true;
            }
        } else {
            if (world.gravity > 0) {
                this.left = false;
            } else {
                this.right = false;
            }
        }
        if (game.key.pressed[game.key.keys.RIGHT]) {
            if (world.gravity > 0) {
                this.right = true;
            } else {
                this.left = true;
            }
        } else {
            if (world.gravity > 0) {
                this.right = false;
            } else {
                this.left = false;
            }
        }
        if (game.key.pressed[game.key.keys.SPACE]) {
            this.jump = true;
        } else {
            this.jump = false;
        }

        this.hitSpike = false;

        // a possibly slightly inelegant way of handling the two axes
        if (world.gravityDir ===  w4.world.constants.ydir) {
            xnew = w4.physics.normalWorldStepX(this, world, dt);
            w4.physics.normalWorldCollideX(this, world, xnew);

            ynew = w4.physics.normalWorldStepY(this, world, dt);
            w4.physics.normalWorldCollideY(this, world, ynew);
        } else {
            ynew = w4.physics.crazyWorldStepY(this, world, dt);
            w4.physics.crazyWorldCollideY(this, world, ynew);

            xnew = w4.physics.crazyWorldStepX(this, world, dt);
            w4.physics.crazyWorldCollideX(this, world, xnew);
        }
    };

    // return co-ords of bottom right corner in global co-ords
    this.getBottomRight = function () {
        return [this.globalRect.x + this.rect.width, this.globalRect.y + this.rect.height];
    };

    this.getCenter = function () {
        return [this.globalRect.x + this.rect.width / 2, this.globalRect.y + this.rect.height / 2];
    };

    this.setCenter = function (pos) {
        this.globalRect.x = pos[0] - this.rect.width / 2;
        this.globalRect.y = pos[1] - this.rect.height / 2;
    };
};

sprite.PhysicsSprite.prototype = new sprite.Sprite();
