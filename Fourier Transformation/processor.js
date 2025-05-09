class CircularBufferProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.sampleRate = sampleRate;
        this.bufferSize = 8192*0.5; // 100ms buffer
        // this.bufferSize = Math.floor(this.sampleRate * 0.02); // 100ms buffer
        this.buffer = new Float32Array(this.bufferSize);
        this.writeIndex = 0;

        this.port.onmessage = (event) => {
            if (event.data === 'getBuffer') {
                // Create ordered snapshot
                const ordered = new Float32Array(this.bufferSize);
                for (let i = 0; i < this.bufferSize; i++) {
                    const readIndex = (this.writeIndex + i) % this.bufferSize;
                    ordered[i] = this.buffer[readIndex];
                }
                this.port.postMessage(ordered);
            }
        };
    }

    process(inputs) {
        const input = inputs[0];
        if (input.length === 0) return true;

        const inputChannel = input[0];
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.writeIndex] = inputChannel[i];
            this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
        }

        return true;
    }

}

registerProcessor('circular-buffer-processor', CircularBufferProcessor);
