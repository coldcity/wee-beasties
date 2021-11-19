// Wee Beasties (Linear GP playground)
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
    genome;     // GENOME_LENGTH_BYTES of Genetic code
    vm;         // Our wee brain
    fitness;    // Our fitness
    
    cellsW;     // World size (W)
    cellsH;     // World size (H)

    // Create from given genome and world size
    constructor(genome, cellsW, cellsH) {
        this.cellsW = cellsW;
        this.cellsH = cellsH;
        this.loc = new Coord(Math.random() * this.cellsW, Math.random() * this.cellsH);     // Set a random world location
        this.genome = genome;
        this.vm = new VM();
        this.vm.Load(this.genome.ToString());   // Load the hex genome into the VM (it's machine code!)
        this.fitness = 0;
    }

    // Live one timestep of life
    Tick() {
        // Reset VM for fresh run (resets registers, pc, and other state)
        this.vm.Reset(2, 2, VM_DATA_VEC_LEN);

        // Setup VM input buffer
        this.vm.SetInput(0, this.loc.x / this.cellsW);
        this.vm.SetInput(1, this.loc.y / this.cellsH);

        // Execute!
        this.vm.Run(VM_MAX_STEPS);

        // Grab outputs
        var xsig = this.vm.GetOutput(0);
        var ysig = this.vm.GetOutput(1);

        // Move our location
        if (!isNaN(xsig))
            this.loc.x += xsig;
        if (!isNaN(ysig))
            this.loc.y += ysig;
    }
}
