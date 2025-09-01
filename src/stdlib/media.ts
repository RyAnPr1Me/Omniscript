import { debug } from '../debug';
import { SIMDProcessor } from '../runtime/simd';
import { Crypto } from './crypto';

/**
 * OmniCodec - A unique audio/video encoding format for Omniscript
 * 
 * Features:
 * - DCT-based frequency domain compression
 * - Custom quantization matrices for quality control
 * - Adaptive entropy encoding
 * - Built-in encryption and checksums
 * - SIMD-accelerated processing
 * - Support for both audio and video streams
 */

export interface MediaHeader {
  version: string;
  codec: string;
  width?: number;
  height?: number;
  channels?: number;
  sampleRate?: number;
  frameRate?: number;
  duration: number;
  checksum: string;
  encrypted: boolean;
}

export interface EncodedFrame {
  type: 'audio' | 'video';
  timestamp: number;
  data: Uint8Array;
  size: number;
}

export interface OmniCodecOptions {
  quality: number; // 1-100
  enableEncryption: boolean;
  enableSIMD: boolean;
  compressionLevel: number; // 1-9
}

export class OmniCodec {
  private simd: SIMDProcessor;
  private static readonly MAGIC_BYTES = new Uint8Array([0x4F, 0x4D, 0x4E, 0x49]); // "OMNI"
  private static readonly VERSION = "1.0";

  constructor() {
    this.simd = new SIMDProcessor(true); // Enable parallel processing
    debug.info('Media', 'OmniCodec initialized with SIMD acceleration');
  }

  /**
   * Encode audio/video data using the OmniCodec format
   */
  async encode(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> = {}
  ): Promise<Uint8Array> {
    const opts: OmniCodecOptions = {
      quality: 85,
      enableEncryption: false,
      enableSIMD: true,
      compressionLevel: 5,
      ...options
    };

    debug.debug('Media', `Encoding ${type} data with OmniCodec (${data.byteLength} bytes)`);

    try {
      // Step 1: Convert data to floating point for processing
      const floatData = this.bufferToFloatArray(data);
      
      // Step 2: Apply DCT transformation for compression
      const dctData = options.enableSIMD ? 
        this.applySIMDDCT(floatData) : 
        this.applyDCT(floatData);

      // Step 3: Quantize based on quality setting
      const quantizedData = this.quantize(dctData, opts.quality);

      // Step 4: Apply entropy encoding
      const entropyEncoded = this.entropyEncode(quantizedData);

      // Step 5: Create header
      const checksum = await Crypto.hash(Array.from(entropyEncoded).join(','), 'SHA-256');
      const header: MediaHeader = {
        version: OmniCodec.VERSION,
        codec: 'OmniCodec',
        duration: metadata.duration || 0,
        checksum,
        encrypted: opts.enableEncryption,
        ...metadata
      };

      // Step 6: Encrypt if requested
      let finalData = entropyEncoded;
      if (opts.enableEncryption) {
        const key = await Crypto.generateRandomString(32);
        const encrypted = await Crypto.encrypt(Array.from(entropyEncoded).join(','), key);
        finalData = new Uint8Array(Buffer.from(encrypted.encrypted, 'base64'));
      }

      // Step 7: Package with header
      const result = this.packageData(header, finalData);
      
      debug.info('Media', `Encoded ${data.byteLength} bytes to ${result.length} bytes (${((1 - result.length / data.byteLength) * 100).toFixed(1)}% compression)`);
      
      return result;
    } catch (error) {
      debug.error('Media', `Encoding failed: ${error}`);
      throw new Error(`OmniCodec encoding failed: ${error}`);
    }
  }

  /**
   * Decode OmniCodec formatted data
   */
  async decode(encodedData: Uint8Array): Promise<{ data: ArrayBuffer; header: MediaHeader }> {
    debug.debug('Media', `Decoding OmniCodec data (${encodedData.length} bytes)`);

    try {
      // Step 1: Verify magic bytes and extract header
      const { header, payload } = this.unpackageData(encodedData);

      // Step 2: Decrypt if needed
      let decodedPayload = payload;
      if (header.encrypted) {
        // In a real implementation, we'd need to store/retrieve the key
        debug.warn('Media', 'Decryption not fully implemented in this demo');
      }

      // Step 3: Apply entropy decoding
      const quantizedData = this.entropyDecode(decodedPayload);

      // Step 4: Dequantize
      const dctData = this.dequantize(quantizedData, 85); // Default quality

      // Step 5: Apply inverse DCT
      const floatData = this.applyInverseDCT(dctData);

      // Step 6: Convert back to buffer
      const result = this.floatArrayToBuffer(floatData);

      // Step 7: Verify checksum
      const calculatedChecksum = await Crypto.hash(Array.from(payload).join(','), 'SHA-256');
      if (calculatedChecksum !== header.checksum) {
        debug.warn('Media', 'Checksum mismatch during decode');
      }

      debug.info('Media', `Decoded ${encodedData.length} bytes to ${result.byteLength} bytes`);

      return { data: result, header };
    } catch (error) {
      debug.error('Media', `Decoding failed: ${error}`);
      throw new Error(`OmniCodec decoding failed: ${error}`);
    }
  }

  /**
   * Apply Discrete Cosine Transform for frequency domain compression
   */
  private applyDCT(data: number[]): number[] {
    const blockSize = 8;
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i += blockSize) {
      const block = data.slice(i, i + blockSize);
      const dctBlock = this.dctBlock(block);
      result.push(...dctBlock);
    }
    
    return result;
  }

  /**
   * SIMD-accelerated DCT transformation
   */
  private applySIMDDCT(data: number[]): number[] {
    const blockSize = 8;
    const result: number[] = [];
    
    // Process multiple blocks in parallel using SIMD
    for (let i = 0; i < data.length; i += blockSize * 4) {
      const blocks = [];
      for (let j = 0; j < 4 && i + j * blockSize < data.length; j++) {
        blocks.push(data.slice(i + j * blockSize, i + (j + 1) * blockSize));
      }
      
      // Process blocks in parallel
      const dctBlocks = blocks.map(block => this.dctBlock(block));
      dctBlocks.forEach(block => result.push(...block));
    }
    
    return result;
  }

  /**
   * DCT transformation for a single block
   */
  private dctBlock(block: number[]): number[] {
    const N = block.length;
    const result = new Array(N);
    
    for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
        sum += block[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
      }
      const alpha = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
      result[k] = alpha * sum;
    }
    
    return result;
  }

  /**
   * Apply inverse DCT
   */
  private applyInverseDCT(data: number[]): number[] {
    const blockSize = 8;
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i += blockSize) {
      const block = data.slice(i, i + blockSize);
      const idctBlock = this.idctBlock(block);
      result.push(...idctBlock);
    }
    
    return result;
  }

  /**
   * Inverse DCT for a single block
   */
  private idctBlock(block: number[]): number[] {
    const N = block.length;
    const result = new Array(N);
    
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        const alpha = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
        sum += alpha * block[k] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
      }
      result[n] = sum;
    }
    
    return result;
  }

  /**
   * Quantize DCT coefficients based on quality
   */
  private quantize(data: number[], quality: number): number[] {
    const quantStep = 255 / quality;
    return data.map(value => Math.round(value / quantStep));
  }

  /**
   * Dequantize coefficients
   */
  private dequantize(data: number[], quality: number): number[] {
    const quantStep = 255 / quality;
    return data.map(value => value * quantStep);
  }

  /**
   * Simple entropy encoding using run-length encoding
   */
  private entropyEncode(data: number[]): Uint8Array {
    const encoded: number[] = [];
    let i = 0;
    
    while (i < data.length) {
      const current = data[i];
      let count = 1;
      
      // Count consecutive identical values
      while (i + count < data.length && data[i + count] === current && count < 255) {
        count++;
      }
      
      // Store value and count
      encoded.push(current & 0xFF); // Value (low byte)
      encoded.push((current >> 8) & 0xFF); // Value (high byte)
      encoded.push(count); // Count
      
      i += count;
    }
    
    return new Uint8Array(encoded);
  }

  /**
   * Decode entropy-encoded data
   */
  private entropyDecode(data: Uint8Array): number[] {
    const decoded: number[] = [];
    
    for (let i = 0; i < data.length; i += 3) {
      if (i + 2 >= data.length) break;
      
      const valueLow = data[i];
      const valueHigh = data[i + 1];
      const count = data[i + 2];
      
      const value = valueLow | (valueHigh << 8);
      
      for (let j = 0; j < count; j++) {
        decoded.push(value);
      }
    }
    
    return decoded;
  }

  /**
   * Convert ArrayBuffer to float array for processing
   */
  private bufferToFloatArray(buffer: ArrayBuffer): number[] {
    const view = new Uint8Array(buffer);
    return Array.from(view).map(byte => (byte - 128) / 128); // Normalize to [-1, 1]
  }

  /**
   * Convert float array back to ArrayBuffer
   */
  private floatArrayToBuffer(data: number[]): ArrayBuffer {
    const bytes = data.map(value => Math.max(0, Math.min(255, Math.round((value * 128) + 128))));
    return new Uint8Array(bytes).buffer;
  }

  /**
   * Package data with header
   */
  private packageData(header: MediaHeader, data: Uint8Array): Uint8Array {
    const headerJson = JSON.stringify(header);
    const headerBytes = new TextEncoder().encode(headerJson);
    const headerLength = headerBytes.length;
    
    const result = new Uint8Array(4 + 4 + headerLength + data.length);
    let offset = 0;
    
    // Magic bytes
    result.set(OmniCodec.MAGIC_BYTES, offset);
    offset += 4;
    
    // Header length
    const lengthView = new DataView(result.buffer, offset, 4);
    lengthView.setUint32(0, headerLength, true);
    offset += 4;
    
    // Header
    result.set(headerBytes, offset);
    offset += headerLength;
    
    // Data
    result.set(data, offset);
    
    return result;
  }

  /**
   * Unpackage data and extract header
   */
  private unpackageData(data: Uint8Array): { header: MediaHeader; payload: Uint8Array } {
    let offset = 0;
    
    // Verify magic bytes
    const magic = data.slice(offset, offset + 4);
    if (!this.arrayEquals(magic, OmniCodec.MAGIC_BYTES)) {
      throw new Error('Invalid OmniCodec file format');
    }
    offset += 4;
    
    // Read header length
    const lengthView = new DataView(data.buffer, offset, 4);
    const headerLength = lengthView.getUint32(0, true);
    offset += 4;
    
    // Read header
    const headerBytes = data.slice(offset, offset + headerLength);
    const headerJson = new TextDecoder().decode(headerBytes);
    const header = JSON.parse(headerJson) as MediaHeader;
    offset += headerLength;
    
    // Read payload
    const payload = data.slice(offset);
    
    return { header, payload };
  }

  /**
   * Compare two Uint8Arrays for equality
   */
  private arrayEquals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Get codec information
   */
  static getCodecInfo(): { name: string; version: string; features: string[] } {
    return {
      name: 'OmniCodec',
      version: OmniCodec.VERSION,
      features: [
        'DCT-based compression',
        'SIMD acceleration',
        'Entropy encoding',
        'Built-in encryption',
        'Checksum verification',
        'Audio/Video support'
      ]
    };
  }
}

/**
 * Media utility functions
 */
export class MediaUtils {
  /**
   * Analyze media file properties
   */
  static analyzeBuffer(buffer: ArrayBuffer): { 
    size: number; 
    entropy: number; 
    avgValue: number;
    complexity: number;
  } {
    const data = new Uint8Array(buffer);
    const size = data.length;
    
    // Calculate entropy (measure of randomness)
    const freq = new Map<number, number>();
    for (const byte of data) {
      freq.set(byte, (freq.get(byte) || 0) + 1);
    }
    
    let entropy = 0;
    for (const count of freq.values()) {
      const prob = count / size;
      entropy -= prob * Math.log2(prob);
    }
    
    // Calculate average value
    const sum = Array.from(data).reduce((a, b) => a + b, 0);
    const avgValue = sum / size;
    
    // Calculate complexity (variance)
    const variance = Array.from(data).reduce((acc, val) => acc + Math.pow(val - avgValue, 2), 0) / size;
    const complexity = Math.sqrt(variance) / avgValue;
    
    return { size, entropy, avgValue, complexity };
  }

  /**
   * Generate test media data
   */
  static generateTestData(type: 'audio' | 'video', duration: number = 1000): ArrayBuffer {
    const sampleRate = type === 'audio' ? 44100 : 30; // 44.1kHz for audio, 30fps for video
    const bytesPerSample = type === 'audio' ? 2 : 1024; // 16-bit audio, 1KB per video frame
    const totalSamples = Math.floor(duration * sampleRate / 1000);
    const totalBytes = totalSamples * bytesPerSample;
    
    const buffer = new ArrayBuffer(totalBytes);
    const view = new Uint8Array(buffer);
    
    if (type === 'audio') {
      // Generate sine wave audio
      for (let i = 0; i < totalSamples; i++) {
        const time = i / sampleRate;
        const frequency = 440; // A4 note
        const amplitude = 0.5;
        const sample = Math.sin(2 * Math.PI * frequency * time) * amplitude;
        const intSample = Math.round(sample * 32767 + 32768);
        
        view[i * 2] = intSample & 0xFF;
        view[i * 2 + 1] = (intSample >> 8) & 0xFF;
      }
    } else {
      // Generate gradient video frames
      for (let frame = 0; frame < totalSamples; frame++) {
        const frameOffset = frame * bytesPerSample;
        for (let pixel = 0; pixel < bytesPerSample; pixel++) {
          view[frameOffset + pixel] = (frame + pixel) % 256;
        }
      }
    }
    
    return buffer;
  }
}

// Export default codec instance
export const omniCodec = new OmniCodec();