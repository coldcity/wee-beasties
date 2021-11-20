// Wee Beasties (NN playground)
// Fell, 2021

// A 2d coord
class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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

    // Create from given genome and world size
    constructor(genome, cellsW, cellsH) {
        this.cellsW = cellsW;
        this.cellsH = cellsH;
        this.loc = new Coord(Math.random() * this.cellsW, Math.random() * this.cellsH);     // Set a random world location
        this.genome = genome;
        this.brain = new NN(NN_INPUTS, NN_HIDDEN, NN_OUTPUTS);
        this.brain.Load(this.genome.code);   // Load the hex genome into the VM (it's machine code!)
        this.fitness = 0;
        this.lifespan = 0;
    }

    // Calculate fitness
    CalculateFitness() {
        var a = this.cellsW / 2 - this.loc.x;
        var b = this.cellsH / 2 - this.loc.y;
        var dist = Math.sqrt(a*a + b*b);

        this.fitness = 1 / (dist + 1);   // Invert and normalise

        if (isNaN(this.fitness))
            this.fitness = 0;

        return this.fitness;
    }

    // Live one timestep of life
    Tick() {
        // Setup NN inputs
        this.brain.SetInputs(Array(
                                this.CalculateFitness(),
                                this.loc.y / this.cellsH,
                                this.loc.x / this.cellsW));//,
                                //this.lifespan++));

        // Execute!
        this.brain.Evaluate();

        // Grab outputs
        var outputs = this.brain.GetOutputs();
        var xsig = (outputs[0] - 0.5) * SPEED_LIMIT;   // Normalise to [-SPEED_LIMIT, SPEED_LIMIT]
        var ysig = (outputs[1] - 0.5) * SPEED_LIMIT;

        // Move
        this.loc.x += xsig;
        this.loc.y += ysig;
    }
}
