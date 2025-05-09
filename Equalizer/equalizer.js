import FFT from 'fft.js';

const canvas = document.getElementById('spectrum');
const ctx = canvas.getContext('2d');
const fftSize = 1024;
const fft = new FFT(fftSize);
const spectrum = fft.createComplexArray();
const output = fft.createComplexArray();
const hann = Array.from({length: fftSize}, (_, i) =>
    0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)))
);

const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = fftSize;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    draw();
});

const timeData = new Float32Array(fftSize);

function draw() {
    requestAnimationFrame(draw);
    analyser.getFloatTimeDomainData(timeData);

    // Apply window
    const windowed = timeData.map((x, i) => x * hann[i]);

    // FFT
    fft.realTransform(spectrum, windowed);
    fft.completeSpectrum(spectrum);

    // Modify spectrum (equalizer-style)
    applyEQ(spectrum);

    // Visualize magnitude
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const binCount = fftSize / 2;
    const barWidth = canvas.width / binCount;

    for (let i = 0; i < binCount; i++) {
        const real = spectrum[2 * i];
        const imag = spectrum[2 * i + 1];
        const mag = Math.sqrt(real * real + imag * imag);

        const db = 20 * Math.log10(mag + 1e-6); // avoid log(0)
        const height = ((db + 100) / 100) * canvas.height;

        ctx.fillStyle = `hsl(${i * 360 / binCount}, 100%, 50%)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
    }
}

function applyEQ(spectrum) {
    for (let i = 0; i < fftSize / 2; i++) {
        const freq = i * audioCtx.sampleRate / fftSize;
        let gain = 1;

        if (freq < 200) gain = 1.5;         // Boost bass
        else if (freq < 2000) gain = 0.8;   // Cut mids
        else gain = 1.2;                    // Boost treble

        spectrum[2 * i] *= gain;
        spectrum[2 * i + 1] *= gain;
    }
}
