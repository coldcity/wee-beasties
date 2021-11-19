// Wee Beasties (Linear GP playground)
// Fell, 2021

// A genetic sequence
class Genome {
    code = Array(GENOME_LENGTH_BYTES);  // Delicious genetic material

    // Generate a random genome
    constructor() {
        for (var i = 0; i < GENOME_LENGTH_BYTES; i++)
            this.code[i] = Math.floor(Math.random() * 255);
    }

    // Get a colour based on the genome
    // @swb Is it the map-reduce?! :D
    GetColour() {
        return '#' + this.code.slice(0, 3).map(function (x) {
            return (0 + (x*1000).toString(16)).substr(-2);
        }).join('');
    }

    // Breed 2 given genomes (with a mutation chance)
    static Breed(parent1, parent2) {
        var child = new Genome();

        // Breed with crossovers
        for (var j = 0; j < 1 + Math.floor(Math.random() * MAX_CROSSOVERS - 1); j++) {
            var splitPoint = Math.floor(Math.random() * GENOME_LENGTH_BYTES);
            for (var i = 0; i < splitPoint; i++)
                child.code[i] = parent1.code[i];
            for (var i = splitPoint; i < GENOME_LENGTH_BYTES; i++)
                child.code[i] = parent2.code[i];
        }

        // Chance to mutate
        if (Math.random() < MUTATION_RATE)
            child.Mutate();

        return child;
    }

    // Mutate
    Mutate() {
        var gene = Math.floor(Math.random() * GENOME_LENGTH_BYTES);
        this.code[gene] = Math.floor(Math.random() * 255);
    }

    // Dump as hex
    ToString() {
        var s = "";
        for (var i = 0; i < GENOME_LENGTH_BYTES; i++)
            s += this.code[i].toString(16).padStart(2, '0');
        return s;
    }
}
