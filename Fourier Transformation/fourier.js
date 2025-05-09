let node, audioContext;

async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('processor.js');

    const source = audioContext.createMediaStreamSource(stream);
    node = new AudioWorkletNode(audioContext, 'circular-buffer-processor');

    node.port.onmessage = (event) => {
        const buffer = event.data; // latest 0.1s audio samples
        // Do something with `buffer` here (an array of Float32 samples)

        drawWaveform(buffer, audioContext.sampleRate);
    };

    source.connect(node);

    requestLatestBuffer();
}
function requestLatestBuffer() {
    node.port.postMessage('getBuffer');
}
document.addEventListener("DOMContentLoaded", start);


