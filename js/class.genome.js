// Wee Beasties (NN playground)
// Fell, 2021

// A genetic sequence
class Genome {
    code = Array(GENOME_LENGTH);  // Delicious genetic material (floats)

    // Generate a random genome
    constructor() {
        for (var i = 0; i < GENOME_LENGTH; i++)
            this.code[i] = Genome.GetRandomGene();
    }

    // Get a colour based on the genome
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
            var splitPoint = Math.floor(Math.random() * GENOME_LENGTH);
            for (var i = 0; i < splitPoint; i++)
                child.code[i] = parent1.code[i];
            for (var i = splitPoint; i < GENOME_LENGTH; i++)
                child.code[i] = parent2.code[i];
        }

        // Chance to mutate
        if (Math.random() < MUTATION_RATE)
            child.Mutate();

        return child;
    }

    // Get a random gene
    static GetRandomGene() {
        return Math.random() * GENE_RAND_SCALE - GENE_RAND_SCALE/2;
    }

    // Mutate
    Mutate() {
        this.code[Math.floor(Math.random() * GENOME_LENGTH)] = Genome.GetRandomGene();
    }

    // Dump as text
    ToString() {
        var s = "";
        for (var i = 0; i < GENOME_LENGTH; i++) {
            s += this.code[i];
            if (i < GENOME_LENGTH - 1)
                s += ",<br>";
        }
        return s;
    }
}
