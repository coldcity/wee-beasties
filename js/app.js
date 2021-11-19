// Wee Beasties (Linear GP playground)
// Fell, 2021

// Main app controller: Config, init and frame function.

// App constants
// TODO: Check these, some are whack, it was late
const   WORLD_WRAPS = false,        // World wraps around edges? (beasties leaving come in the other side)
        GRID_MODE = false,          // Render grid effect (only makes sense with WORLD_IS_INT)?
        WORLD_IS_INT = false,       // World coords are constrained to integers?
        CELL_SIZE_PIXELS = 2,       // World cell size in pixels
        POPULATION_SIZE = 800,      // World population size
        GENOME_LENGTH_BYTES = 28,   // Length of a genetic sequence (ie, Slash/A program)
        MUTATION_RATE = 0.01,       // Chance of a mutation when breeding
        MAX_CROSSOVERS = 5,         // Max number of cross-overs when breeding event (random between 1 and MAX_CROSSOVERS)
        TICKS_PER_GEN = 200,        // World ticks per generation
        TICKS_PER_FRAME = 1;        // World ticks per frame (for normal mode)
        VM_DATA_VEC_LEN = 6,        // Number of data vectors in the VM
        VM_MAX_STEPS = 40;          // Max number of steps the VM can run per tick

//const GOAL_SIZE = 100;

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
    document.getElementById("debug").innerHTML = "<b>Step</b> " + ticksThisGen + "<br><b>Generation</b> " + world.generation +  "<br><b>Average fitness</b> " + world.averageFitness.toFixed(2);
    //document.getElementById("debug").innerHTML = "<b>Step</b> " + ticksThisGen + "<br><b>Generation</b> " + world.generation + "<br><b>Survivors</b> " + world.survivors + " (" + ((world.survivors / world.population.length) * 100).toFixed(2) + "%)";

    if (document.getElementById("pause").checked) {     // Paused? Do nothing
        requestAnimationFrame(AppFrame);
        return;
    }

    if (document.getElementById("fast").checked) {      // Fast mode: Tick the world though a whole generation, but don't render
        for (var i = ticksThisGen; i < TICKS_PER_GEN; i++)
            world.Tick();
    } else if (ticksThisGen < TICKS_PER_GEN) {          // Normal mode. If we haven't finished the generation, tick and render
        for (var i = 0; i < TICKS_PER_FRAME; i++)
            world.Tick();
        ticksThisGen += TICKS_PER_FRAME;
        world.Render();
        requestAnimationFrame(AppFrame);
        return;
    }
    
    // Generation completed; start the next!
    ticksThisGen = 0;
    var bestIndividual = world.NextGeneration();       // Actual breeding etc happens here
    document.getElementById("debug2").innerHTML = "<b>Bestest Beastie</b><div class='genome'>" + bestIndividual.genome.ToString() + "</div><table><tr><td><b>PC</b></td><td><b>Op</b></td><td><b>F</b></td><td><b>I</b></td><td><b>D[I]</b></td></tr>" + bestIndividual.vm.runLog + "</table>";
    requestAnimationFrame(AppFrame);
}
