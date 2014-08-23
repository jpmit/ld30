var w4 = w4 || {};

var sprite = game.namespace ('sprite', w4);

sprite.Sprite = function () {

    this.update = function (dt) {
        return dt;
    };

    this.draw = function (ctx) {
        ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
};

sprite.PhysicsSprite = function (width, height, x, y) {
    this.rect = {x: x, y: y, width: width, height: height};
    this.hitbox = {x: this.rect.x, y: this.rect.y, width: this.rect.width,
                   height: this.rect.height};
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

    this.update = function (dt) {
        var level = w4.level.currentLevel,
            xnew,
            ynew;

        xnew = w4.physics.stepX(this, level, dt);
        /*w4.collide.levelCollideX(entity, level, xnew);*/

        ynew = w4.physics.stepY(this, level, dt);
        /*w4.collide.levelCollideY(entity, level, ynew);*/

        this.rect.x = xnew;
        this.rect.y = ynew;
    }        
};

sprite.PhysicsSprite.prototype = new sprite.Sprite();

