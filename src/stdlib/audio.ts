/**
 * Advanced audio processing library for Omniscript
 * Supports audio synthesis, analysis, effects, and real-time processing
 */

import { MathUtils } from './math';
import { logger } from './logging';

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: 8 | 16 | 24 | 32;
  bufferSize: number;
}

export interface AudioBuffer {
  data: Float32Array[];
  sampleRate: number;
  duration: number;
  channels: number;
}

export interface Oscillator {
  type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';
  frequency: number;
  amplitude: number;
  phase: number;
}

export interface AudioEffect {
  name: string;
  apply(buffer: AudioBuffer, params?: Record<string, number>): AudioBuffer;
}

export interface AnalysisResult {
  rms: number;
  peak: number;
  frequency: number[];
  magnitude: number[];
  spectralCentroid: number;
  zeroCrossingRate: number;
}

// Audio buffer utilities
export class AudioUtils {
  static createBuffer(duration: number, sampleRate: number = 44100, channels: number = 2): AudioBuffer {
    const samples = Math.floor(duration * sampleRate);
    const data: Float32Array[] = [];
    
    for (let i = 0; i < channels; i++) {
      data.push(new Float32Array(samples));
    }
    
    return {
      data,
      sampleRate,
      duration,
      channels
    };
  }

  static clone(buffer: AudioBuffer): AudioBuffer {
    return {
      data: buffer.data.map(channel => new Float32Array(channel)),
      sampleRate: buffer.sampleRate,
      duration: buffer.duration,
      channels: buffer.channels
    };
  }

  static mixBuffers(buffer1: AudioBuffer, buffer2: AudioBuffer, ratio: number = 0.5): AudioBuffer {
    if (buffer1.sampleRate !== buffer2.sampleRate) {
      throw new Error('Sample rates must match');
    }

    const channels = Math.max(buffer1.channels, buffer2.channels);
    const samples = Math.max(buffer1.data[0].length, buffer2.data[0].length);
    const result = this.createBuffer(samples / buffer1.sampleRate, buffer1.sampleRate, channels);

    for (let c = 0; c < channels; c++) {
      const channel1 = buffer1.data[c] || new Float32Array(samples);
      const channel2 = buffer2.data[c] || new Float32Array(samples);
      
      for (let i = 0; i < samples; i++) {
        const sample1 = i < channel1.length ? channel1[i] : 0;
        const sample2 = i < channel2.length ? channel2[i] : 0;
        result.data[c][i] = sample1 * (1 - ratio) + sample2 * ratio;
      }
    }

    return result;
  }

  static concatenate(buffers: AudioBuffer[]): AudioBuffer {
    if (buffers.length === 0) {
      throw new Error('Cannot concatenate empty buffer array');
    }

    const sampleRate = buffers[0].sampleRate;
    const channels = Math.max(...buffers.map(b => b.channels));
    
    // Verify all buffers have same sample rate
    if (!buffers.every(b => b.sampleRate === sampleRate)) {
      throw new Error('All buffers must have the same sample rate');
    }

    const totalSamples = buffers.reduce((sum, buffer) => sum + buffer.data[0].length, 0);
    const result = this.createBuffer(totalSamples / sampleRate, sampleRate, channels);

    let offset = 0;
    for (const buffer of buffers) {
      for (let c = 0; c < channels; c++) {
        const sourceChannel = buffer.data[c] || new Float32Array(buffer.data[0].length);
        result.data[c].set(sourceChannel, offset);
      }
      offset += buffer.data[0].length;
    }

    return result;
  }

  static normalize(buffer: AudioBuffer, targetLevel: number = 1.0): AudioBuffer {
    const result = this.clone(buffer);
    
    // Find peak across all channels
    let peak = 0;
    for (const channel of result.data) {
      for (let i = 0; i < channel.length; i++) {
        peak = Math.max(peak, Math.abs(channel[i]));
      }
    }

    if (peak === 0) return result;

    const gain = targetLevel / peak;
    for (const channel of result.data) {
      for (let i = 0; i < channel.length; i++) {
        channel[i] *= gain;
      }
    }

    return result;
  }

  static fadeIn(buffer: AudioBuffer, duration: number): AudioBuffer {
    const result = this.clone(buffer);
    const fadeSamples = Math.floor(duration * buffer.sampleRate);
    
    for (const channel of result.data) {
      for (let i = 0; i < Math.min(fadeSamples, channel.length); i++) {
        const gain = i / fadeSamples;
        channel[i] *= gain;
      }
    }

    return result;
  }

  static fadeOut(buffer: AudioBuffer, duration: number): AudioBuffer {
    const result = this.clone(buffer);
    const fadeSamples = Math.floor(duration * buffer.sampleRate);
    
    for (const channel of result.data) {
      const startSample = Math.max(0, channel.length - fadeSamples);
      for (let i = startSample; i < channel.length; i++) {
        const gain = (channel.length - i) / fadeSamples;
        channel[i] *= gain;
      }
    }

    return result;
  }
}

// Audio synthesis
export class Synthesizer {
  private oscillators: Map<string, Oscillator> = new Map();
  private sampleRate: number;

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate;
  }

  createOscillator(id: string, type: Oscillator['type'], frequency: number, amplitude: number = 1.0): void {
    this.oscillators.set(id, {
      type,
      frequency,
      amplitude,
      phase: 0
    });
  }

  removeOscillator(id: string): boolean {
    return this.oscillators.delete(id);
  }

  generateTone(frequency: number, duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer {
    const buffer = AudioUtils.createBuffer(duration, this.sampleRate, 1);
    const samples = buffer.data[0];
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / this.sampleRate;
      samples[i] = this.generateSample(type, frequency, t) * amplitude;
    }

    return buffer;
  }

  generateChord(frequencies: number[], duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer {
    const buffers = frequencies.map(freq => this.generateTone(freq, duration, type, amplitude / frequencies.length));
    
    let result = buffers[0];
    for (let i = 1; i < buffers.length; i++) {
      result = AudioUtils.mixBuffers(result, buffers[i], 0.5);
    }

    return result;
  }

  generateSequence(notes: { frequency: number; duration: number; type?: Oscillator['type'] }[], amplitude: number = 0.5): AudioBuffer {
    const buffers = notes.map(note => 
      this.generateTone(note.frequency, note.duration, note.type || 'sine', amplitude)
    );
    
    return AudioUtils.concatenate(buffers);
  }

  generateNoise(duration: number, type: 'white' | 'pink' | 'brown' = 'white', amplitude: number = 0.5): AudioBuffer {
    const buffer = AudioUtils.createBuffer(duration, this.sampleRate, 1);
    const samples = buffer.data[0];
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // For pink noise
    
    for (let i = 0; i < samples.length; i++) {
      let sample = 0;
      
      switch (type) {
        case 'white':
          sample = (Math.random() * 2 - 1) * amplitude;
          break;
          
        case 'pink':
          // Paul Kellett's pink noise algorithm
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * amplitude * 0.11;
          b6 = white * 0.115926;
          break;
          
        case 'brown':
          // Brown noise (integrated white noise)
          const brownWhite = Math.random() * 2 - 1;
          b0 = (b0 + brownWhite * 0.02) * 0.99;
          sample = b0 * 3.5 * amplitude;
          break;
      }
      
      samples[i] = Math.max(-1, Math.min(1, sample)); // Clamp to [-1, 1]
    }

    return buffer;
  }

  private generateSample(type: Oscillator['type'], frequency: number, time: number): number {
    const phase = 2 * Math.PI * frequency * time;
    
    switch (type) {
      case 'sine':
        return Math.sin(phase);
        
      case 'square':
        return Math.sin(phase) >= 0 ? 1 : -1;
        
      case 'sawtooth':
        return 2 * (time * frequency - Math.floor(time * frequency + 0.5));
        
      case 'triangle':
        const saw = 2 * (time * frequency - Math.floor(time * frequency + 0.5));
        return 2 * Math.abs(saw) - 1;
        
      case 'noise':
        return Math.random() * 2 - 1;
        
      default:
        return 0;
    }
  }

  // ADSR Envelope
  generateEnvelope(duration: number, attack: number, decay: number, sustain: number, release: number): Float32Array {
    const samples = Math.floor(duration * this.sampleRate);
    const envelope = new Float32Array(samples);
    
    const attackSamples = Math.floor(attack * this.sampleRate);
    const decaySamples = Math.floor(decay * this.sampleRate);
    const releaseSamples = Math.floor(release * this.sampleRate);
    const sustainSamples = samples - attackSamples - decaySamples - releaseSamples;
    
    let index = 0;
    
    // Attack
    for (let i = 0; i < attackSamples && index < samples; i++, index++) {
      envelope[index] = i / attackSamples;
    }
    
    // Decay
    for (let i = 0; i < decaySamples && index < samples; i++, index++) {
      envelope[index] = 1 - (1 - sustain) * (i / decaySamples);
    }
    
    // Sustain
    for (let i = 0; i < sustainSamples && index < samples; i++, index++) {
      envelope[index] = sustain;
    }
    
    // Release
    for (let i = 0; i < releaseSamples && index < samples; i++, index++) {
      envelope[index] = sustain * (1 - i / releaseSamples);
    }
    
    return envelope;
  }

  applyEnvelope(buffer: AudioBuffer, envelope: Float32Array): AudioBuffer {
    const result = AudioUtils.clone(buffer);
    
    for (const channel of result.data) {
      for (let i = 0; i < channel.length && i < envelope.length; i++) {
        channel[i] *= envelope[i];
      }
    }
    
    return result;
  }
}

// Audio effects
export class ReverbEffect implements AudioEffect {
  name = 'reverb';

  apply(buffer: AudioBuffer, params: { roomSize?: number; damping?: number; wetness?: number } = {}): AudioBuffer {
    const { roomSize = 0.5, damping = 0.5, wetness = 0.3 } = params;
    const result = AudioUtils.clone(buffer);
    
    // Simple comb filter reverb
    const delaySamples = Math.floor(roomSize * 0.05 * buffer.sampleRate);
    
    for (const channel of result.data) {
      const delayBuffer = new Float32Array(delaySamples);
      let delayIndex = 0;
      
      for (let i = 0; i < channel.length; i++) {
        const delayed = delayBuffer[delayIndex];
        const output = channel[i] + delayed * wetness;
        
        delayBuffer[delayIndex] = channel[i] + delayed * damping;
        delayIndex = (delayIndex + 1) % delaySamples;
        
        channel[i] = output;
      }
    }
    
    return result;
  }
}

export class DelayEffect implements AudioEffect {
  name = 'delay';

  apply(buffer: AudioBuffer, params: { delayTime?: number; feedback?: number; wetness?: number } = {}): AudioBuffer {
    const { delayTime = 0.3, feedback = 0.4, wetness = 0.3 } = params;
    const result = AudioUtils.clone(buffer);
    
    const delaySamples = Math.floor(delayTime * buffer.sampleRate);
    
    for (const channel of result.data) {
      const delayBuffer = new Float32Array(delaySamples);
      let delayIndex = 0;
      
      for (let i = 0; i < channel.length; i++) {
        const delayed = delayBuffer[delayIndex];
        const output = channel[i] + delayed * wetness;
        
        delayBuffer[delayIndex] = channel[i] + delayed * feedback;
        delayIndex = (delayIndex + 1) % delaySamples;
        
        channel[i] = output;
      }
    }
    
    return result;
  }
}

export class FilterEffect implements AudioEffect {
  name = 'filter';

  apply(buffer: AudioBuffer, params: { type?: 'lowpass' | 'highpass' | 'bandpass'; frequency?: number; resonance?: number } = {}): AudioBuffer {
    const { type = 'lowpass', frequency = 1000, resonance = 1 } = params;
    const result = AudioUtils.clone(buffer);
    
    // Simple biquad filter
    const nyquist = buffer.sampleRate / 2;
    const normalizedFreq = frequency / nyquist;
    const omega = 2 * Math.PI * normalizedFreq;
    const sin = Math.sin(omega);
    const cos = Math.cos(omega);
    const alpha = sin / (2 * resonance);
    
    let a0, a1, a2, b0, b1, b2;
    
    switch (type) {
      case 'lowpass':
        b0 = (1 - cos) / 2;
        b1 = 1 - cos;
        b2 = (1 - cos) / 2;
        a0 = 1 + alpha;
        a1 = -2 * cos;
        a2 = 1 - alpha;
        break;
        
      case 'highpass':
        b0 = (1 + cos) / 2;
        b1 = -(1 + cos);
        b2 = (1 + cos) / 2;
        a0 = 1 + alpha;
        a1 = -2 * cos;
        a2 = 1 - alpha;
        break;
        
      case 'bandpass':
        b0 = alpha;
        b1 = 0;
        b2 = -alpha;
        a0 = 1 + alpha;
        a1 = -2 * cos;
        a2 = 1 - alpha;
        break;
        
      default:
        return result;
    }
    
    // Normalize coefficients
    b0 /= a0;
    b1 /= a0;
    b2 /= a0;
    a1 /= a0;
    a2 /= a0;
    
    for (const channel of result.data) {
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      
      for (let i = 0; i < channel.length; i++) {
        const x0 = channel[i];
        const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        
        channel[i] = y0;
        
        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = y0;
      }
    }
    
    return result;
  }
}

export class DistortionEffect implements AudioEffect {
  name = 'distortion';

  apply(buffer: AudioBuffer, params: { drive?: number; amount?: number } = {}): AudioBuffer {
    const { drive = 2, amount = 0.5 } = params;
    const result = AudioUtils.clone(buffer);
    
    for (const channel of result.data) {
      for (let i = 0; i < channel.length; i++) {
        const input = channel[i] * drive;
        let output;
        
        // Soft clipping
        if (Math.abs(input) > 1) {
          output = Math.sign(input);
        } else {
          output = input * (1 - Math.abs(input) * amount);
        }
        
        channel[i] = output;
      }
    }
    
    return result;
  }
}

// Audio analysis
export class AudioAnalyzer {
  static analyzeBuffer(buffer: AudioBuffer): AnalysisResult {
    const firstChannel = buffer.data[0];
    
    // Calculate RMS and peak
    let rms = 0;
    let peak = 0;
    let zeroCrossings = 0;
    
    for (let i = 0; i < firstChannel.length; i++) {
      const sample = firstChannel[i];
      rms += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
      
      if (i > 0 && Math.sign(firstChannel[i - 1]) !== Math.sign(sample)) {
        zeroCrossings++;
      }
    }
    
    rms = Math.sqrt(rms / firstChannel.length);
    const zeroCrossingRate = zeroCrossings / (firstChannel.length / buffer.sampleRate);
    
    // FFT analysis (simplified)
    const fftSize = Math.min(2048, MathUtils.nextPowerOfTwo(firstChannel.length));
    const fft = this.performFFT(firstChannel.slice(0, fftSize));
    
    const frequency: number[] = [];
    const magnitude: number[] = [];
    
    for (let i = 0; i < fft.length / 2; i++) {
      frequency.push((i * buffer.sampleRate) / fftSize);
      magnitude.push(Math.sqrt(fft[i * 2] * fft[i * 2] + fft[i * 2 + 1] * fft[i * 2 + 1]));
    }
    
    // Calculate spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequency.length; i++) {
      weightedSum += frequency[i] * magnitude[i];
      magnitudeSum += magnitude[i];
    }
    
    const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    return {
      rms,
      peak,
      frequency,
      magnitude,
      spectralCentroid,
      zeroCrossingRate
    };
  }

  private static performFFT(signal: Float32Array): Float32Array {
    const n = signal.length;
    if (n <= 1) return signal;
    
    // Simple FFT implementation (for demo - use optimized library in production)
    const result = new Float32Array(n * 2); // Complex numbers (real, imaginary pairs)
    
    // Copy input to result (real parts)
    for (let i = 0; i < n; i++) {
      result[i * 2] = signal[i];
      result[i * 2 + 1] = 0; // Imaginary part
    }
    
    // Bit-reverse copy
    for (let i = 0; i < n; i++) {
      const j = this.reverseBits(i, Math.log2(n));
      if (i < j) {
        [result[i * 2], result[j * 2]] = [result[j * 2], result[i * 2]];
        [result[i * 2 + 1], result[j * 2 + 1]] = [result[j * 2 + 1], result[i * 2 + 1]];
      }
    }
    
    // Cooley-Tukey FFT
    for (let size = 2; size <= n; size <<= 1) {
      const halfSize = size >> 1;
      const step = n / size;
      
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + halfSize; j++, k += step) {
          const u_r = result[j * 2];
          const u_i = result[j * 2 + 1];
          const angle = -2 * Math.PI * k / n;
          const cos_a = Math.cos(angle);
          const sin_a = Math.sin(angle);
          const t_r = result[(j + halfSize) * 2] * cos_a - result[(j + halfSize) * 2 + 1] * sin_a;
          const t_i = result[(j + halfSize) * 2] * sin_a + result[(j + halfSize) * 2 + 1] * cos_a;
          
          result[j * 2] = u_r + t_r;
          result[j * 2 + 1] = u_i + t_i;
          result[(j + halfSize) * 2] = u_r - t_r;
          result[(j + halfSize) * 2 + 1] = u_i - t_i;
        }
      }
    }
    
    return result;
  }

  private static reverseBits(num: number, bits: number): number {
    let result = 0;
    for (let i = 0; i < bits; i++) {
      result = (result << 1) | (num & 1);
      num >>= 1;
    }
    return result;
  }
}

// Audio processor for real-time processing
export class AudioProcessor {
  private effects: AudioEffect[] = [];
  private config: AudioConfig;

  constructor(config: AudioConfig = { sampleRate: 44100, channels: 2, bitDepth: 16, bufferSize: 1024 }) {
    this.config = config;
  }

  addEffect(effect: AudioEffect): void {
    this.effects.push(effect);
    logger.debug('Audio - Added effect', { name: effect.name });
  }

  removeEffect(name: string): boolean {
    const index = this.effects.findIndex(effect => effect.name === name);
    if (index >= 0) {
      this.effects.splice(index, 1);
      logger.debug('Audio - Removed effect', { name });
      return true;
    }
    return false;
  }

  process(buffer: AudioBuffer, effectParams?: Record<string, Record<string, number>>): AudioBuffer {
    let result = buffer;
    
    for (const effect of this.effects) {
      const params = effectParams?.[effect.name] || {};
      result = effect.apply(result, params);
    }
    
    return result;
  }

  getConfig(): AudioConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Audio factory
export class Audio {
  static createSynthesizer(sampleRate?: number): Synthesizer {
    return new Synthesizer(sampleRate);
  }

  static createProcessor(config?: AudioConfig): AudioProcessor {
    return new AudioProcessor(config);
  }

  static createBuffer(duration: number, sampleRate?: number, channels?: number): AudioBuffer {
    return AudioUtils.createBuffer(duration, sampleRate, channels);
  }

  static analyze(buffer: AudioBuffer): AnalysisResult {
    return AudioAnalyzer.analyzeBuffer(buffer);
  }

  // Common musical frequencies (A4 = 440 Hz)
  static readonly Notes = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25
  };

  // Convert MIDI note number to frequency
  static midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  // Convert frequency to MIDI note number
  static frequencyToMidi(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
  }
}

// Export effects
export const Effects = {
  Reverb: ReverbEffect,
  Delay: DelayEffect,
  Filter: FilterEffect,
  Distortion: DistortionEffect
};

// Only log initialization in non-CLI contexts
if (!process.argv.some(arg => arg.includes('cli.js') || arg.includes('bin/cli'))) {
  logger.info('Audio library initialized');
}