# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [media](#media)

## media

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/media.ts`

### Classes

#### OmniCodec

**Properties**:

- `simd: SIMDProcessor` - 
- `keyManager: KeyManager` - 
- `MAGIC_BYTES: any` - 
- `VERSION: any` - 
- `MAX_CHUNK_SIZE: any` - 
- `referenceFrames: ReferenceFrame[]` - 
- `frameCount: any` - 
- `rateControlData: any` - 

**Methods**:

##### encode

Encode audio/video data using the OmniCodec format

**Signature**: `async encode(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: Partial<OmniCodecOptions> =`

##### decode

Decode OmniCodec formatted data

**Signature**: `async decode(encodedData: Uint8Array): Promise<`

##### applyDCT

Apply Discrete Cosine Transform for frequency domain compression

**Signature**: `private applyDCT(data: number[]): number[]`

##### applySIMDDCT

SIMD-accelerated DCT transformation

**Signature**: `private applySIMDDCT(data: number[]): number[]`

##### dctBlock

Fast DCT transformation for a single block (optimized)

**Signature**: `private dctBlock(block: number[]): number[]`

##### fastDCT8

Fast 8-point DCT implementation

**Signature**: `private fastDCT8(x: number[]): number[]`

##### fastDCT16

Fast 16-point DCT implementation

**Signature**: `private fastDCT16(x: number[]): number[]`

##### fastDCT2D8x8

Fast 2D 8x8 DCT implementation

**Signature**: `private fastDCT2D8x8(block: number[]): number[]`

##### applyInverseDCT

Apply inverse DCT

**Signature**: `private applyInverseDCT(data: number[]): number[]`

##### idctBlock

Inverse DCT for a single block

**Signature**: `private idctBlock(block: number[]): number[]`

##### quantize

Quantize DCT coefficients based on quality

**Signature**: `private quantize(data: number[], quality: number): number[]`

##### dequantize

Dequantize coefficients

**Signature**: `private dequantize(data: number[], quality: number): number[]`

##### entropyEncode

Simple entropy encoding using run-length encoding

**Signature**: `private entropyEncode(data: number[]): Uint8Array`

##### entropyDecode

Decode entropy-encoded data

**Signature**: `private entropyDecode(data: Uint8Array): number[]`

##### bufferToFloatArray

Convert ArrayBuffer to float array for processing

**Signature**: `private bufferToFloatArray(buffer: ArrayBuffer): number[]`

##### floatArrayToBuffer

Convert float array back to ArrayBuffer

**Signature**: `private floatArrayToBuffer(data: number[]): ArrayBuffer`

##### packageData

Package data with header

**Signature**: `private packageData(header: MediaHeader, data: Uint8Array): Uint8Array`

##### unpackageData

Unpackage data and extract header

**Signature**: `private unpackageData(data: Uint8Array):`

##### arrayEquals

Compare two Uint8Arrays for equality

**Signature**: `private arrayEquals(a: Uint8Array, b: Uint8Array): boolean`

##### encryptData

Encrypt data using secure key management

**Signature**: `private async encryptData(data: Uint8Array, password?: string): Promise<`

##### decryptData

Decrypt data using stored key information

**Signature**: `private async decryptData(encryptedData: Uint8Array, encryptionInfo:`

##### encodeStreaming

Encode large files using streaming approach

**Signature**: `private async encodeStreaming(
    data: ArrayBuffer,
    type: 'audio' | 'video',
    metadata: Partial<MediaHeader>,
    options: OmniCodecOptions,
    measurement: PerformanceMeasurement
  ): Promise<Uint8Array>`

##### getPerformanceStats

Get performance statistics

**Signature**: `getPerformanceStats()`

##### getKeyStats

Get key manager statistics

**Signature**: `getKeyStats()`

##### clearPerformanceMetrics

Clear performance metrics

**Signature**: `clearPerformanceMetrics(): void`

##### clearEncryptionKeys

Clear all encryption keys (for security)

**Signature**: `clearEncryptionKeys(): void`

##### hexToBytes

Helper method to convert hex string to bytes

**Signature**: `private hexToBytes(hex: string): Uint8Array`

##### base64ToBytes

Helper method to convert base64 to bytes

**Signature**: `private base64ToBytes(base64: string): Uint8Array`

##### bytesToBase64

Helper method to convert bytes to base64

**Signature**: `private bytesToBase64(bytes: Uint8Array): string`

##### bufferToVideoFrame

Convert buffer to video frame representation

**Signature**: `private bufferToVideoFrame(buffer: ArrayBuffer, width: number, height: number): VideoFrame`

##### encodeVideoFrame

Main video frame encoding with H.264-level features (optimized)

**Signature**: `private async encodeVideoFrame(frame: VideoFrame, opts: OmniCodecOptions): Promise<`

##### splitIntoBlocks

Split frame into blocks of specified size

**Signature**: `private splitIntoBlocks(frame: VideoFrame, blockSize: number): Block[]`

##### motionEstimation

Fast motion estimation using diamond search pattern (optimized for performance)

**Signature**: `private motionEstimation(currentBlock: Block, refFrame: ReferenceFrame, searchRange: number): MotionVector | null`

##### calculateSAD

Calculate Sum of Absolute Differences (SAD)

**Signature**: `private calculateSAD(block: Block, refData: number[][], refX: number, refY: number): number`

##### fastIntraPredictionMode

Fast intra prediction mode selection (optimized)

**Signature**: `private fastIntraPredictionMode(block: Block, frameData: number[][]): number`

##### fastPredictionCost

Fast prediction cost calculation (optimized)

**Signature**: `private fastPredictionCost(original: number[][], predicted: number[][]): number`

##### calculateIntraCost

Calculate intra prediction cost

**Signature**: `private calculateIntraCost(block: Block, frameData: number[][]): number`

##### calculateMotionCost

Calculate motion compensation cost

**Signature**: `private calculateMotionCost(block: Block, refFrame: ReferenceFrame, mv: MotionVector): number`

##### encodeBlockOptimized

Optimized block encoding

**Signature**: `private encodeBlockOptimized(block: Block, opts: OmniCodecOptions): number[]`

##### applyFastDeblockingFilter

Fast deblocking filter (simplified for performance)

**Signature**: `private applyFastDeblockingFilter(blocks: number[][]): void`

##### predictIntraBlock

Predict intra block based on mode

**Signature**: `private predictIntraBlock(block: Block, frameData: number[][], mode: number): number[][]`

##### getNeighboringPixels

Get neighboring pixels for intra prediction

**Signature**: `private getNeighboringPixels(block: Block, frameData: number[][])`

##### calculateDirectionalPrediction

Calculate directional prediction for complex modes

**Signature**: `private calculateDirectionalPrediction(x: number, y: number, mode: number, neighbors: any): number`

##### calculatePredictionCost

Calculate prediction cost (used for rate-distortion optimization)

**Signature**: `private calculatePredictionCost(original: number[][], predicted: number[][]): number`

##### applyIntraPrediction

Apply intra prediction to block

**Signature**: `private applyIntraPrediction(block: Block, frameData: number[][], mode: number): void`

##### encodeBlock

Encode individual block with DCT and quantization

**Signature**: `private encodeBlock(block: Block, opts: OmniCodecOptions): number[]`

##### applyBlockDCT

Apply DCT to a specific block size

**Signature**: `private applyBlockDCT(data: number[], blockSize: number): number[]`

##### apply4x4DCT

4x4 DCT (simplified)

**Signature**: `private apply4x4DCT(data: number[]): number[]`

##### apply16x16DCT

16x16 DCT (simplified)

**Signature**: `private apply16x16DCT(data: number[]): number[]`

##### perceptualQuantize

Perceptual quantization using quantization matrices

**Signature**: `private perceptualQuantize(data: number[], quality: number, type: 'audio' | 'video', blockSize: number = 8): number[]`

##### scaleQuantMatrix

Scale quantization matrix for different block sizes

**Signature**: `private scaleQuantMatrix(matrix: number[][], targetSize: number): number[][]`

##### qualityToQP

Convert quality (1-100) to quantization parameter (0-51)

**Signature**: `private qualityToQP(quality: number): number`

##### improvedEntropyEncode

Improved entropy encoding (more efficient than CABAC for this use case)

**Signature**: `private improvedEntropyEncode(data: number[]): Uint8Array`

##### zeroRunEncode

Zero-run encoding for quantized DCT coefficients

**Signature**: `private zeroRunEncode(data: number[]): number[]`

##### encodeVariableInt

Variable length integer encoding

**Signature**: `private encodeVariableInt(output: number[], value: number): void`

##### cabacEncode

Context-Adaptive Binary Arithmetic Coding (simplified implementation)

**Signature**: `private cabacEncode(data: number[]): Uint8Array`

##### getCabacContext

Get CABAC context for adaptive encoding

**Signature**: `private getCabacContext(data: number[], index: number): string`

##### valueToBinary

Convert value to binary representation

**Signature**: `private valueToBinary(value: number): number[]`

##### updateProbability

Update probability for adaptive arithmetic coding

**Signature**: `private updateProbability(oldProb: number, outcome: boolean): number`

##### improvedEntropyDecode

Decode data using improved entropy decoding

**Signature**: `private improvedEntropyDecode(data: Uint8Array): number[]`

##### decodeVariableInt

Decode variable length integer

**Signature**: `private decodeVariableInt(data: Uint8Array, offset: number):`

##### zeroRunDecode

Zero-run decoding

**Signature**: `private zeroRunDecode(data: number[]): number[]`

##### decodeAdvanced

Advanced decoding for version 2.0 with H.264-level features

**Signature**: `private decodeAdvanced(quantizedData: number[], header: MediaHeader): number[]`

##### qpToQuality

Convert QP back to quality

**Signature**: `private qpToQuality(qp: number): number`

##### perceptualDequantize

Perceptual dequantization (reverse of perceptual quantization)

**Signature**: `private perceptualDequantize(data: number[], quality: number, type: 'audio' | 'video', blockSize: number = 8): number[]`

##### applyDeblockingFilter

Apply deblocking filter to reduce blocking artifacts

**Signature**: `private applyDeblockingFilter(blocks: number[][], frameWidth: number, frameHeight: number): void`

##### applyHorizontalDeblocking

Apply horizontal deblocking between two adjacent blocks

**Signature**: `private applyHorizontalDeblocking(blocks: number[][], leftBlockIndex: number, rightBlockIndex: number): void`

##### applyVerticalDeblocking

Apply vertical deblocking between two vertically adjacent blocks

**Signature**: `private applyVerticalDeblocking(blocks: number[][], topBlockIndex: number, bottomBlockIndex: number): void`

##### flattenBlocks

Flatten encoded blocks back to 1D array

**Signature**: `private flattenBlocks(blocks: number[][]): number[]`

##### updateReferenceFrames

Update reference frames for inter prediction

**Signature**: `private updateReferenceFrames(currentFrame: VideoFrame, maxRefFrames: number): void`

##### frameToBlocks

Convert frame to blocks for processing

**Signature**: `private frameToBlocks(frame: VideoFrame, options: OmniCodecOptions): Block[]`

##### diamondSearch

Diamond search algorithm for motion estimation

**Signature**: `private diamondSearch(block: Block, refFrame: ReferenceFrame, searchRange: number): MotionVector`

##### calculateSADForBlock

Calculate SAD (Sum of Absolute Differences) for a block

**Signature**: `private calculateSADForBlock(block: Block, refFrame: ReferenceFrame, dx: number, dy: number): number`

##### encodeVideoAdvanced

Enhanced video encoding with B-frame support and sub-pixel motion estimation

**Signature**: `private async encodeVideoAdvanced(
    data: ArrayBuffer, 
    metadata: any, 
    options: OmniCodecOptions
  ): Promise<`

##### determineFrameType

Determine frame type based on GOP pattern

**Signature**: `private determineFrameType(options: OmniCodecOptions): 'I' | 'P' | 'B'`

##### getCurrentGOPPattern

Get current GOP pattern string for debugging/metadata

**Signature**: `private getCurrentGOPPattern(): string`

##### encodeIFrame

Encode I-frame (intra-only prediction)

**Signature**: `private encodeIFrame(
    frame: VideoFrame, 
    options: OmniCodecOptions,
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### encodePFrame

Encode P-frame (forward prediction only)

**Signature**: `private encodePFrame(
    frame: VideoFrame,
    options: OmniCodecOptions,
    motionVectors: MotionVector[],
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### encodeBFrame

Encode B-frame (bidirectional prediction)

**Signature**: `private encodeBFrame(
    frame: VideoFrame,
    options: OmniCodecOptions,
    motionVectors: MotionVector[],
    blockSizes: number[],
    intraModes: number[],
    qp: number
  ): number[]`

##### subPixelMotionEstimation

Sub-pixel motion estimation with quarter-pixel accuracy

**Signature**: `private subPixelMotionEstimation(
    block: Block, 
    refFrame: ReferenceFrame, 
    options: OmniCodecOptions
  ): MotionVector`

##### halfPixelRefinement

Half-pixel refinement for motion estimation

**Signature**: `private halfPixelRefinement(block: Block, refFrame: ReferenceFrame, intMV: MotionVector): MotionVector`

##### quarterPixelRefinement

Quarter-pixel refinement for motion estimation

**Signature**: `private quarterPixelRefinement(block: Block, refFrame: ReferenceFrame, halfMV: MotionVector): MotionVector`

##### calculateSubPixelCost

Calculate cost for sub-pixel motion vectors

**Signature**: `private calculateSubPixelCost(
    block: Block, 
    refFrame: ReferenceFrame, 
    mv: MotionVector,
    precision: 'half' | 'quarter'
  ): number`

##### interpolateSubPixel

Interpolate sub-pixel values using bilinear interpolation

**Signature**: `private interpolateSubPixel(
    refFrame: ReferenceFrame, 
    x: number, 
    y: number, 
    blockSize: number,
    precision: 'full' | 'half' | 'quarter'
  ): number[][]`

##### getPixel

Safely get pixel value with bounds checking

**Signature**: `private getPixel(refFrame: ReferenceFrame, x: number, y: number): number`

##### calculateBidirectionalCost

Calculate bidirectional prediction cost

**Signature**: `private calculateBidirectionalCost(
    block: Block,
    pastRef: ReferenceFrame,
    futureRef: ReferenceFrame,
    forwardMV: MotionVector,
    backwardMV: MotionVector
  ): number`

##### applyMotionCompensation

Apply motion compensation for P-frames

**Signature**: `private applyMotionCompensation(block: Block, refFrame: ReferenceFrame): void`

##### applyBidirectionalCompensation

Apply bidirectional motion compensation for B-frames

**Signature**: `private applyBidirectionalCompensation(
    block: Block,
    pastRef: ReferenceFrame,
    futureRef: ReferenceFrame,
    forwardMV: MotionVector,
    backwardMV: MotionVector
  ): void`

##### initializeRateControl

Initialize rate control system

**Signature**: `private initializeRateControl(options: OmniCodecOptions, metadata: any): void`

##### calculateRateControlQP

Calculate optimal QP for rate control

**Signature**: `private calculateRateControlQP(options: OmniCodecOptions, frameType: 'I' | 'P' | 'B', estimatedComplexity: number): number`

##### updateRateControl

Update rate control after encoding a frame

**Signature**: `private updateRateControl(actualBits: number, frameType: 'I' | 'P' | 'B'): void`

##### estimateFrameComplexity

Estimate frame complexity for rate control

**Signature**: `private estimateFrameComplexity(frame: VideoFrame): number`

##### getRateControlStats

Get current rate control statistics

**Signature**: `private getRateControlStats():`

##### applyAdaptiveQuantization

Adaptive quantization - adjust QP per macroblock based on local complexity

**Signature**: `private applyAdaptiveQuantization(blocks: Block[], baseQP: number): void`

##### calculateBlockComplexity

Calculate complexity of a single block

**Signature**: `private calculateBlockComplexity(block: Block): number`

##### getCodecInfo

Get codec information

**Signature**: `static getCodecInfo():`

#### MediaUtils

Media utility functions

**Methods**:

##### analyzeBuffer

Analyze media file properties

**Signature**: `static analyzeBuffer(buffer: ArrayBuffer):`

##### generateTestData

Generate test media data

**Signature**: `static generateTestData(type: 'audio' | 'video', duration: number = 1000): ArrayBuffer`

### Interfaces

#### MediaHeader

OmniCodec - A unique audio/video encoding format for Omniscript
Features:
- DCT-based frequency domain compression
- Custom quantization matrices for quality control
- Adaptive entropy encoding
- Built-in encryption and checksums
- SIMD-accelerated processing
- Support for both audio and video streams

**Properties**:

- `version: string` - 
- `codec: string` - 
- `width: number` - 
- `height: number` - 
- `channels: number` - 
- `sampleRate: number` - 
- `frameRate: number` - 
- `duration: number` - 
- `checksum: string` - 
- `encrypted: boolean` - 
- `encryptionInfo: {
    keyId: string;
    algorithm: string;
  }` - 
- `frameType: 'I' | 'P' | 'B'` - 
- `qp: number` - 
- `blockSizes: number[]` - 
- `intraModes: number[]` - 
- `motionVectors: MotionVector[]` - 
- `poc: number` - 
- `gopStructure: string` - 
- `targetBitrate: number` - 
- `actualBitrate: number` - 

#### MotionVector

**Properties**:

- `x: number` - 
- `y: number` - 
- `refFrame: number` - 
- `blockIndex: number` - 
- `precision: 'full' | 'half' | 'quarter'` - 

#### EncodedFrame

**Properties**:

- `type: 'audio' | 'video'` - 
- `timestamp: number` - 
- `data: Uint8Array` - 
- `size: number` - 

#### VideoFrame

**Properties**:

- `width: number` - 
- `height: number` - 
- `data: number[][]` - 
- `frameType: 'I' | 'P' | 'B'` - 
- `timestamp: number` - 
- `poc: number` - 

#### Block

**Properties**:

- `x: number` - 
- `y: number` - 
- `size: number` - 
- `data: number[][]` - 
- `predictionMode: number` - 
- `motionVector: MotionVector` - 

#### ReferenceFrame

**Properties**:

- `data: number[][]` - 
- `timestamp: number` - 
- `frameIndex: number` - 

#### OmniCodecOptions

**Properties**:

- `quality: number` - 
- `enableEncryption: boolean` - 
- `enableSIMD: boolean` - 
- `compressionLevel: number` - 
- `password: string` - 
- `streamingMode: boolean` - 
- `maxMemoryUsage: number` - 
- `motionEstimation: boolean` - 
- `intraPrediction: boolean` - 
- `variableBlockSize: boolean` - 
- `deblockingFilter: boolean` - 
- `rateDistortionOptimization: boolean` - 
- `maxReferenceFrames: number` - 
- `searchRange: number` - 
- `enableBFrames: boolean` - 
- `subPixelMotionEstimation: boolean` - 
- `gopSize: number` - 
- `adaptiveQuantization: boolean` - 
- `targetBitrate: number` - 
- `maxBitrate: number` - 
- `twoPassEncoding: boolean` - 
- `constantQuality: boolean` - 


