const fs = require('fs');
const path = require('path');

const SONGS_DIR = path.join(__dirname, '../public/songs');

function generateWav(filename, baseFreq = 440, chords = [1, 1.25, 1.5], duration = 12) {
  const sampleRate = 22050;
  const numSamples = sampleRate * duration;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16)

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant warm retro synth tones with envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // Smooth fade in / fade out envelope
    const envelope = Math.min(1, t / 0.5) * Math.min(1, (duration - t) / 0.8);

    // Sum harmonic chord frequencies
    chords.forEach((mult, idx) => {
      const f = baseFreq * mult;
      // Fundamental + subtle warm overtone
      sample += (Math.sin(2 * Math.PI * f * t) * 0.4 + Math.sin(4 * Math.PI * f * t) * 0.1) * (1 / (idx + 1));
    });

    // Add rhythmic pulse
    const lfo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t);
    sample = sample * envelope * lfo * 0.6;

    // Clamp and convert to 16-bit integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const filePath = path.join(SONGS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created sample audio file: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
}

// Ensure dir exists
if (!fs.existsSync(SONGS_DIR)) {
  fs.mkdirSync(SONGS_DIR, { recursive: true });
}

// Generate demo tracks with distinct acoustic / synth chords
generateWav('Tame Impala - Borderline.wav', 330, [1, 1.25, 1.5, 1.875], 16);
generateWav('Tame Impala - The Less I Know The Better.wav', 293.66, [1, 1.2, 1.5], 18);
generateWav('Tame Impala - Feels Like We Only Go Backwards.wav', 261.63, [1, 1.25, 1.5], 15);
generateWav('The Neighbourhood - Lovebomb.wav', 220, [1, 1.189, 1.498, 1.782], 14);
generateWav('Daft Punk - Instant Crush.wav', 349.23, [1, 1.25, 1.5, 2], 20);
generateWav('Fleetwood Mac - Dreams.wav', 220, [1, 1.25, 1.5], 22);
generateWav('Arctic Monkeys - Do I Wanna Know.wav', 146.83, [1, 1.2, 1.5, 2], 19);
generateWav('Gorillaz - Feel Good Inc.wav', 174.61, [1, 1.25, 1.5], 18);
generateWav('Childish Gambino - Redbone.wav', 293.66, [1, 1.25, 1.5, 1.875], 24);
generateWav('Pink Floyd - Breathe (In the Air).wav', 164.81, [1, 1.25, 1.5], 25);
generateWav('The Weeknd - Blinding Lights.wav', 329.63, [1, 1.25, 1.5, 2], 20);
generateWav('Mac DeMarco - Chamber of Reflection.wav', 246.94, [1, 1.2, 1.5], 21);

// Remove stale 153 byte dummy files
const staleFiles = [
  'Daft Punk - Instant Crush.mp3',
  'Tame Impala - Borderline.mp3',
  'Tame Impala - Feels Like We Only Go Backwards.mp3',
  'Tame Impala - The Less I Know The Better.mp3',
  'The Neighbourhood - Lovebomb.mp3',
];
staleFiles.forEach(f => {
  const p = path.join(SONGS_DIR, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

console.log('✅ Demo song library generated successfully in /public/songs/');
