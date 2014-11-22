
var Path = (function () {    
    function Genotype(world, path) {
        var evaluated = false;
        var stonevalue = world.width() * world.width() + world.height() * world.height();
        var value;
        var npoints = path.length;
        
        this.path = function () { return path; }
        
        this.evaluate = function () {
            if (evaluated)
                return value;
                
            value = 0;
            
            for (var k = 0; k < npoints - 1; k++) {
                var from = path[k];
                var to = path[k + 1];
                
                value += (from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y);
                
                var stones = world.stones(from, to);
                
                value += stones.length * stonevalue;
            }
            
            evaluated = true;
            
            return value;
        }
    }

    function World(width, height) {
        var values = [];
        
        for (var x = 0; x < width; x++)
            for (var y = 0; y < height; y++)
                values[y * width + x] = false;
        
        this.width = function () { return width; }
        
        this.height = function () { return height; }
        
        this.get = function (x, y) { return values[y * width + x]; }
        
        this.set = function (x, y, value) { values[y * width + x] = value; }
        
        this.fill = function (ratio) {
            for (var x = 0; x < width; x++)
                for (var y = 0; y < height; y++)
                    values[y * width + x] = Math.random() <= ratio;
        }

        this.points = function (from, to) {
            var points = [];
            
            if (from.x > to.x || (from.x == to.x && from.y > to.y)) {
                var temp = from;
                from = to;
                to = temp;                
            }
            
            if (from.y == to.y) {
                for (var x = from.x; x <= to.x; x++)
                    points.push({ x: x, y: to.y });
                        
                return points;
            }
            
            if (from.x == to.x) {
                for (var y = from.y; y <= to.y; y++)
                    points.push({ x: to.x, y: y });
                        
                return points;
            }
            
            var dy = 1;
            
            if (from.y > to.y)
                dy = -1;
                
            var toy = to.y + dy;
            var fromx = from.x;
            
            for (var y = from.y; y != toy; y += dy) {
                var npoints = 0;
                for (var x = fromx; x <= to.x; x++) {
                    var point = { x: x, y: y };
                    
                    if (distance(from, to, point) <= 0.5) {
                        if (npoints == 0)
                            fromx = x;
                        points.push(point);
                        npoints++;
                    }
                    else if (npoints)
                        break;
                }
            }
            
            return points;
        }
        
        this.stones = function (from, to) {
            var stones = [];
            var points = this.points(from, to);
            var npoints = points.length;
            
            for (var k = 0; k < npoints; k++)
                if (this.get(points[k].x, points[k].y))
                    stones.push(points[k]);
            
            return stones;
        }
    }
    
    // http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    function distance(from, to, point) {
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        
        var a = -dy;
        var b = dx;
        var c = dy * from.x - dx * from.y;
        
        return Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
    }
    
    function createPath(from, to, width, height, ratio) {
        if (!ratio)
            ratio = 0.5;
            
        var points = [from, to];
        
        while (Math.random() <= ratio) {
            var position = Math.floor(Math.random() * (points.length - 1)) + 1;
            var newpoint = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
            points.splice(position, 0, newpoint);
        }
        
        return points;
    }
    
    function createGenotype(world, from, to, ratio) {
        var path = createPath(from, to, world.width(), world.height(), ratio);
        return new Genotype(world, path);
    }
    
    return {
        createWorld: function (w, h) { return new World(w, h); },
        distance: function (from, to, point) { return distance(from, to, point); },
        createPath: createPath,
        createGenotype: createGenotype
    }
})();

if (typeof(window) === 'undefined')
	module.exports = Path;