const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

let highestText = document.querySelector('.highestText');
let keyText = document.querySelector('.keyText');

function ApplyHamming(data) {
    for (let i = 0; i < data.length; i++) {
        data[i] *= 0.54 - 0.46 * Math.cos(i / data.length)
    }
}

function fft(x, N = x.length, s = 1){
    if (N === 1) {
        return {
            re: [x[0]],
            im: [0]
        };
    }
    let even = fft(x, N/2, s*2);
    let odd = fft(x.slice(s), N/2, s*2);

    const re = new Array(N);
    const im = new Array(N);

    for (let k = 0; k< N/2; k++){
        const angle = -2 * Math.PI * k / N;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        const tre = cos * odd.re[k] - sin * odd.im[k];
        const tim = sin * odd.re[k] + cos * odd.im[k];

        re[k] = even.re[k] + tre;
        im[k] = even.im[k] + tim;

        re[k + N / 2] = even.re[k] - tre;
        im[k + N / 2] = even.im[k] - tim;
    }

    return { re, im };

}

function drawWaveform(data, sampleRate) {
    if (!sampleRate) {sampleRate = new AudioContext().sampleRate;}
    // const width = canvas.width;
    canvas.width = 1900;
    const height = canvas.height;
    const middle = height / 2;

    ApplyHamming(data);

    ctx.clearRect(0, 0, data.length, height);
    ctx.beginPath();
    ctx.moveTo(0, height);

    let fourierData = [];

    // let waveIncrement = sampleRate/data.length;
/*    let waveIncrement = Math.pow(1/(sampleRate/2),1/data.length);
    let currentfreq = sampleRate/2
    let freqs = []
    for (let i = data.length; i >= 0; i--) {

        let sinSum = data.reduce((a, b, index) => {
            return a + Math.sin((index/sampleRate)*((2*Math.PI)/(1/currentfreq)))*b
        })
        let cosSum = data.reduce((a, b, index) => {
            return a + Math.cos(index/sampleRate*(2*Math.PI/(1/currentfreq)))*b
        })

        let length = Math.sqrt(cosSum*cosSum+sinSum*sinSum)
        let lengthDb = 10 * Math.log10(length)
        fourierData[i]=length

        freqs[i] = currentfreq;
        currentfreq *= waveIncrement;

    }
    console.log(freqs);*/

/*    const kernel = gaussianKernel(7, 1.5); // try size 5–9, sigma 1.0–2.0
    const smoothedFourier = applyConvolution(fourierData, kernel);*/
    const result = fft(data);
    const smoothedFourier = result.re.map((r, i) => Math.sqrt(r * r + result.im[i] * result.im[i]));



    // console.log(fourierData)
    // let highest = Math.max(...smoothedFourier)
    let highDb = 10 * Math.log10(50)  ;
    let lowDb = 10 * Math.log10(0.1)  ;

    let xMin = 20;
    let xMax = sampleRate/2
    let logMin = Math.log2(xMin);
    let logMax = Math.log2(xMax);
    let octaveWidth = 96*2;
    const graphHeight = height-15
    for (let i = 0; i < canvas.width; i++) {
        const logFreq = logMin + (i / canvas.width) * (logMax - logMin);
        const freq = Math.pow(2, logFreq);

        const bin = Math.round(freq * smoothedFourier.length / sampleRate);

        const mag = smoothedFourier[bin] || 0;
        const height =  (10 * Math.log10(mag + 1e-10))
        const heightCorrected = Math.max(height, 0);
        const y = graphHeight - heightCorrected;
        ctx.lineTo(i,y);



/*        const sample = smoothedFourier[i] || 0;
        let sampleY = (graphHeight) * (sample-lowDb)/(highDb-lowDb)
        sampleY = Math.max(sampleY, 0);
        sampleY = Math.min(sampleY, graphHeight);
        const y = graphHeight-sample*10;

        const x = octaveWidth * Math.log2(i+1)
        ctx.lineTo(x/smoothedFourier.length*1900, y);*/
    }


    ctx.strokeStyle = '#007acc';
    ctx.lineWidth = 1;
    ctx.stroke();


    // Draw x-axis line
    ctx.strokeStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(0, height-15);
    ctx.lineTo(canvas.width, height-15);
    ctx.stroke();

    // Draw x-axis time labels
    const tickSpacing = 50;
    // const timePerTick = durationSec / numTicks;

    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let highest = Math.max(...smoothedFourier);
    let freqIndex = smoothedFourier.indexOf(highest)
    let highestFreq = freqIndex*sampleRate/smoothedFourier.length;
    highestText.text = highestFreq.toFixed(2);
    keyText.text = frequencyToNoteName(highestFreq);
    console.log(smoothedFourier.length)

    for (let i = 0; i <= canvas.width/tickSpacing; i++) {
        const x = i * tickSpacing;
        const logFreq = logMin + (x / canvas.width) * (logMax - logMin);
        const freq = Math.pow(2, logFreq);
        ctx.fillText(`${Math.round(freq)} hz`, x, height - 10);
        ctx.beginPath();
        ctx.moveTo(x, height - 18);
        ctx.lineTo(x, height-12);
        ctx.stroke();
    }

    // requestLatestBuffer()
    node.port.postMessage('getBuffer');
}
function frequencyToNoteName(frequency) {
    if (frequency <= 0) return null;

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F',
        'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Calculate the nearest MIDI note number
    const midi = Math.round(12 * Math.log2(frequency / 440) + 69);

    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1; // MIDI note 0 is C-1

    return noteNames[noteIndex] + octave;
}

function gaussianKernel(size = 5, sigma = 1.0) {
    const kernel = [];
    const mean = Math.floor(size / 2);
    let sum = 0;

    for (let i = 0; i < size; i++) {
        const x = i - mean;
        const value = Math.exp(-(x * x) / (2 * sigma * sigma));
        kernel.push(value);
        sum += value;
    }

    // Normalize kernel
    return kernel.map(v => v / sum);
}
function applyConvolution(data, kernel) {
    const half = Math.floor(kernel.length / 2);
    const result = new Float32Array(data.length);

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < kernel.length; j++) {
            const k = i + j - half;
            if (k >= 0 && k < data.length) {
                sum += data[k] * kernel[j];
            }
        }
        result[i] = sum;
    }

    return result;
}

