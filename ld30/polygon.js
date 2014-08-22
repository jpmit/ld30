// main.js
// Copyright (c) James Mithen 2014.
// Main game logic

'use strict';
/*global game*/
/*jslint browser:true*/

game.namespace('polygon');

game.polygon.Polygon = function (points) {
    var dotp;
    // points should be listed clockwise
    this.points = points;
    this.color = '#f00';

    this.update = function (dt) {
        return dt;
    };

    this.draw = function (ctx) {
        var i,
            p;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);
        for (i = 1; i < this.points.length; i += 1) {
            p = this.points[i];
            ctx.lineTo(p[0], p[1]);
        }
        ctx.closePath();
        ctx.fill();
    };

    this.displace = function (dx, dy) {
        var i;
        for (i = 0; i < this.points.length; i += 1) {
            this.points[i][0] += dx;
            this.points[i][1] += dy;
        }
    };

    this.getNormals = function () {
        var i,
            next,
            side,
            nlen,
            normals = [];
        for (i = 0; i < this.points.length; i += 1) {
            next = (i === this.points.length - 1 ? 0 : i + 1);
            side = [this.points[next][0] - this.points[i][0],
                    this.points[next][1] - this.points[i][1]];
            nlen = Math.pow(side[0] * side[0] + side[1] * side[1], 0.5);
            normals.push([side[1] / nlen, -side[0] / nlen]);
        }
        return normals;
    };

    dotp = function (v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1];
    };

    this.project = function (axis) {
        var min = dotp(axis, this.points[0]),
            max = min,
            i,
            v;
        for (i = 0; i < this.points.length; i += 1) {
            v = dotp(axis, this.points[i]);
            if (v < min) {
                min = v;
            } else if (v > max) {
                max = v;
            }
        }
        return [min, max];
    };      
};

game.polygon.collide = function (p1, p2) {
    var n1 = p1.getNormals(),
        // all normals of both polygons
        norms = n1.concat(p2.getNormals()),
        proj1,
        proj2,
        i,
        o,
        mins,
        maxs,
        minOverlap = Number.MAX_VALUE,
        minAxis;
    for (i = 0; i < norms.length; i += 1) {
        proj1 = p1.project(norms[i]); 
        proj2 = p2.project(norms[i]); 
        if (proj1[0] > proj2[1] || proj2[0] > proj1[1]) {
            return false;
        } else {
            if (proj1[0] <= proj2[1]) {
                o = proj2[1] - proj1[0];
            } else {
                o = proj1[1] - proj2[0];
            }
            // check for containment
/*            if ((proj1[1] < proj2[1] && proj1[0] > proj2[0]) || (proj2[1] < proj1[1] && proj2[0] > proj1[0])) {
                mins = Math.abs(proj1[0] - proj2[0]);
                maxs = Math.abs(proj1[1] - proj2[1]);
                if (mins < maxs) {
                    o += mins;
                } else {
                    o += maxs;
                }
            }*/
            if (o < minOverlap) {
                minOverlap = o;
                minAxis = norms[i];
            }
        }
    }
    console.log(minAxis, minOverlap);  

    return [minAxis[0] * minOverlap, minAxis[1] * minOverlap];
};
