// Wee Beasties (NN playground)
// Fell, 2021

// The world: Its population, and renderer.
class World {
    // Population stuff
    population = [];    // Array of Individuals
    generation;         // Track generation #
    averageFitness;     // Track population's average fitness
    survivors;          // Track count of survivors from last generation
    bestBeastie;        // Best individual of the previous generation
    
    // Renderer stuff
    canvas;             // HTML5 canvas
    ctx;                // Render context
    cellsW;             // World dimensions in cells
    cellsH;

    // Init renderer and create population
    constructor() {
        // Init graphics
        this.canvas = document.getElementById("renderCanvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");

        // Calc world size in cells
        this.cellsW = Math.round(this.canvas.width / CELL_SIZE_PIXELS);
        this.cellsH = Math.round(this.canvas.height / CELL_SIZE_PIXELS);

        // Build initial population of random individuals
        for (var i = 0; i < POPULATION_SIZE; i++)
            this.population.push(new Individual(new Genome(), this.cellsW, this.cellsH));

        this.generation = 0;
        this.averageFitness = 0;
        this.survivors = 0;
    }

    // Tick the life of the current population
    Tick() {
        for (var ind of this.population) {  // Iterate population
            // Tick individual
            ind.Tick();

            // Wrap / enforce boundaries
            if (WORLD_WRAPS) {
                if (ind.loc.x > this.cellsW - 1) ind.loc.x = ind.loc.x - this.cellsW - 1;
                if (ind.loc.y > this.cellsH - 1) ind.loc.y = ind.loc.y - this.cellsH - 1;
                if (ind.loc.x < 0) ind.loc.x = this.cellsW - 1 - ind.loc.x;
                if (ind.loc.y < 0) ind.loc.y = this.cellsH - 1 - ind.loc.y;
            } else {
                ind.loc.x = Math.max(0, Math.min(this.cellsW - 1, ind.loc.x));
                ind.loc.y = Math.max(0, Math.min(this.cellsH - 1, ind.loc.y));
            }

            // Lock to ints
            if (WORLD_IS_INT) {
                ind.loc.x = Math.round(ind.loc.x);
                ind.loc.y = Math.round(ind.loc.y);
            }
        }
    }

    // Setup next generation
    NextGeneration() {      
        // Find fitness of all individuals and global average
        this.averageFitness = 0;
        for (var i = 0; i < this.population.length; i++) {
            var ind = this.population[i];
            this.averageFitness += ind.CalculateFitness();
        }
        this.averageFitness /= this.population.length;

        // Sort population on fitness
        this.population.sort(function(a, b) {
            return a.fitness - b.fitness;
        });
        this.bestBeastie = this.population[this.population.length - 1];

        // Iterate the population, breeding the next generation
        var nextPopulation = [];
        this.survivors = 0;
        for (var ind of this.population) {
            // Individual better than average? Allow it through as-is (with a chance to mutate)
            if (ind.fitness > this.averageFitness) {
                var g = ind.genome;
                if (Math.random() < MUTATION_RATE)
                    g.Mutate();
                nextPopulation.push(new Individual(g, this.cellsW, this.cellsH));   // Create new individual with the same genome
                this.survivors++;
            } else {
                // Individual below average fitness? Replace with a child of two parents quadratic-randomly selected for fitness
                var p1 = this.population[Math.floor(Math.pow(Math.random(), 2) * this.population.length)],
                    p2 = this.population[Math.floor(Math.pow(Math.random(), 2) * this.population.length)];

                var g = Genome.Breed(p1.genome, p2.genome);    // Breed the genome (with a chance to mutate)
                    
                nextPopulation.push(new Individual(g, this.cellsW, this.cellsH));
            }
        }
        this.population = nextPopulation;   // The kids kill the parents

        // Increment generation
        this.generation++;
    }

    // Render current world
    Render(clear) {
        // Clear background
        if (clear) {
            this.ctx.fillStyle = '#060606';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Iterate population, drawing each individual
        for (var ind of this.population) {
            var x = ind.loc.x * CELL_SIZE_PIXELS;           // Convert world coords to pixel coords
            var y = ind.loc.y * CELL_SIZE_PIXELS;

            this.ctx.fillStyle = ind.genome.GetColour();    // Set colour based on genome

            if (WORLD_IS_INT)                               // Draw the individual (with a border gap)
                this.ctx.fillRect(x, y, CELL_SIZE_PIXELS - 1, CELL_SIZE_PIXELS - 1);
            else                                            // Draw the individual (no border gap)
                this.ctx.fillRect(x, y, CELL_SIZE_PIXELS, CELL_SIZE_PIXELS);
        }
    }
}
