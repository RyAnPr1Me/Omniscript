# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [media-validator](#media-validator)

## media-validator

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/media-validator.ts`

### Classes

#### MediaValidator

**Properties**:

- `MAX_FILE_SIZE: any` - 
- `MAX_DIMENSIONS: any` - 
- `MAX_SAMPLE_RATE: any` - 
- `MAX_CHANNELS: any` - 
- `SUPPORTED_VERSIONS: any` - 

**Methods**:

##### validateEncodeInput

Validate input data for encoding

**Signature**: `static validateEncodeInput(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> =`

##### validateDecodeInput

Validate input data for decoding

**Signature**: `static validateDecodeInput(encodedData: Uint8Array): void`

##### validateMetadata

Validate metadata based on media type

**Signature**: `private static validateMetadata(metadata: Partial<MediaHeader>, type: 'audio' | 'video'): void`

##### validateAudioMetadata

Validate audio-specific metadata

**Signature**: `private static validateAudioMetadata(metadata: Partial<MediaHeader>): void`

##### validateVideoMetadata

Validate video-specific metadata

**Signature**: `private static validateVideoMetadata(metadata: Partial<MediaHeader>): void`

##### validateOptions

Validate encoding options

**Signature**: `private static validateOptions(options: Partial<OmniCodecOptions>): void`

##### sanitizeMetadata

Sanitize input metadata to prevent injection attacks

**Signature**: `static sanitizeMetadata(metadata: Partial<MediaHeader>): Partial<MediaHeader>`

##### validateHeader

Validate header from decoded data

**Signature**: `static validateHeader(header: MediaHeader): void`


