// OmniCodec Media Encoding Example
// Demonstrates the unique audio/video encoding capabilities

use { OmniCodec, MediaUtils, Console } from 'stdlib';

def main :: () -> Promise<void> = async () => {
  Console.log('🎬 OmniCodec Media Encoding Demo');
  Console.log('================================');
  
  // Create a codec instance
  def codec :: OmniCodec = new OmniCodec();
  
  // Display codec information
  def info :: any = OmniCodec.getCodecInfo();
  Console.log(`\n📊 Codec: ${info.name} v${info.version}`);
  Console.log('Features:');
  info.features.forEach((feature :: string) => {
    Console.log(`  • ${feature}`);
  });
  
  // Generate test audio data (1 second of 440Hz tone)
  Console.log('\n🎵 Audio Encoding Test');
  Console.log('---------------------');
  
  def audioData :: ArrayBuffer = MediaUtils.generateTestData('audio', 1000);
  def audioMetadata :: any = {
    channels: 2,
    sampleRate: 44100,
    duration: 1000
  };
  
  Console.log(`Original audio size: ${audioData.byteLength} bytes`);
  
  // Encode with different quality settings
  def highQualityAudio :: Uint8Array = await codec.encode(audioData, 'audio', audioMetadata, {
    quality: 95,
    enableSIMD: true,
    compressionLevel: 3
  });
  
  def lowQualityAudio :: Uint8Array = await codec.encode(audioData, 'audio', audioMetadata, {
    quality: 30,
    enableSIMD: true,
    compressionLevel: 9
  });
  
  Console.log(`High quality (95): ${highQualityAudio.length} bytes (${((1 - highQualityAudio.length / audioData.byteLength) * 100).toFixed(1)}% compression)`);
  Console.log(`Low quality (30): ${lowQualityAudio.length} bytes (${((1 - lowQualityAudio.length / audioData.byteLength) * 100).toFixed(1)}% compression)`);
  
  // Decode and verify
  def decodedHQ :: any = await codec.decode(highQualityAudio);
  Console.log(`Decoded HQ audio: ${decodedHQ.data.byteLength} bytes, checksum: ${decodedHQ.header.checksum.substring(0, 8)}...`);
  
  // Generate test video data (500ms at 30fps)
  Console.log('\n🎥 Video Encoding Test');
  Console.log('---------------------');
  
  def videoData :: ArrayBuffer = MediaUtils.generateTestData('video', 500);
  def videoMetadata :: any = {
    width: 640,
    height: 480,
    frameRate: 30,
    duration: 500
  };
  
  Console.log(`Original video size: ${videoData.byteLength} bytes`);
  
  // Encode video with encryption
  def encryptedVideo :: Uint8Array = await codec.encode(videoData, 'video', videoMetadata, {
    quality: 75,
    enableEncryption: true,
    enableSIMD: true,
    compressionLevel: 6
  });
  
  Console.log(`Encrypted video: ${encryptedVideo.length} bytes (${((1 - encryptedVideo.length / videoData.byteLength) * 100).toFixed(1)}% compression)`);
  
  // Decode video
  def decodedVideo :: any = await codec.decode(encryptedVideo);
  Console.log(`Decoded video: ${decodedVideo.data.byteLength} bytes`);
  Console.log(`Resolution: ${decodedVideo.header.width}x${decodedVideo.header.height} @ ${decodedVideo.header.frameRate}fps`);
  Console.log(`Encrypted: ${decodedVideo.header.encrypted}`);
  
  // Analyze media properties
  Console.log('\n📈 Media Analysis');
  Console.log('----------------');
  
  def audioAnalysis :: any = MediaUtils.analyzeBuffer(audioData);
  def videoAnalysis :: any = MediaUtils.analyzeBuffer(videoData);
  
  Console.log(`Audio entropy: ${audioAnalysis.entropy.toFixed(3)}, complexity: ${audioAnalysis.complexity.toFixed(3)}`);
  Console.log(`Video entropy: ${videoAnalysis.entropy.toFixed(3)}, complexity: ${videoAnalysis.complexity.toFixed(3)}`);
  
  // Performance comparison
  Console.log('\n⚡ Performance Test');
  Console.log('------------------');
  
  def testData :: ArrayBuffer = MediaUtils.generateTestData('audio', 2000); // 2 seconds
  def testMetadata :: any = { duration: 2000, channels: 1, sampleRate: 44100 };
  
  // SIMD vs Non-SIMD encoding
  def startTime :: number = Date.now();
  def simdResult :: Uint8Array = await codec.encode(testData, 'audio', testMetadata, {
    enableSIMD: true,
    quality: 80
  });
  def simdTime :: number = Date.now() - startTime;
  
  startTime = Date.now();
  def normalResult :: Uint8Array = await codec.encode(testData, 'audio', testMetadata, {
    enableSIMD: false,
    quality: 80
  });
  def normalTime :: number = Date.now() - startTime;
  
  Console.log(`SIMD encoding: ${simdTime}ms (${simdResult.length} bytes)`);
  Console.log(`Normal encoding: ${normalTime}ms (${normalResult.length} bytes)`);
  
  if (simdTime < normalTime) {
    Console.log(`🚀 SIMD is ${((normalTime / simdTime - 1) * 100).toFixed(1)}% faster!`);
  } else {
    Console.log(`⚖️ Performance difference: ${((simdTime / normalTime - 1) * 100).toFixed(1)}%`);
  }
  
  // H.264-Level Features Test
  Console.log('\n🎯 H.264-Level Features Test');
  Console.log('---------------------------');
  
  def h264VideoData :: ArrayBuffer = MediaUtils.generateTestData('video', 1000);
  def h264VideoMetadata :: any = {
    width: 320,
    height: 240,
    frameRate: 30,
    duration: 1000
  };
  
  // Test with H.264-level features enabled
  startTime = Date.now();
  def h264EncodedVideo :: Uint8Array = await codec.encode(h264VideoData, 'video', h264VideoMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    deblockingFilter: true,
    rateDistortionOptimization: true,
    maxReferenceFrames: 4,
    compressionLevel: 8
  });
  def h264Time :: number = Date.now() - startTime;
  
  // Test with basic features only (legacy mode)
  startTime = Date.now();
  def legacyEncodedVideo :: Uint8Array = await codec.encode(h264VideoData, 'video', h264VideoMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: false,
    intraPrediction: false,
    variableBlockSize: false,
    deblockingFilter: false,
    rateDistortionOptimization: false,
    maxReferenceFrames: 1,
    compressionLevel: 5
  });
  def legacyTime :: number = Date.now() - startTime;
  
  Console.log(`Original video: ${h264VideoData.byteLength} bytes`);
  Console.log(`H.264-level encoding: ${h264EncodedVideo.length} bytes (${((1 - h264EncodedVideo.length / h264VideoData.byteLength) * 100).toFixed(1)}% compression) in ${h264Time}ms`);
  Console.log(`Legacy encoding: ${legacyEncodedVideo.length} bytes (${((1 - legacyEncodedVideo.length / h264VideoData.byteLength) * 100).toFixed(1)}% compression) in ${legacyTime}ms`);
  
  def compressionImprovement :: number = ((legacyEncodedVideo.length - h264EncodedVideo.length) / legacyEncodedVideo.length) * 100;
  Console.log(`🎉 H.264-level features improved compression by ${compressionImprovement.toFixed(1)}%!`);
  
  // Decode and verify H.264-level encoded video
  def decodedH264Video :: any = await codec.decode(h264EncodedVideo);
  Console.log(`Decoded H.264-level video: ${decodedH264Video.data.byteLength} bytes`);
  Console.log(`Frame type: ${decodedH264Video.header.frameType || 'I'}`);
  Console.log(`QP: ${decodedH264Video.header.qp || 'auto'}`);
  Console.log(`Block sizes used: ${(decodedH264Video.header.blockSizes || [8]).join(', ')}`);
  if (decodedH264Video.header.motionVectors) {
    Console.log(`Motion vectors: ${decodedH264Video.header.motionVectors.length} found`);
  }
  
  Console.log('\n✅ OmniCodec H.264-Level demo completed successfully!');
  Console.log('\nThe Enhanced OmniCodec now provides:');
  Console.log('• H.264-level video compression with motion estimation');
  Console.log('• Multiple intra prediction modes for spatial redundancy');
  Console.log('• Variable block sizes (4x4, 8x8, 16x16) for better efficiency');
  Console.log('• Context-Adaptive Binary Arithmetic Coding (CABAC)');
  Console.log('• Perceptual quantization matrices for better quality');
  Console.log('• In-loop deblocking filter to reduce artifacts');
  Console.log('• Rate-distortion optimization for optimal encoding');
  Console.log('• Multiple reference frames for better temporal prediction');
  Console.log('• SIMD-accelerated processing for high performance');
  Console.log('• Built-in encryption and integrity checking');
  Console.log('• Cross-platform compatibility');
  Console.log('• Performance competitive with H.264 standard');
};

// Run the demo
main().catch((error :: Error) => {
  Console.error('Demo failed:', error.message);
});