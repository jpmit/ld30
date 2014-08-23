var w4 = w4 || {};

var physics = game.namespace ('physics', w4);

physics.stepX = function (entity, level, dt) {
    var wasleft = entity.dx < 0,
    wasright = entity.dx > 0,
    friction = entity.friction,
    accel = entity.accel

    entity.ddx = 0;

    if (entity.left) {
        entity.ddx = entity.ddx - accel;
    } else if (wasleft) {
        entity.ddx = entity.ddx + friction;
    }
    
    if (entity.right) {
        entity.ddx = entity.ddx + accel;
    }
    else if (wasright) {
        entity.ddx = entity.ddx - friction;
    }

    entity.dx = entity.dx + entity.ddx * dt;

    if ((wasleft && (entity.dx > 0)) || (wasright && (entity.dx < 0))) {
        /* clamp at zero to prevent friction from making us jiggle side to side */
        entity.dx = 0;
    }

    return entity.hitbox.x + Math.floor(entity.dx * dt)
}


physics.stepY = function (entity, level, dt) {
    entity.ddy = entity.gravity;
    if (entity.jump && (!entity.jumping) && entity.onfloor) {
        entity.ddy = entity.ddy - entity.impulse;
        entity.jumping = true;
        entity.onfloor = false;
    }

    entity.dy = entity.dy + dt * entity.ddy;

    if (entity.dy > 0) {
        entity.jumping = false;
        entity.falling = true;
    }
    
    return (entity.rect.y + Math.floor(entity.dy * dt));
}
