// Wee Beasties (NN playground)
// Fell, 2021

// A 2d coord
class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static DistanceBetween(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}

// An individual in the population: Has a location, a genome, and a brain
class Individual {
    loc;        // Worldspace coord
    genome;     // GENOME_LENGTH of Genetic code
    brain;      // Our wee brain
    fitness;    // Our fitness
    lifespan;   // How long we've been alive

    cellsW;     // World size (W)
    cellsH;     // World size (H)

    pointDistances;
    isBlocked;

    // Create from given genome and world size
    constructor(genome, cellsW, cellsH) {
        this.cellsW = cellsW;
        this.cellsH = cellsH;
        this.loc = this.RandomiseLocation();
        this.genome = genome;
        this.brain = new NN(NN_INPUTS, NN_HIDDEN_LAYERS, NN_HIDDEN_NEURONS, NN_OUTPUTS);
        this.brain.Load(this.genome.code);   // Load the hex genome into the VM (it's machine code!)
        this.fitness = 0;
        this.lifespan = 0;
        this.pointDistances = Array(VISITING_POINTS.length).fill(Infinity);
        this.isBlocked = false;
    }

    // Calculate fitness
    CalculateFitness() {
        var totalDist = 0;
        for (var i = 0; i < VISITING_POINTS.length; i++)
            totalDist += this.pointDistances[i];
        this.fitness = 1 / (totalDist + 0.00001);

        //this.fitness = 1 / (Coord.DistanceBetween(new Coord(this.cellsW / 2, this.cellsH / 2), this.loc); + 0.00001); // Distance to screen center

        return this.fitness;
    }

    // Live one timestep of life
    Tick() {
        // Evaluate and grab outputs
        var outputs = this.brain.Evaluate(Array(
            this.isBlocked ? 1 : 0,     // Blocked signal
            this.CalculateFitness(),    // Current fitness
            this.loc.x / this.cellsW,   // X position
            this.loc.y / this.cellsH    // Y position
        ));

        // Move in the direction of the output signal
        var x = (outputs[0] - 0.5) * SPEED_LIMIT;     // Normalise to [-SPEED_LIMIT, SPEED_LIMIT]
        var y = (outputs[1] - 0.5) * SPEED_LIMIT;

        // Before moving, check if new position is blocked
        this.isBlocked = false;
        for (var i = 0; i < OBSTACLES.length; i++) {
            var dist = Coord.DistanceBetween(new Coord(this.loc.x + x, this.loc.y + y), new Coord(OBSTACLES[i].x * this.cellsW, OBSTACLES[i].y * this.cellsH));
            if (dist <= OBSTACLE_RADIUS / CELL_SIZE_PIXELS + 1) {
                this.isBlocked = true;
                break;
            }
        }

        // Only move if not blocked
        if (!this.isBlocked) {
            this.loc.x += x;
            this.loc.y += y;
        }

        // Update point distances
        for (var i = 0; i < VISITING_POINTS.length; i++) {
            var dist = Coord.DistanceBetween(this.loc, new Coord(VISITING_POINTS[i].x * this.cellsW, VISITING_POINTS[i].y * this.cellsH));
            if (dist < this.pointDistances[i])
                this.pointDistances[i] = dist;
        }
    }

    // Set a random world location
    RandomiseLocation() {
        while (true) {
            var blocked = false;
            var v = new Coord(Math.random() * this.cellsW, Math.random() * this.cellsH);
            for (var i = 0; i < OBSTACLES.length; i++) {
                var dist = Coord.DistanceBetween(v, new Coord(OBSTACLES[i].x * this.cellsW, OBSTACLES[i].y * this.cellsH));
                if (dist <= OBSTACLE_RADIUS / CELL_SIZE_PIXELS + 1) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked)
                return v;
        }
    }
}
