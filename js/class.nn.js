// Wee Beasties (NN playground)
// Fell, 2021

// A not-yet-recurrant neural network
// For now it's a classic feed-forward perceptron

class Neuron {
    weights;    // Float array of input weights
    output;     // Float

    constructor(numInputs) {
        this.weights = Array(numInputs);
    }
}

class NN {
    inputLayer;     // Floats
    hiddenLayer;    // Neurons
    outputLayer;    // Neurons

    // Create neuron layers
    constructor(numInputs, numHidden, numOutputs) {
        // Input layer is just a float array
        this.inputLayer = new Float32Array(numInputs);

        // Create hidden layer neurons (inputs from input layer)
        this.hiddenLayer = Array(numHidden);
        for (var i = 0; i < numHidden; i++)
            this.hiddenLayer[i] = new Neuron(numInputs);

        // Create output layer neurons (inputs from hidden layer)
        this.outputLayer = Array(numOutputs);
        for (var i = 0; i < numOutputs; i++)
            this.outputLayer[i] = new Neuron(numHidden);
    }

    // Set network weights
    Load(weights) {
        console.assert(weights.length >= this.hiddenLayer.length * this.inputLayer.length + this.outputLayer.length * this.hiddenLayer.length, "NN.Load: weights too short");
        var i = 0;  // Index into genome

        // Load input->hidden layer weights
        for (var j = 0; j < this.hiddenLayer.length; j++)
            for (var k = 0; k < this.hiddenLayer[j].weights.length; k++)
                this.hiddenLayer[j].weights[k] = weights[i++];

        // Load hidden->output layer weights
        for (var j = 0; j < this.outputLayer.length; j++)
            for (var k = 0; k < this.outputLayer[j].weights.length; k++)
                this.outputLayer[j].weights[k] = weights[i++];
    }

    // Evaluate the network for given inputs, and return outputs
    Evaluate(inputs) {
        // Set input layer
        console.assert(inputs.length == this.inputLayer.length, "NN.SetInputs: wrong number of inputs");
        this.inputLayer = inputs;

        // Calculate hidden layer outputs
        for (var i = 0; i < this.hiddenLayer.length; i++) {
            var sum = 0;

            for (var j = 0; j < this.hiddenLayer[i].weights.length; j++)
                sum += this.hiddenLayer[i].weights[j] * this.inputLayer[j];

            this.hiddenLayer[i].output = NN.Sigmoid(sum);
        }
        
        // Calculate output layer outputs
        var outputs = new Float32Array(this.outputLayer.length);
        for (var i = 0; i < this.outputLayer.length; i++) {
            var sum = 0;

            for (var j = 0; j < this.outputLayer[i].weights.length; j++)
                sum += this.outputLayer[i].weights[j] * this.hiddenLayer[j].output;

            //this.outputLayer[i].output = NN.sigmoid(sum);
            outputs[i] = NN.Sigmoid(sum);
        }

        return outputs;
    }

    // Sigmoid function (yeah I had to google it.... it's from https://www.zacwitte.com/javascript-sigmoid-function)
    static Sigmoid(t) {
        return 1/(1+Math.pow(Math.E, -t));
    }
}
