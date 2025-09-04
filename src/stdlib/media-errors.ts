/**
 * Production-grade error types for OmniCodec
 */

export enum OmniCodecErrorCode {
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_FORMAT = "INVALID_FORMAT",
  ENCODING_FAILED = "ENCODING_FAILED",
  DECODING_FAILED = "DECODING_FAILED",
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
  CHECKSUM_MISMATCH = "CHECKSUM_MISMATCH",
  UNSUPPORTED_VERSION = "UNSUPPORTED_VERSION",
  INVALID_QUALITY = "INVALID_QUALITY",
  MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
  KEY_MANAGEMENT_ERROR = "KEY_MANAGEMENT_ERROR",
}

export class OmniCodecError extends Error {
  public readonly code: OmniCodecErrorCode;
  public readonly details?: any;

  constructor(code: OmniCodecErrorCode, message: string, details?: any) {
    super(message);
    this.name = "OmniCodecError";
    this.code = code;
    this.details = details;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, OmniCodecError.prototype);
  }
}

export class ValidationError extends OmniCodecError {
  constructor(message: string, details?: any) {
    super(OmniCodecErrorCode.INVALID_INPUT, message, details);
    this.name = "ValidationError";
  }
}

export class EncodingError extends OmniCodecError {
  constructor(message: string, details?: any) {
    super(OmniCodecErrorCode.ENCODING_FAILED, message, details);
    this.name = "EncodingError";
  }
}

export class DecodingError extends OmniCodecError {
  constructor(message: string, details?: any) {
    super(OmniCodecErrorCode.DECODING_FAILED, message, details);
    this.name = "DecodingError";
  }
}

export class EncryptionError extends OmniCodecError {
  constructor(message: string, details?: any) {
    super(OmniCodecErrorCode.ENCRYPTION_FAILED, message, details);
    this.name = "EncryptionError";
  }
}

export class ChecksumError extends OmniCodecError {
  constructor(message: string, details?: any) {
    super(OmniCodecErrorCode.CHECKSUM_MISMATCH, message, details);
    this.name = "ChecksumError";
  }
}
