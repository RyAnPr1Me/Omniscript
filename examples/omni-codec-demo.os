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
  
  Console.log('\n✅ OmniCodec demo completed successfully!');
  Console.log('\nThe OmniCodec provides:');
  Console.log('• Unique DCT-based compression algorithm');
  Console.log('• SIMD-accelerated processing for performance');
  Console.log('• Built-in encryption and integrity checking');
  Console.log('• Support for both audio and video encoding');
  Console.log('• Configurable quality and compression levels');
  Console.log('• Cross-platform compatibility');
};

// Run the demo
main().catch((error :: Error) => {
  Console.error('Demo failed:', error.message);
});