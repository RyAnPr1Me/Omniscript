# OmniCodec Media Encoding

The **OmniCodec** is a unique audio and video encoding format implemented in the Omniscript standard library. It provides efficient compression, SIMD acceleration, and built-in security features.

## Features

- **DCT-based Compression**: Uses Discrete Cosine Transform for frequency domain compression
- **SIMD Acceleration**: Leverages parallel processing for enhanced performance
- **Entropy Encoding**: Run-length encoding for efficient data compression
- **Quality Control**: Configurable quality levels (1-100) and compression settings
- **Security**: Built-in encryption support and checksum verification
- **Dual Format Support**: Handles both audio and video data streams
- **Cross-platform**: Compatible across different platforms and architectures

## API Reference

### OmniCodec Class

#### `encode(data, type, metadata, options)`

Encodes audio or video data using the OmniCodec format.

**Parameters:**
- `data` (ArrayBuffer): Raw audio/video data to encode
- `type` ('audio' | 'video'): Type of media data
- `metadata` (Partial<MediaHeader>): Media metadata (duration, resolution, etc.)
- `options` (Partial<OmniCodecOptions>): Encoding options

**Returns:** Promise<Uint8Array> - Encoded data

**Example:**
```typescript
const codec = new OmniCodec();
const audioData = new ArrayBuffer(8192); // Your audio data

const encoded = await codec.encode(audioData, 'audio', {
  channels: 2,
  sampleRate: 44100,
  duration: 1000
}, {
  quality: 85,
  enableSIMD: true,
  compressionLevel: 6
});
```

#### `decode(encodedData)`

Decodes OmniCodec formatted data.

**Parameters:**
- `encodedData` (Uint8Array): Encoded data to decode

**Returns:** Promise<{data: ArrayBuffer, header: MediaHeader}> - Decoded data and metadata

**Example:**
```typescript
const decoded = await codec.decode(encodedData);
console.log('Decoded size:', decoded.data.byteLength);
console.log('Original metadata:', decoded.header);
```

#### `getCodecInfo()`

Returns information about the codec.

**Returns:** Object with codec name, version, and features

### MediaUtils Class

#### `analyzeBuffer(buffer)`

Analyzes media buffer properties.

**Parameters:**
- `buffer` (ArrayBuffer): Buffer to analyze

**Returns:** Object with size, entropy, average value, and complexity metrics

#### `generateTestData(type, duration)`

Generates test media data for testing purposes.

**Parameters:**
- `type` ('audio' | 'video'): Type of test data to generate
- `duration` (number): Duration in milliseconds

**Returns:** ArrayBuffer with generated test data

## Configuration Options

### OmniCodecOptions

```typescript
interface OmniCodecOptions {
  quality: number;        // 1-100, higher = better quality
  enableEncryption: boolean;  // Enable built-in encryption
  enableSIMD: boolean;    // Use SIMD acceleration
  compressionLevel: number;   // 1-9, higher = more compression
}
```

### MediaHeader

```typescript
interface MediaHeader {
  version: string;        // Codec version
  codec: string;          // Codec name
  width?: number;         // Video width (video only)
  height?: number;        // Video height (video only)
  channels?: number;      // Audio channels (audio only)
  sampleRate?: number;    // Audio sample rate (audio only)
  frameRate?: number;     // Video frame rate (video only)
  duration: number;       // Duration in milliseconds
  checksum: string;       // Data integrity checksum
  encrypted: boolean;     // Whether data is encrypted
}
```

## Usage Examples

### Basic Audio Encoding

```typescript
import { OmniCodec, MediaUtils } from 'stdlib';

const codec = new OmniCodec();

// Generate test audio data
const audioData = MediaUtils.generateTestData('audio', 2000); // 2 seconds

// Encode with high quality
const encoded = await codec.encode(audioData, 'audio', {
  channels: 2,
  sampleRate: 44100,
  duration: 2000
}, {
  quality: 95,
  enableSIMD: true
});

console.log(`Compressed from ${audioData.byteLength} to ${encoded.length} bytes`);

// Decode
const decoded = await codec.decode(encoded);
console.log('Decoded successfully:', decoded.header);
```

### Video Encoding with Encryption

```typescript
import { OmniCodec } from 'stdlib';

const codec = new OmniCodec();
const videoData = getVideoData(); // Your video data

const encoded = await codec.encode(videoData, 'video', {
  width: 1920,
  height: 1080,
  frameRate: 30,
  duration: 5000
}, {
  quality: 75,
  enableEncryption: true,  // Enable encryption
  enableSIMD: true,
  compressionLevel: 8
});

const decoded = await codec.decode(encoded);
console.log('Encrypted:', decoded.header.encrypted);
```

### Performance Comparison

```typescript
import { OmniCodec, MediaUtils } from 'stdlib';

const codec = new OmniCodec();
const testData = MediaUtils.generateTestData('audio', 5000);

// Test SIMD vs normal processing
const simdStart = Date.now();
const simdResult = await codec.encode(testData, 'audio', { duration: 5000 }, {
  enableSIMD: true
});
const simdTime = Date.now() - simdStart;

const normalStart = Date.now();
const normalResult = await codec.encode(testData, 'audio', { duration: 5000 }, {
  enableSIMD: false
});
const normalTime = Date.now() - normalStart;

console.log(`SIMD: ${simdTime}ms, Normal: ${normalTime}ms`);
console.log(`Performance gain: ${((normalTime / simdTime - 1) * 100).toFixed(1)}%`);
```

## Technical Implementation

### Compression Algorithm

1. **DCT Transformation**: Converts data to frequency domain using 8-point DCT
2. **Quantization**: Applies quality-based quantization to reduce data size
3. **Entropy Encoding**: Uses run-length encoding to compress repeated values
4. **Packaging**: Adds header with metadata and checksums

### SIMD Acceleration

The codec uses the built-in SIMD processor to parallelize:
- DCT block processing
- Quantization operations
- Array transformations

### Security Features

- **Checksums**: SHA-256 checksums for data integrity verification
- **Encryption**: Optional encryption using existing crypto utilities
- **Format Validation**: Magic bytes and version checking

## Performance Characteristics

- **Compression Ratio**: Typically 30-80% depending on content and quality settings
- **Speed**: SIMD acceleration provides 20-50% performance improvement
- **Memory Usage**: Processes data in 8-element blocks for efficiency
- **Quality**: Configurable quality levels maintain good fidelity

## Error Handling

The codec provides comprehensive error handling:

- Invalid format detection
- Checksum verification
- Graceful degradation for unsupported features
- Detailed error messages for debugging

## See Also

- [Crypto Module](../crypto.md) - For encryption and hashing utilities
- [SIMD Operations](../../runtime/simd.md) - For parallel processing
- [Performance Guide](../performance.md) - For optimization tips