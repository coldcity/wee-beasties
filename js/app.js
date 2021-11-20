// Wee Beasties (NN playground)
// Fell, 2021

// Main app controller: Config, init and frame function.

// App constants
const   WORLD_WRAPS = true,         // World wraps around edges? (beasties leaving come in the other side)
        WORLD_IS_INT = false,       // World coords are constrained to integers?
        GRID_MODE = false,          // Render grid effect (only makes sense with WORLD_IS_INT)?
        CELL_SIZE_PIXELS = 2,       // World cell size in pixels
        POPULATION_SIZE = 4000,     // World population size
        NN_INPUTS = 3,              // Number of inputs to the neural network
        NN_HIDDEN = 6,              // Number of hidden nodes in the neural network
        NN_OUTPUTS = 2,             // Number of outputs from the neural network
        MUTATION_RATE = 0.01,       // Chance of a mutation when breeding
        MAX_CROSSOVERS = 4,         // Max number of cross-overs when breeding event (random between 1 and MAX_CROSSOVERS)
        TICKS_PER_GEN = 150,        // World ticks per generation
        GENE_RAND_SCALE = 16,       // Max amplitude of random gene float values
        SPEED_LIMIT = 8,            // Max speed of the beasties
        GENOME_LENGTH = (NN_HIDDEN * NN_INPUTS) + (NN_OUTPUTS * NN_HIDDEN);         // Length of a genetic sequence

// Globals
var world;                          // Population of individuals, and renderer
var ticksThisGen = 0;               // Number of ticks this generation

// App init
function AppInit() {
    world = new World();                // Init the world (inits renderer, creates population)
    requestAnimationFrame(AppFrame);    // Request an animation frame to kick things off
}

// App frame: Tick and render the world
function AppFrame() {
    var fastMode = document.getElementById("fast").checked;
    var debugInfo = document.getElementById("debug");
    var ticksPerFrame = parseInt(document.getElementById("ticksPerFrame").value);

    debugInfo.innerHTML = "<b>Average fitness</b> " + world.averageFitness.toFixed(4)
                        + "<br><b>World size</b> " + world.cellsW + " x " + world.cellsH
                        + "<br><b>Population</b> " + world.population.length
                        + "<br><b>Generation</b> " + world.generation;

    if (!fastMode)
        debugInfo.innerHTML += ", <b>Step</b> " + ticksThisGen

    if (world.survivors)
        debugInfo.innerHTML += "<br><b>Survivors</b> " + world.survivors
                            + " (" + ((world.survivors / world.population.length) * 100).toFixed(2) + "%)";

    if (document.getElementById("pause").checked) {     // Paused? Do nothing
        requestAnimationFrame(AppFrame);
        return;
    }

    if (fastMode) {      // Fast mode: Tick the world though a whole generation, but don't render
        for (var i = ticksThisGen; i < TICKS_PER_GEN; i++)
            world.Tick();
    } else if (ticksThisGen < TICKS_PER_GEN) {          // Normal mode. If we haven't finished the generation, tick and render
        for (var i = 0; i < ticksPerFrame; i++)
            world.Tick();
        ticksThisGen += ticksPerFrame;
        world.Render();
        requestAnimationFrame(AppFrame);
        return;
    }
    
    // Generation completed; start the next!
    ticksThisGen = 0;
    world.NextGeneration();       // Actual breeding etc happens here
    requestAnimationFrame(AppFrame);
}
