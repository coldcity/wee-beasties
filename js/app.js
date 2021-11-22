// Wee Beasties (NN playground)
// Fell, 2021

// Main app controller: Config, init and frame function.

// App constants
const   WORLD_WRAPS = true,        // World wraps around edges? (beasties leaving come in the other side)
        WORLD_IS_INT = false,       // World coords are constrained to integers? (beasties are stuck on grid)
        CELL_SIZE_PIXELS = 2,       // World cell size in pixels
        POPULATION_SIZE = 4000,     // World population size
        MUTATION_RATE = 0.01,       // Chance of a mutation when breeding
        MAX_CROSSOVERS = 4,         // Max number of cross-overs when breeding event (random between 1 and MAX_CROSSOVERS)
        TICKS_PER_GEN = 150,        // World ticks per generation
        GENE_RAND_SCALE = 16,       // Max amplitude of random gene float values
        SPEED_LIMIT = 16,           // Max speed of the beasties
        NN_INPUTS = 4,              // Number of inputs to the neural network
        NN_HIDDEN_LAYERS = 1,       // Number of hidden layers in the neural network
        NN_HIDDEN_NEURONS = 5,      // Number of neurons in neural network hidden layers
        NN_OUTPUTS = 2,             // Number of outputs from the neural network
        GENOME_LENGTH = (NN_HIDDEN_NEURONS * NN_INPUTS)                                     // First inner layer
                        + (NN_HIDDEN_LAYERS - 1) * NN_HIDDEN_NEURONS * NN_HIDDEN_NEURONS    // Other inner layers
                        + (NN_OUTPUTS * NN_HIDDEN_NEURONS);                                 // Output layer

VISITING_POINTS = [];
OBSTACLES = [];

const OBSTACLE_RADIUS = CELL_SIZE_PIXELS * 20;

// Globals
var world;                          // World object instance (population and renderer)
var ticksThisGen = 0;               // Number of ticks this generation

// App init
function Init() {
    // Create points to visit and obstacles to avoid
    for (var i = 0; i < 7; i++)
        VISITING_POINTS.push(new Coord(Math.random(), Math.random()));
    
    for (var i = 0; i < 4; i++)
        OBSTACLES.push(new Coord(Math.random(), Math.random()));

    world = new World();            // Init the world (inits renderer, creates population)
    requestAnimationFrame(Frame);   // Request an animation frame to kick things off
}

// App frame: Tick and render the world
function Frame() {
    var fastMode = document.getElementById("fast").checked;

    // Paused? Do nothing
    if (document.getElementById("pause").checked) {
        requestAnimationFrame(Frame);
        return;
    }

    // Update stats
    document.getElementById("averageFitness").innerHTML = world.averageFitness.toFixed(4);
    document.getElementById("worldSize").innerHTML = world.cellsW + " x " + world.cellsH;
    document.getElementById("population").innerHTML = world.population.length;
    document.getElementById("survivors").innerHTML = world.survivors+ " (" + ((world.survivors / world.population.length) * 100).toFixed(2) + "%)";
    document.getElementById("generation").innerHTML = world.generation;
    if (!fastMode)
        document.getElementById("generation").innerHTML += " (Step " + ticksThisGen + ")";

    // Tick the world and render
    if (fastMode) {                             // Fast mode: Tick the world though a whole generation, but don't render
        for (var i = ticksThisGen; i < TICKS_PER_GEN; i++)
            world.Tick();
        world.Render(true);                     // Render the state at the end of the generation
    } else if (ticksThisGen < TICKS_PER_GEN) {  // Normal mode: If we haven't finished the generation, tick and render
        world.Tick();
        world.Render(ticksThisGen == 0 ? true : !document.getElementById("trails").checked);
        requestAnimationFrame(Frame);
        ticksThisGen++;
        return;
    }
    
    // Lifespan of current generation is over; breed a new population
    ticksThisGen = 0;
    world.NextGeneration();

    // Output best beastie
    document.getElementById("bestInner").innerHTML = world.bestBeastie.genome.ToString();
    document.getElementById("bestFitness").innerHTML = world.bestBeastie.fitness.toFixed(4);

    requestAnimationFrame(Frame);
}
