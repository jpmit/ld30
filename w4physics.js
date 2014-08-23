
'use strict';
/*global game*/

var w4 = w4 || {};

var physics = game.namespace('physics', w4);

physics.worldStepX = function (entity, world, dt) {
    var wasleft = entity.dx < 0,
        wasright = entity.dx > 0,
        friction = entity.friction,
        accel = entity.accel,
        maxdx = w4.constants.maxdx;

    entity.ddx = 0;

    if (entity.left) {
        entity.ddx = entity.ddx - accel;
    } else if (wasleft) {
        entity.ddx = entity.ddx + friction;
    }

    if (entity.right) {
        entity.ddx = entity.ddx + accel;
    } else if (wasright) {
        entity.ddx = entity.ddx - friction;
    }

    entity.dx = entity.dx + entity.ddx * dt;

    if (entity.dx > maxdx) {
        entity.dx = maxdx;
    } else if (entity.dx < -maxdx) {
        entity.dx = -maxdx;
    }

    if ((wasleft && (entity.dx > 0)) || (wasright && (entity.dx < 0))) {
        // clamp at zero to prevent friction from making us jiggle side to side 
        entity.dx = 0;
    }

    return entity.hitbox.x + Math.floor(entity.dx * dt);
};

physics.worldStepY = function (entity, world, dt) {
    var maxdy = w4.constants.maxdy;
//    console.log(entity.onfloor);
    entity.ddy = 0;

    if (entity.jump && (!entity.jumping) && entity.onfloor) {
        entity.ddy = world.impulse;
        entity.dy = 0;
        entity.jumping = true;
        entity.onfloor = false;
    }

    entity.ddy += world.gravity;

    entity.dy = entity.dy + dt * entity.ddy;

    if (entity.dy > maxdy) {
        entity.dy = maxdy;
    } else if (entity.dy < -maxdy) {
        entity.dy = -maxdy;
    }

    if (entity.dy > 0) {
        entity.jumping = false;
        entity.falling = true;
    }

    return entity.hitbox.y + Math.floor(entity.dy * dt);
};

physics.worldCollideX = function (entity, world, xnew) {

    var xold = entity.hitbox.x,
        yold = entity.hitbox.y,
        xtileold,
        xtilenew,
        ytiletop,
        ytilebottom,
        ytile,
        hBox;

    entity.hitbox.x = xnew;

    if (xnew > xold) {
        xtileold = world.pixelToTile(xold + entity.hitbox.width - 1);
        xtilenew = world.pixelToTile(xnew + entity.hitbox.width - 1);
    } else if (xnew < xold) {
        xtileold = world.pixelToTile(xold);
        xtilenew = world.pixelToTile(xnew);
    } else {
        xtileold = xtilenew = null;
    }

    if (xtileold !== xtilenew) {
        ytiletop = world.pixelToTile(yold);
        ytilebottom = world.pixelToTile(yold + entity.hitbox.height - 1);
        for (ytile = ytiletop; ytile <= ytilebottom; ytile += 1) {
            hBox = world.tileHitbox(xtilenew, ytile);
//            console.log('checking', xtilenew, ytile, hBox);
            if (hBox) {
                entity.dx = 0;
                entity.ddx = 0;
                if (xnew > xold) {
                    entity.hitbox.x = hBox.x - entity.hitbox.width;
                } else {
                    entity.hitbox.x = hBox.x + hBox.width;
                }
            }
        }
    }

    entity.rect.x = entity.hitbox.x - entity.hitbox.xoff;
};

physics.worldCollideY = function (entity, world, ynew) {

    var xold = entity.hitbox.x,
        yold = entity.hitbox.y,
        ytileold,
        ytilenew,
        xtileleft,
        xtileright,
        xtile,
        hBox;

    entity.onfloor = false;

    entity.hitbox.y = ynew;

    if (ynew < yold) {
        /* check any tiles at the top */
        ytileold = world.pixelToTile(yold);
        ytilenew = world.pixelToTile(ynew);
    } else if ((ynew > yold) && entity.falling) {
        /* check any tiles at bottom */
        ytileold = world.pixelToTile(yold + entity.hitbox.height - 1);
        ytilenew = world.pixelToTile(ynew + entity.hitbox.height - 1);
    } else {
        ytileold = ytilenew = null;
    }

    if (ytileold !== ytilenew) {
        /* leftmost and rightmost x tiles to check */
        xtileleft = world.pixelToTile(xold);
        xtileright = world.pixelToTile(xold + entity.hitbox.width - 1);
        /* less than here instead? */
        for (xtile = xtileleft; xtile <= xtileright; xtile += 1) {
            hBox = world.tileHitbox(xtile, ytilenew);
//            console.log('checking', xtile, ytilenew, hBox);
            if (hBox) {
                entity.dy = 0;
                entity.ddy = 0;
                if (ynew < yold) {
                    entity.hitbox.y = hBox.y + hBox.height;
                    if (world.gravity < 0 && world.gravityDir === w4.world.constants.ydir) {
                        entity.onfloor = true;
                    }
//                    console.log('jumed!');
                } else {
                    entity.hitbox.y = hBox.y - entity.hitbox.height;
                    if (world.gravity > 0 && world.gravityDir === w4.world.constants.ydir) {
                        entity.onfloor = true;
                    }
                }
                break;
            } else {
//                console.log('no hit box!', xtile, ytilenew);
            }
        }
    }
    entity.rect.y = entity.hitbox.y - entity.hitbox.yoff;
};
