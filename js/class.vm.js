// Wee Beasties (Linear GP playground)
// Fell, 2021

// A JS virtual machine for Slash/A

/*
For language spec, see https://github.com/arturadib/slash-a
         _________________
  D[i]: |  |  |  |  |  |  | ...  << Data vector D[i]
        |__|__|__|__|__|__|
    i :  1  2  3  4  5  6
               ^ 
               |
               \--[I=3]          << Integer register. Load/save operations would access D[3].
                  [F=3.1415]     << Floating-point register
*/

class VM {
    pc;                 // Program counter
    F;                  // Float register
    I;                  // Int register
    D;                  // Data vector (float array)

    dataVecLen;         // Number of entries in the data vector
    labels;             // Code labels (numbered array of addresses)
    inputBuffer;        // Float array input buffer
    outputBuffer;       // Float array output buffer
    inputIndex;         // Runtime index into input buffer
    outputIndex;        // Runtime index into output buffer
    inLoop;             // Whether we're in a loop
    loopCount;          // Loop counter (TODO: Make 'em nestable)
    loopStart;          // Loop start address
    runLog;             // Dissaembled run log

    // Load arbitrary-length bytecode from hex
    Load(code) {
        this.code = new Uint8Array(code.length / 2);    // Bytecode vector
        var mempos = 0;
        for (var i = 0; i < code.length; i+=2)
            this.code[mempos++] = parseInt(code.substr(i, 2), 16);
    }

    // Reset for a fresh run
    Reset(numInputs, numOutputs, dataVecLen) {
        this.inputBuffer = new Float32Array(numInputs);
        this.outputBuffer = new Float32Array(numOutputs);
        this.F = new Float32Array(1).fill(0);   // I won't tell if you don't
        this.I = new Uint32Array(1).fill(0);
        this.dataVecLen = dataVecLen;
        this.D = new Float32Array(this.dataVecLen).fill(0);
        this.labels = Array(this.dataVecLen);
        this.pc = 0;
        this.inputIndex = 0;
        this.outputIndex = 0;
        this.inLoop = false;
        this.loopCount = 0;
        this.loopStart = 0;
        this.runLog = "";
    }

    // Set an input with given index to given value
    SetInput(index, val) {
        this.inputBuffer[index] = val;
    }

    // Get an output with given index
    GetOutput(index) {
        return (index < this.outputBuffer.length) ? this.outputBuffer[index] : 0;
    }

    // Run the prog until maxSteps or illegal program counter
    Run(maxSteps) {
        var steps = 0;

        while (steps++ < maxSteps) {
            // Hit illegal program counter? Just return
            if (this.pc >= this.code.length)
                return;

            // Grab opcode & modulo it into legal range
            var previousPC = this.pc;
            var opcode = this.code[this.pc++] % (this.dataVecLen + 27);
            var msg = opcode;

            // Execute opcode (or write a direct value to I)
            if (opcode < this.dataVecLen)
                this.I[0] = opcode;
            else {
                switch(opcode) {
                    // ***** Register-Register stuff *****
                    case this.dataVecLen:        // itof
                        msg = "itof";
                        this.F[0] = this.I[0];
                        break;
                    case this.dataVecLen + 1:    // ftoi
                        msg = "ftoi";
                        this.I[0] = Math.round(Math.abs(this.F[0]));
                        break;
                    case this.dataVecLen + 2:    // inc
                        msg = "inc";
                        this.F[0] += 1;
                        break;
                    case this.dataVecLen + 3:    // dec
                        msg = "dec";
                        this.F[0] -= 1;
                        break;

                    // ***** Memory-Register stuff *****
                    case this.dataVecLen + 4:    // load
                        msg = "load";
                        this.F[0] = this.D[this.I[0]];
                        break;
                    case this.dataVecLen + 5:    // save
                        msg = "save";
                        this.D[this.I[0]] = this.F[0];
                        break;
                    case this.dataVecLen + 6:    // swap
                        msg = "swap";
                        var temp = this.D[this.I[0]];
                        this.D[this.I[0]] = this.F[0];
                        this.F[0] = temp;
                        break;
                    case this.dataVecLen + 7:    // cmp
                        msg = "cmp";
                        this.F[0] = (this.F[0] == this.D[this.I[0]]) ? 0 : -1;
                        break;

                    // ***** Flow control stuff *****
                    case this.dataVecLen + 8:    // label
                        msg = "label";
                        this.labels[this.I[0]] = this.pc;
                        break;
                    case this.dataVecLen + 9:    // gotoifp (nop if bad label)
                        msg = "gotoifp";
                        if (this.F[0] >= 0 && this.labels[this.I[0]] > 0)
                            this.pc = this.labels[this.I[0]];
                        break;
                    case this.dataVecLen + 10:   // jumpifn (nop if no matching jumphere)
                        msg = "jumpifn";
                        if (this.F[0] < 0) {
                            var destination = this.pc;
                            while (this.code[destination] != this.dataVecLen + 12 && destination < this.code.length)   // Search for jump destination
                                destination++;

                            if (this.code[destination] == this.dataVecLen + 12) // If we found one, jump
                                this.pc = destination + 1;                      // Step over the jumphere too!
                        }
                        break;
                    case this.dataVecLen + 11:   // jumphere (nop if there was no jump)
                        msg = "jumphere";
                        break;
                    case this.dataVecLen + 12:   // loop (nop if I=0)
                        msg = "loop";
                        if (this.I[0] > 0) {
                            this.inLoop = true;
                            this.loopCount = this.I[0];
                            this.loopStart = this.pc;
                        }
                        break;
                    case this.dataVecLen + 13:   // endloop (nop if not in a loop)
                        msg = "endloop";
                        if (this.inLoop) {
                            if (--this.loopCount == -1)
                                this.inLoop = false;
                            else
                                this.pc = this.loopStart;
                        }
                        break;

                    // ***** I/O stuff *****
                    case this.dataVecLen + 14:   // input (nop if we've overrun the input buffer)
                        msg = "input";
                        if (this.inputIndex < this.inputBuffer.length)
                            this.F[0] = this.inputBuffer[this.inputIndex++];
                        break;
                    case this.dataVecLen + 15:   // output (nop if we've overrun the output buffer or F is NaN)
                        msg = "output";
                        if (!isNaN(this.F[0]) && this.outputIndex < this.outputBuffer.length)
                            this.outputBuffer[this.outputIndex++] = this.F[0];
                        break;

                    // ***** Quik maffs *****
                    case this.dataVecLen + 16:   // add
                        msg = "add";
                        this.F[0] += this.D[this.I[0]];
                        break;
                    case this.dataVecLen + 17:   // sub
                        msg = "sub";
                        this.F[0] -= this.D[this.I[0]];
                        break;
                    case this.dataVecLen + 18:   // mul
                        msg = "mul";
                        this.F[0] *= this.D[this.I[0]];
                        break;
                    case this.dataVecLen + 19:   // div (nop if div by zero)
                        msg = "div";
                        if (this.D[this.I[0]] != 0)
                            this.F[0] /= this.D[this.I[0]];
                        break;
                    case this.dataVecLen + 20:   // abs
                        msg = "abs";
                        this.F[0] = Math.abs(this.F[0]);
                        break;
                    case this.dataVecLen + 21:   // sign
                        msg = "sign";
                        this.F[0] = -this.F[0];
                        break;
                    case this.dataVecLen + 22:   // exp
                        msg = "exp";
                        this.F[0] = Math.exp(this.F[0]);
                        break;
                    case this.dataVecLen + 23:   // log
                        msg = "log";
                        this.F[0] = Math.log(this.F[0]);
                        break;
                    case this.dataVecLen + 24:   // sin
                        msg = "sin";
                        this.F[0] = Math.sin(this.F[0]);
                        break;
                    case this.dataVecLen + 25:   // pow
                        msg = "pow";
                        this.F[0] = Math.pow(this.F[0], this.D[this.I[0]]);
                        break;
                    case this.dataVecLen + 26:   // ran
                        msg = "ran";
                        this.F[0] = Math.random();
                        break;

                    // ***** Marlon Brando *****
                    case this.dataVecLen + 27:   // nop (note that certain out of order ops are already treated as nops)
                        msg = "nop";
                        break;
                    default:
                        console.assert(false, "Invalid opcode " + opcode + " at " + (this.pc-1));
                        msg = "<font color='red'>ILLEGAL (" + opcode + ")</font>";
                }
            }

            this.runLog += "<tr><td>" + previousPC + "</td><td>" + msg + "</td><td>" + this.F[0].toFixed(2) + "</td><td>" + this.I[0] + "</td><td>" + parseFloat(this.D[this.I[0]]).toFixed(2) + "</td></tr>";
        }
    }
}