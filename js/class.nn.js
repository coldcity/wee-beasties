// Wee Beasties (NN playground)
// Fell, 2021

// A neuron's just an array of weights and an output
class Neuron {
    weights;    // Float array of input weights
    output;     // Float

    constructor(numInputs) {
        this.weights = Array(numInputs);
    }
}

// A classic feed-forward neural network.
// Configurable input and output layer neuron count, hidden layer count, and hidden layer neuron count.
class NN {
    inputLayer;      // Array of floats
    hiddenLayers;    // Array of arrays of neurons
    outputLayer;     // Array of neurons

    // Create neuron layers
    constructor(numInputs, numHiddenLayers, numHiddenNeurons, numOutputs) {
        // Create input layer (it's just a float array)
        this.inputLayer = new Float32Array(numInputs);

        // Create hidden layers and neurons
        this.hiddenLayers = new Array(numHiddenLayers);
        for (var i = 0; i < numHiddenLayers; i++) {
            var inputCount = i == 0 ? numInputs : numHiddenNeurons; // First hidden layer has numInputs inputs; other layers have numHiddenNeurons
            this.hiddenLayers[i] = new Array(numHiddenNeurons);
            for (var j = 0; j < numHiddenNeurons; j++)
                this.hiddenLayers[i][j] = new Neuron(inputCount);
        }

        // Create output layer neurons
        this.outputLayer = Array(numOutputs);
        for (var i = 0; i < numOutputs; i++)
            this.outputLayer[i] = new Neuron(numHiddenNeurons);
    }

    // Set network weights
    Load(weights) {
        var i = 0;  // Index into genome

        // Load hidden layer weights
        for (var j = 0; j < this.hiddenLayers.length; j++)                          // For each hidden layer
            for (var k = 0; k < this.hiddenLayers[j].length; k++)                   // For each neuron
                for (var l = 0; l < this.hiddenLayers[j][k].weights.length; l++)    // For each weight
                    this.hiddenLayers[j][k].weights[l] = weights[i++];

        // Load output layer weights
        for (var j = 0; j < this.outputLayer.length; j++)
            for (var k = 0; k < this.outputLayer[j].weights.length; k++)
                this.outputLayer[j].weights[k] = weights[i++];
    }

    // Evaluate the network for given inputs, and return outputs
    Evaluate(inputs) {
        // Set input layer
        console.assert(inputs.length == this.inputLayer.length, "NN.SetInputs: wrong number of inputs");
        this.inputLayer = inputs;

        // Evaluate hidden layers
        for (var i = 0; i < this.hiddenLayers.length; i++)                                      // For each hidden layer
            for (var j = 0; j < this.hiddenLayers[i].length; j++) {                             // For each neuron
                var sum = 0;
                for (var k = 0; k < this.hiddenLayers[i][j].weights.length; k++) {              // For each input weight
                    var v = (i == 0) ? this.inputLayer[k] : this.hiddenLayers[i - 1][k].output; // Only the first hidden layer should use inputLayer; the rest should use previous hidden layer's outputs
                    sum += this.hiddenLayers[i][j].weights[k] * v;
                }
                this.hiddenLayers[i][j].output = NN.Sigmoid(sum);
            }
        
        // Calculate output layer outputs
        var outputs = new Float32Array(this.outputLayer.length);
        for (var i = 0; i < this.outputLayer.length; i++) {
            var sum = 0;

            for (var j = 0; j < this.outputLayer[i].weights.length; j++)
                sum += this.outputLayer[i].weights[j] * this.hiddenLayers[this.hiddenLayers.length - 1][j].output;  // Use outputs from last hidden layer

            outputs[i] = this.outputLayer[i].output = NN.Sigmoid(sum);
        }

        return outputs;
    }

    // Sigmoid function (yeah I had to google it.... it's from https://www.zacwitte.com/javascript-sigmoid-function)
    static Sigmoid(t) {
        return 1/(1+Math.pow(Math.E, -t));
    }
}
