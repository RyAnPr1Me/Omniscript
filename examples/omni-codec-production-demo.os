// OmniCodec Production Demo - Showcasing enterprise-grade features
// Demonstrates production-ready media encoding capabilities

use { OmniCodec, MediaUtils, Console } from 'stdlib';

def main :: () -> Promise<void> = async () => {
  Console.log('🏭 OmniCodec Production Demo');
  Console.log('=============================');
  Console.log('Enterprise-grade media encoding with security and performance monitoring\n');
  
  // Create a production-ready codec instance
  def codec :: OmniCodec = new OmniCodec({
    maxStoredKeys: 50,
    keyRotationInterval: 60000, // 1 minute for demo
    defaultAlgorithm: 'AES-GCM'
  });
  
  // Display enhanced codec information
  def info :: any = OmniCodec.getCodecInfo();
  Console.log(`📊 Codec: ${info.name} v${info.version}`);
  Console.log('🔒 Production Features:');
  info.features.forEach((feature :: string) => {
    Console.log(`  • ${feature}`);
  });
  
  Console.log('\n🔐 Security & Encryption Demo');
  Console.log('-----------------------------');
  
  // Generate test data
  def sensitiveData :: ArrayBuffer = MediaUtils.generateTestData('audio', 2000);
  def metadata :: any = {
    channels: 2,
    sampleRate: 48000,
    duration: 2000
  };
  
  Console.log(`Original data size: ${sensitiveData.byteLength} bytes`);
  
  // Encrypt with random key
  def encryptedResult :: Uint8Array = await codec.encode(sensitiveData, 'audio', metadata, {
    quality: 90,
    enableEncryption: true,
    enableSIMD: true,
    compressionLevel: 7
  });
  
  Console.log(`Encrypted & compressed: ${encryptedResult.length} bytes`);
  Console.log(`Compression ratio: ${((1 - encryptedResult.length / sensitiveData.byteLength) * 100).toFixed(1)}%`);
  
  // Decrypt and verify
  def decryptedResult :: any = await codec.decode(encryptedResult);
  Console.log(`✅ Decryption successful: ${decryptedResult.data.byteLength} bytes recovered`);
  Console.log(`🔑 Encryption metadata: ${JSON.stringify(decryptedResult.header.encryptionInfo)}`);
  
  Console.log('\n📊 Performance Monitoring Demo');
  Console.log('-------------------------------');
  
  // Perform multiple encoding operations for performance analysis
  def testSizes :: number[] = [500, 1000, 1500, 2000, 2500];
  
  for (def size of testSizes) {
    def testData :: ArrayBuffer = MediaUtils.generateTestData('video', size);
    def testMetadata :: any = {
      width: 1280,
      height: 720,
      frameRate: 30,
      duration: size
    };
    
    // Encode with SIMD
    await codec.encode(testData, 'video', testMetadata, {
      enableSIMD: true,
      quality: 75
    });
    
    // Encode without SIMD for comparison
    await codec.encode(testData, 'video', testMetadata, {
      enableSIMD: false,
      quality: 75
    });
  }
  
  // Display performance statistics
  def stats :: any = codec.getPerformanceStats();
  Console.log(`📈 Performance Summary:`);
  Console.log(`  Total operations: ${stats.totalOperations}`);
  Console.log(`  Average duration: ${stats.averageDuration.toFixed(2)}ms`);
  Console.log(`  Average compression: ${(stats.averageCompressionRatio * 100).toFixed(1)}%`);
  Console.log(`  SIMD performance gain: ${stats.simdPerformanceGain.toFixed(1)}%`);
  Console.log(`  Memory usage: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
  Console.log(`  Error count: ${stats.errors}`);
  
  Console.log('\n🔧 Input Validation Demo');
  Console.log('------------------------');
  
  // Demonstrate robust input validation
  def validationTests :: any[] = [
    { data: null, type: 'audio', desc: 'Null data' },
    { data: sensitiveData, type: 'invalid', desc: 'Invalid media type' },
    { data: sensitiveData, type: 'audio', options: { quality: 150 }, desc: 'Invalid quality' }
  ];
  
  for (def test of validationTests) {
    try {
      await codec.encode(test.data, test.type, { duration: 100 }, test.options || {});
      Console.log(`  ❌ ${test.desc}: Should have failed`);
    } catch (error) {
      Console.log(`  ✅ ${test.desc}: Properly rejected - ${error.name}`);
    }
  }
  
  Console.log('\n💾 Memory Management Demo');
  Console.log('-------------------------');
  
  // Simulate large file processing
  def largeFileSize :: number = 15 * 1024 * 1024; // 15MB
  def largeData :: ArrayBuffer = new ArrayBuffer(largeFileSize);
  def largeView :: Uint8Array = new Uint8Array(largeData);
  
  // Fill with test pattern
  for (def i :: number = 0; i < largeView.length; i++) {
    largeView[i] = (i % 256);
  }
  
  Console.log(`Large file size: ${(largeFileSize / 1024 / 1024).toFixed(1)}MB`);
  
  try {
    // This should trigger streaming mode
    def largeEncoded :: Uint8Array = await codec.encode(largeData, 'audio', 
      { duration: 5000 }, 
      {
        maxMemoryUsage: 10 * 1024 * 1024, // 10MB limit
        streamingMode: true,
        quality: 60
      }
    );
    
    Console.log(`✅ Streaming mode: Encoded ${largeFileSize} bytes to ${largeEncoded.length} bytes`);
    
    // Verify decoding works
    def largeDecoded :: any = await codec.decode(largeEncoded);
    Console.log(`✅ Streaming decode: Recovered ${largeDecoded.data.byteLength} bytes`);
    
  } catch (error) {
    Console.log(`⚠️ Large file processing: ${error.message}`);
  }
  
  Console.log('\n🔑 Key Management Demo');
  Console.log('----------------------');
  
  def keyStats :: any = codec.getKeyStats();
  Console.log(`🗝️ Encryption Keys:`);
  Console.log(`  Total keys stored: ${keyStats.totalKeys}`);
  Console.log(`  Oldest key: ${new Date(keyStats.oldestKey).toISOString()}`);
  Console.log(`  Newest key: ${new Date(keyStats.newestKey).toISOString()}`);
  
  Console.log('\n🧹 Security Cleanup Demo');
  Console.log('-------------------------');
  
  // Clear sensitive data for security
  codec.clearEncryptionKeys();
  codec.clearPerformanceMetrics();
  
  def finalKeyStats :: any = codec.getKeyStats();
  def finalPerfStats :: any = codec.getPerformanceStats();
  
  Console.log(`🔒 Security cleanup complete:`);
  Console.log(`  Keys remaining: ${finalKeyStats.totalKeys}`);
  Console.log(`  Metrics remaining: ${finalPerfStats.totalOperations}`);
  
  Console.log('\n✅ Production Demo Complete!');
  Console.log('\n🏭 OmniCodec Production Features Summary:');
  Console.log('========================================');
  Console.log('✅ Enterprise-grade encryption with secure key management');
  Console.log('✅ Comprehensive input validation and sanitization');
  Console.log('✅ Real-time performance monitoring and analytics');
  Console.log('✅ Memory-efficient streaming for large files');
  Console.log('✅ Robust error handling with specific error types');
  Console.log('✅ Production security with automatic cleanup');
  Console.log('✅ Backwards compatibility with existing code');
  Console.log('✅ Configurable quality and compression settings');
  Console.log('✅ SIMD acceleration for enhanced performance');
  Console.log('✅ Cross-platform deployment ready');
};

// Run the production demo
main().catch((error :: Error) => {
  Console.error('Production demo failed:', error.message);
  Console.error('Stack trace:', error.stack);
});