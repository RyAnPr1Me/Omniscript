/**
 * Input validation and sanitization for OmniCodec
 */

import { ValidationError } from './media-errors';
import { MediaHeader, OmniCodecOptions } from './media';
import { debug } from '../debug';

export class MediaValidator {
  private static readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default
  private static readonly MAX_DIMENSIONS = 8192; // Max video width/height
  private static readonly MAX_SAMPLE_RATE = 192000; // Max audio sample rate
  private static readonly MAX_CHANNELS = 8; // Max audio channels
  private static readonly SUPPORTED_VERSIONS = ['1.0']; // Supported codec versions

  /**
   * Validate input data for encoding
   */
  static validateEncodeInput(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> = {}
  ): void {
    // Validate data buffer
    if (!data || !(data instanceof ArrayBuffer)) {
      throw new ValidationError('Data must be a valid ArrayBuffer');
    }

    if (data.byteLength === 0) {
      debug.warn('Media', 'Encoding empty data buffer');
      // Allow empty data for backwards compatibility
    }

    if (data.byteLength > this.MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size ${data.byteLength} exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`
      );
    }

    // Validate type
    if (type !== 'audio' && type !== 'video') {
      throw new ValidationError(`Invalid media type: ${type}. Must be 'audio' or 'video'`);
    }

    // Validate metadata
    this.validateMetadata(metadata, type);

    // Validate options
    this.validateOptions(options);
  }

  /**
   * Validate input data for decoding
   */
  static validateDecodeInput(encodedData: Uint8Array): void {
    if (!encodedData || !(encodedData instanceof Uint8Array)) {
      throw new ValidationError('Encoded data must be a valid Uint8Array');
    }

    if (encodedData.length === 0) {
      throw new ValidationError('Encoded data cannot be empty');
    }

    if (encodedData.length < 8) {
      // Check if this looks like an invalid format first
      if (encodedData.length >= 4) {
        const magicBytes = new Uint8Array([0x4F, 0x4D, 0x4E, 0x49]); // "OMNI"
        const hasValidMagic = encodedData.slice(0, 4).every((byte, i) => byte === magicBytes[i]);
        if (!hasValidMagic) {
          throw new ValidationError('Invalid OmniCodec file format');
        }
      }
      throw new ValidationError('Encoded data is too small to contain valid OmniCodec header');
    }
  }

  /**
   * Validate metadata based on media type
   */
  private static validateMetadata(metadata: Partial<MediaHeader>, type: 'audio' | 'video'): void {
    if (!metadata || typeof metadata !== 'object') {
      throw new ValidationError('Metadata must be a valid object');
    }

    // Validate duration
    if (metadata.duration !== undefined) {
      if (typeof metadata.duration !== 'number' || metadata.duration < 0) {
        throw new ValidationError('Duration must be a non-negative number');
      }
    }

    if (type === 'audio') {
      this.validateAudioMetadata(metadata);
    } else if (type === 'video') {
      this.validateVideoMetadata(metadata);
    }

    // Validate version if provided
    if (metadata.version && !this.SUPPORTED_VERSIONS.includes(metadata.version)) {
      throw new ValidationError(
        `Unsupported codec version: ${metadata.version}. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`
      );
    }
  }

  /**
   * Validate audio-specific metadata
   */
  private static validateAudioMetadata(metadata: Partial<MediaHeader>): void {
    if (metadata.channels !== undefined) {
      if (!Number.isInteger(metadata.channels) || metadata.channels < 1 || metadata.channels > this.MAX_CHANNELS) {
        throw new ValidationError(`Audio channels must be an integer between 1 and ${this.MAX_CHANNELS}`);
      }
    }

    if (metadata.sampleRate !== undefined) {
      if (!Number.isInteger(metadata.sampleRate) || metadata.sampleRate < 8000 || metadata.sampleRate > this.MAX_SAMPLE_RATE) {
        throw new ValidationError(`Sample rate must be an integer between 8000 and ${this.MAX_SAMPLE_RATE} Hz`);
      }
    }

    // Audio shouldn't have video properties
    if (metadata.width !== undefined || metadata.height !== undefined || metadata.frameRate !== undefined) {
      throw new ValidationError('Audio metadata should not contain video properties (width, height, frameRate)');
    }
  }

  /**
   * Validate video-specific metadata
   */
  private static validateVideoMetadata(metadata: Partial<MediaHeader>): void {
    if (metadata.width !== undefined) {
      if (!Number.isInteger(metadata.width) || metadata.width < 1 || metadata.width > this.MAX_DIMENSIONS) {
        throw new ValidationError(`Video width must be an integer between 1 and ${this.MAX_DIMENSIONS}`);
      }
    }

    if (metadata.height !== undefined) {
      if (!Number.isInteger(metadata.height) || metadata.height < 1 || metadata.height > this.MAX_DIMENSIONS) {
        throw new ValidationError(`Video height must be an integer between 1 and ${this.MAX_DIMENSIONS}`);
      }
    }

    if (metadata.frameRate !== undefined) {
      if (typeof metadata.frameRate !== 'number' || metadata.frameRate <= 0 || metadata.frameRate > 120) {
        throw new ValidationError('Video frame rate must be a number between 0 and 120 fps');
      }
    }

    // Video shouldn't have audio properties
    if (metadata.channels !== undefined || metadata.sampleRate !== undefined) {
      throw new ValidationError('Video metadata should not contain audio properties (channels, sampleRate)');
    }
  }

  /**
   * Validate encoding options
   */
  private static validateOptions(options: Partial<OmniCodecOptions>): void {
    if (options.quality !== undefined) {
      if (typeof options.quality !== 'number' || options.quality < 1 || options.quality > 100) {
        throw new ValidationError('Quality must be a number between 1 and 100');
      }
    }

    if (options.compressionLevel !== undefined) {
      if (!Number.isInteger(options.compressionLevel) || options.compressionLevel < 1 || options.compressionLevel > 9) {
        throw new ValidationError('Compression level must be an integer between 1 and 9');
      }
    }

    if (options.enableEncryption !== undefined && typeof options.enableEncryption !== 'boolean') {
      throw new ValidationError('enableEncryption must be a boolean');
    }

    if (options.enableSIMD !== undefined && typeof options.enableSIMD !== 'boolean') {
      throw new ValidationError('enableSIMD must be a boolean');
    }
  }

  /**
   * Sanitize input metadata to prevent injection attacks
   */
  static sanitizeMetadata(metadata: Partial<MediaHeader>): Partial<MediaHeader> {
    const sanitized: Partial<MediaHeader> = {};

    // Copy and sanitize safe numeric values
    const numericFields = ['duration', 'width', 'height', 'channels', 'sampleRate', 'frameRate'];
    for (const field of numericFields) {
      if (metadata[field as keyof MediaHeader] !== undefined) {
        const value = metadata[field as keyof MediaHeader] as number;
        if (typeof value === 'number' && isFinite(value)) {
          sanitized[field as keyof MediaHeader] = value as any;
        }
      }
    }

    // Copy and sanitize string values
    if (metadata.version && typeof metadata.version === 'string') {
      sanitized.version = metadata.version.replace(/[^\w.-]/g, ''); // Allow only alphanumeric, dots, hyphens
    }

    if (metadata.codec && typeof metadata.codec === 'string') {
      sanitized.codec = metadata.codec.replace(/[^\w]/g, ''); // Allow only alphanumeric
    }

    // Copy safe boolean values
    if (typeof metadata.encrypted === 'boolean') {
      sanitized.encrypted = metadata.encrypted;
    }

    // Don't copy checksum - this will be generated during encoding

    return sanitized;
  }

  /**
   * Validate header from decoded data
   */
  static validateHeader(header: MediaHeader): void {
    if (!header || typeof header !== 'object') {
      throw new ValidationError('Header must be a valid object');
    }

    if (!header.version || !this.SUPPORTED_VERSIONS.includes(header.version)) {
      throw new ValidationError(
        `Unsupported codec version: ${header.version}. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`
      );
    }

    if (!header.codec || header.codec !== 'OmniCodec') {
      throw new ValidationError(`Invalid codec: ${header.codec}. Expected 'OmniCodec'`);
    }

    if (typeof header.duration !== 'number' || header.duration < 0) {
      throw new ValidationError('Header duration must be a non-negative number');
    }

    if (!header.checksum || typeof header.checksum !== 'string') {
      throw new ValidationError('Header must contain a valid checksum');
    }

    if (typeof header.encrypted !== 'boolean') {
      throw new ValidationError('Header encrypted flag must be a boolean');
    }
  }
}