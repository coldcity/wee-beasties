// Wee Beasties (Linear GP playground)
// Fell, 2021

// The world: Its population, and renderer.
class World {
    generation;         // Track generation #
    averageFitness;     // Track population's average fitness
    population = [];    // Array of Individuals
    survivors = 0;      // Count of survivors from last generation

    canvas;             // HTML5 canvas
    ctx;                // Render context
    cellsW;             // World dimensions in cells
    cellsH;

    // Init renderer and create population
    constructor() {
        // Init graphics
        this.canvas = document.getElementById("renderCanvas");
        this.canvas.width = window.innerWidth - 245;
        this.canvas.height = window.innerHeight;
    
        this.cellsW = Math.round(this.canvas.width / CELL_SIZE_PIXELS);
        this.cellsH = Math.round(this.canvas.height / CELL_SIZE_PIXELS);
        this.ctx = this.canvas.getContext("2d");
        
        // Build initial population of random individuals
        for (var i = 0; i < POPULATION_SIZE; i++)
            this.population.push(new Individual(new Genome(), this.cellsW, this.cellsH));

        this.generation = 0;
        this.averageFitness = 0;
    }

    // Tick the life of the current population
    Tick() {
        for (var i = 0; i < this.population.length; i++) {  // Iterate population
            var ind = this.population[i];

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

    // Setup next generation. Returns the best Individual from this generation.
    NextGeneration() {      
        // Find individual and average fitness
        this.averageFitness = 0;
        for (var i = 0; i < this.population.length; i++) {
            var ind = this.population[i];

            //var a = ind.loc.x - this.cellsW / 2;
            //var b = ind.loc.y - this.cellsH / 2;
            var dist = ind.loc.x; //Math.sqrt(a*a + b*b);

            ind.fitness = 1 / (dist + 1);

            if (isNaN(ind.fitness))
                ind.fitness = 0;
                
            this.averageFitness += ind.fitness;
        }
        this.averageFitness /= this.population.length;

        // Sort pop on fitness
        this.population.sort(function(a, b) {
            return a.fitness - b.fitness;
        });
        var bestIndividual = this.population[this.population.length-1];

        // Iterate the population, breeding the next generation
        var nextPopulation = [];
        for (var i = 0; i < this.population.length; i++) {
            // Individual above average fitness? Let their genetics survive (with a chance to mutate)
            if (this.population[i].fitness > this.averageFitness) {
                var g = this.population[i].genome;
                if (Math.random() < MUTATION_RATE)
                    g.Mutate();
                nextPopulation.push(new Individual(g, this.cellsW, this.cellsH));
            } else {
                // Below average fitness; replace with a child of two parents quadratic-randomly selected for fitness

                var r = Math.random();
                r *= r;
                var p1 = this.population[Math.floor(r * this.population.length)];
                
                r = Math.random();
                r *= r;
                var p2 = this.population[Math.floor(r * this.population.length)];
    
                var g = Genome.Breed(p1.genome, p2.genome);    // Breed the genome
                nextPopulation.push(new Individual(g, this.cellsW, this.cellsH));
            }
        }
        this.population = nextPopulation;   // The kids kill the parents ;)

        /*
        //////////////////////////////////////
        //////////////////////////////////////
        //////////////////////////////////////
          // Select breeders by fitness
        var breeders = [];
        var targetDist = 50;
        var targetFitness = 1 / (targetDist + 1);
        for (var i = 0; i < this.population.length; i++) {
            var ind = this.population[i];
            if (ind.fitness > targetFitness)
                breeders.push(ind);
        }
        this.survivors = breeders.length;

        // Breed the next population from selected breeders
        var nextPopulation = [];
        for (var i = 0; i < this.population.length; i++) {
            var p1 = breeders[Math.floor(Math.random() * breeders.length)];
            var p2 = breeders[Math.floor(Math.random() * breeders.length)];
            var genome = Genome.Breed(p1.genome, p2.genome);
            nextPopulation.push(new Individual(genome, this.cellsW, this.cellsH));
        }
        this.population = nextPopulation;
        //////////////////////////////////////
        //////////////////////////////////////
        //////////////////////////////////////
        */
       
        this.generation++;
        return bestIndividual;
    }

    // Render current world
    Render() {
        // Resize canvas to current window size (prevent getting squished)
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Clear background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        /*
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255,255,255,.6)';
        this.ctx.arc((this.cellsW * CELL_SIZE_PIXELS) / 2, (this.cellsH * CELL_SIZE_PIXELS) / 2, GOAL_SIZE * CELL_SIZE_PIXELS, 0, 2 * Math.PI);
        this.ctx.stroke();
        */

        // Iterate population
        for (var i = 0; i < this.population.length; i++) {
            var ind = this.population[i];
            var x = ind.loc.x * CELL_SIZE_PIXELS;           // Convert world coords to pixel coords
            var y = ind.loc.y * CELL_SIZE_PIXELS;

            this.ctx.fillStyle = ind.genome.GetColour();    // Set colour based on genome

            if (GRID_MODE)                                  // Draw the individual (with a border gap)
                this.ctx.fillRect(x, y, CELL_SIZE_PIXELS - 1, CELL_SIZE_PIXELS - 1);
            else                                            // Draw the individual (no border gap)
                this.ctx.fillRect(x, y, CELL_SIZE_PIXELS, CELL_SIZE_PIXELS);
        }
    }
}