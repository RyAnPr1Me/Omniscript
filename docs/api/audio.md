# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [audio](#audio)

## audio

**File**: `src/stdlib/audio.ts`

### Classes

#### AudioUtils

**Methods**:

##### createBuffer

**Signature**: `static createBuffer(duration: number, sampleRate: number = 44100, channels: number = 2): AudioBuffer`

##### clone

**Signature**: `static clone(buffer: AudioBuffer): AudioBuffer`

##### mixBuffers

**Signature**: `static mixBuffers(buffer1: AudioBuffer, buffer2: AudioBuffer, ratio: number = 0.5): AudioBuffer`

##### concatenate

**Signature**: `static concatenate(buffers: AudioBuffer[]): AudioBuffer`

##### normalize

**Signature**: `static normalize(buffer: AudioBuffer, targetLevel: number = 1.0): AudioBuffer`

##### fadeIn

**Signature**: `static fadeIn(buffer: AudioBuffer, duration: number): AudioBuffer`

##### fadeOut

**Signature**: `static fadeOut(buffer: AudioBuffer, duration: number): AudioBuffer`

#### Synthesizer

**Properties**:

- `oscillators: Map<string, Oscillator>` - 
- `sampleRate: number` - 

**Methods**:

##### createOscillator

**Signature**: `createOscillator(id: string, type: Oscillator['type'], frequency: number, amplitude: number = 1.0): void`

##### removeOscillator

**Signature**: `removeOscillator(id: string): boolean`

##### generateTone

**Signature**: `generateTone(frequency: number, duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer`

##### generateChord

**Signature**: `generateChord(frequencies: number[], duration: number, type: Oscillator['type'] = 'sine', amplitude: number = 0.5): AudioBuffer`

##### generateSequence

**Signature**: `generateSequence(notes:`

##### generateNoise

**Signature**: `generateNoise(duration: number, type: 'white' | 'pink' | 'brown' = 'white', amplitude: number = 0.5): AudioBuffer`

##### generateSample

**Signature**: `private generateSample(type: Oscillator['type'], frequency: number, time: number): number`

##### generateEnvelope

**Signature**: `generateEnvelope(duration: number, attack: number, decay: number, sustain: number, release: number): Float32Array`

##### applyEnvelope

**Signature**: `applyEnvelope(buffer: AudioBuffer, envelope: Float32Array): AudioBuffer`

#### ReverbEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### DelayEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### FilterEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### DistortionEffect

**Implements**: `AudioEffect`

**Properties**:

- `name: any` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params:`

#### AudioAnalyzer

**Methods**:

##### analyzeBuffer

**Signature**: `static analyzeBuffer(buffer: AudioBuffer): AnalysisResult`

##### performFFT

**Signature**: `private static performFFT(signal: Float32Array): Float32Array`

##### reverseBits

**Signature**: `private static reverseBits(num: number, bits: number): number`

#### AudioProcessor

**Properties**:

- `effects: AudioEffect[]` - 
- `config: AudioConfig` - 

**Methods**:

##### addEffect

**Signature**: `addEffect(effect: AudioEffect): void`

##### removeEffect

**Signature**: `removeEffect(name: string): boolean`

##### process

**Signature**: `process(buffer: AudioBuffer, effectParams?: Record<string, Record<string, number>>): AudioBuffer`

##### getConfig

**Signature**: `getConfig(): AudioConfig`

##### setConfig

**Signature**: `setConfig(config: Partial<AudioConfig>): void`

#### Audio

**Properties**:

- `Notes: any` - 

**Methods**:

##### createSynthesizer

**Signature**: `static createSynthesizer(sampleRate?: number): Synthesizer`

##### createProcessor

**Signature**: `static createProcessor(config?: AudioConfig): AudioProcessor`

##### createBuffer

**Signature**: `static createBuffer(duration: number, sampleRate?: number, channels?: number): AudioBuffer`

##### analyze

**Signature**: `static analyze(buffer: AudioBuffer): AnalysisResult`

##### midiToFrequency

**Signature**: `static midiToFrequency(midiNote: number): number`

##### frequencyToMidi

**Signature**: `static frequencyToMidi(frequency: number): number`

### Interfaces

#### AudioConfig

**Properties**:

- `sampleRate: number` - 
- `channels: number` - 
- `bitDepth: 8 | 16 | 24 | 32` - 
- `bufferSize: number` - 

#### AudioBuffer

**Properties**:

- `data: Float32Array[]` - 
- `sampleRate: number` - 
- `duration: number` - 
- `channels: number` - 

#### Oscillator

**Properties**:

- `type: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise'` - 
- `frequency: number` - 
- `amplitude: number` - 
- `phase: number` - 

#### AudioEffect

**Properties**:

- `name: string` - 

**Methods**:

##### apply

**Signature**: `apply(buffer: AudioBuffer, params?: Record<string, number>): AudioBuffer;`

#### AnalysisResult

**Properties**:

- `rms: number` - 
- `peak: number` - 
- `frequency: number[]` - 
- `magnitude: number[]` - 
- `spectralCentroid: number` - 
- `zeroCrossingRate: number` - 


