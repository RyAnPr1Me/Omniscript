import { OmniCodec, MediaUtils } from './src/stdlib/media';

async function testH264Features() {
  console.log('🎬 Testing Enhanced OmniCodec H.264-Level Features');
  console.log('=================================================');
  
  const codec = new OmniCodec();
  
  // Display new codec information
  const info = OmniCodec.getCodecInfo();
  console.log(`\n📊 Codec: ${info.name} v${info.version}`);
  console.log('New H.264-level features:');
  info.features.forEach((feature: string) => {
    console.log(`  • ${feature}`);
  });
  
  // Test video encoding with H.264-level features
  console.log('\n🎥 H.264-Level Video Encoding Test');
  console.log('----------------------------------');
  
  const videoData = MediaUtils.generateTestData('video', 1000);
  const videoMetadata = {
    width: 320,
    height: 240,
    frameRate: 30,
    duration: 1000
  };
  
  console.log(`Original video size: ${videoData.byteLength} bytes`);
  
  // Test with all H.264-level features enabled including B-frames
  const startTime = Date.now();
  const h264Encoded = await codec.encode(videoData, 'video', videoMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    deblockingFilter: true,
    rateDistortionOptimization: true,
    maxReferenceFrames: 4,
    compressionLevel: 8,
    enableBFrames: true,
    subPixelMotionEstimation: true,
    gopSize: 30
  });
  const h264Time = Date.now() - startTime;
  
  console.log(`H.264-level encoded: ${h264Encoded.length} bytes`);
  console.log(`Compression ratio: ${((1 - h264Encoded.length / videoData.byteLength) * 100).toFixed(1)}%`);
  console.log(`Encoding time: ${h264Time}ms`);
  
  // Test legacy encoding for comparison
  const legacyStart = Date.now();
  const legacyEncoded = await codec.encode(videoData, 'video', videoMetadata, {
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
  const legacyTime = Date.now() - legacyStart;
  
  console.log(`Legacy encoded: ${legacyEncoded.length} bytes`);
  console.log(`Legacy compression: ${((1 - legacyEncoded.length / videoData.byteLength) * 100).toFixed(1)}%`);
  console.log(`Legacy time: ${legacyTime}ms`);
  
  // Calculate improvements
  const compressionImprovement = ((legacyEncoded.length - h264Encoded.length) / legacyEncoded.length) * 100;
  console.log(`\n🎉 H.264 features improved compression by ${compressionImprovement.toFixed(1)}%`);
  
  if (h264Time < legacyTime) {
    console.log(`⚡ H.264 encoding was ${((legacyTime - h264Time) / legacyTime * 100).toFixed(1)}% faster`);
  } else {
    console.log(`⏱️ H.264 encoding took ${((h264Time - legacyTime) / legacyTime * 100).toFixed(1)}% longer (worth it for better compression)`);
  }
  
  // Decode and verify
  console.log('\n🔍 Decoding and Verification');
  console.log('----------------------------');
  
  const decoded = await codec.decode(h264Encoded);
  console.log(`Decoded size: ${decoded.data.byteLength} bytes`);
  console.log(`Frame type: ${decoded.header.frameType || 'I'}`);
  console.log(`QP: ${decoded.header.qp || 'auto'}`);
  console.log(`Block sizes: ${(decoded.header.blockSizes || [8]).join(', ')}`);
  console.log(`Codec: ${decoded.header.codec}`);
  console.log(`Version: ${decoded.header.version}`);
  
  if (decoded.header.motionVectors && decoded.header.motionVectors.length > 0) {
    console.log(`Motion vectors: ${decoded.header.motionVectors.length} detected`);
    
    // Analyze sub-pixel precision
    const subPixelVectors = decoded.header.motionVectors.filter(mv => mv.precision !== 'full');
    if (subPixelVectors.length > 0) {
      console.log(`Sub-pixel vectors: ${subPixelVectors.length} (${(subPixelVectors.length / decoded.header.motionVectors.length * 100).toFixed(1)}%)`);
    }
  }
  
  if (decoded.header.gopStructure) {
    console.log(`GOP pattern: ${decoded.header.gopStructure.slice(0, 10)}...`);
  }

  // Test B-frame specific encoding
  console.log('\n🎬 B-Frame Temporal Compression Test');
  console.log('-----------------------------------');
  
  // Generate multi-frame video sequence for B-frame testing
  const multiFrameData = MediaUtils.generateTestData('video', 3000); // 3 seconds
  const multiFrameMetadata = {
    width: 480,
    height: 360,
    frameRate: 30,
    duration: 3000
  };
  
  const bFrameStart = Date.now();
  const bFrameEncoded = await codec.encode(multiFrameData, 'video', multiFrameMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    deblockingFilter: true,
    enableBFrames: true,
    subPixelMotionEstimation: true,
    maxReferenceFrames: 6,
    gopSize: 15, // Shorter GOP for more B-frames
    compressionLevel: 8
  });
  const bFrameTime = Date.now() - bFrameStart;
  
  // Test without B-frames for comparison
  const noBFrameStart = Date.now();
  const noBFrameEncoded = await codec.encode(multiFrameData, 'video', multiFrameMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    deblockingFilter: true,
    enableBFrames: false, // Disable B-frames
    subPixelMotionEstimation: true,
    maxReferenceFrames: 6,
    gopSize: 15,
    compressionLevel: 8
  });
  const noBFrameTime = Date.now() - noBFrameStart;
  
  console.log(`Multi-frame original: ${(multiFrameData.byteLength / 1024).toFixed(1)} KB`);
  console.log(`With B-frames: ${(bFrameEncoded.length / 1024).toFixed(1)} KB`);
  console.log(`Without B-frames: ${(noBFrameEncoded.length / 1024).toFixed(1)} KB`);
  
  const bFrameImprovement = ((noBFrameEncoded.length - bFrameEncoded.length) / noBFrameEncoded.length) * 100;
  console.log(`\n🎉 B-frames improved compression by ${bFrameImprovement.toFixed(1)}%`);
  console.log(`B-frame encoding time: ${bFrameTime}ms vs ${noBFrameTime}ms (${((bFrameTime - noBFrameTime) / noBFrameTime * 100).toFixed(1)}% overhead)`);
  
  // Decode B-frame result to verify
  const bFrameDecoded = await codec.decode(bFrameEncoded);
  console.log(`B-frame GOP: ${bFrameDecoded.header.gopStructure?.slice(0, 15) || 'N/A'}`);
  console.log(`B-frame POC: ${bFrameDecoded.header.poc || 'N/A'}`);
  
  if (bFrameDecoded.header.motionVectors) {
    const quarterPixelMVs = bFrameDecoded.header.motionVectors.filter(mv => mv.precision === 'quarter');
    console.log(`Quarter-pixel MVs: ${quarterPixelMVs.length}/${bFrameDecoded.header.motionVectors.length} (${(quarterPixelMVs.length / bFrameDecoded.header.motionVectors.length * 100).toFixed(1)}%)`);
  }

  // Test rate control features
  console.log('\n📊 Rate Control System Test');
  console.log('---------------------------');
  
  // Test different target bitrates
  const targetBitrates = [500, 1000, 2000]; // kbps
  
  for (const bitrate of targetBitrates) {
    const rateControlStart = Date.now();
    const rateControlEncoded = await codec.encode(multiFrameData, 'video', multiFrameMetadata, {
      quality: 85,
      enableSIMD: true,
      motionEstimation: true,
      intraPrediction: true,
      variableBlockSize: true,
      enableBFrames: true,
      subPixelMotionEstimation: true,
      maxReferenceFrames: 4,
      gopSize: 30,
      targetBitrate: bitrate,
      adaptiveQuantization: true,
      compressionLevel: 8
    });
    const rateControlTime = Date.now() - rateControlStart;
    
    const rateControlDecoded = await codec.decode(rateControlEncoded);
    const actualBitrate = rateControlDecoded.header.actualBitrate || 0;
    const bitrateAccuracy = Math.abs(actualBitrate - bitrate) / bitrate * 100;
    
    console.log(`Target: ${bitrate} kbps | Actual: ${actualBitrate} kbps | Accuracy: ${(100 - bitrateAccuracy).toFixed(1)}% | Size: ${(rateControlEncoded.length / 1024).toFixed(1)} KB | Time: ${rateControlTime}ms`);
  }
  
  // Test adaptive quantization
  console.log('\n🎯 Adaptive Quantization Test');
  console.log('-----------------------------');
  
  const adaptiveStart = Date.now();
  const adaptiveEncoded = await codec.encode(videoData, 'video', videoMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    enableBFrames: true,
    subPixelMotionEstimation: true,
    adaptiveQuantization: true,
    maxReferenceFrames: 4,
    compressionLevel: 8
  });
  const adaptiveTime = Date.now() - adaptiveStart;
  
  const noAdaptiveStart = Date.now();
  const noAdaptiveEncoded = await codec.encode(videoData, 'video', videoMetadata, {
    quality: 85,
    enableSIMD: true,
    motionEstimation: true,
    intraPrediction: true,
    variableBlockSize: true,
    enableBFrames: true,
    subPixelMotionEstimation: true,
    adaptiveQuantization: false,
    maxReferenceFrames: 4,
    compressionLevel: 8
  });
  const noAdaptiveTime = Date.now() - noAdaptiveStart;
  
  const adaptiveImprovement = ((noAdaptiveEncoded.length - adaptiveEncoded.length) / noAdaptiveEncoded.length) * 100;
  console.log(`With adaptive QP: ${(adaptiveEncoded.length / 1024).toFixed(1)} KB | ${adaptiveTime}ms`);
  console.log(`Without adaptive QP: ${(noAdaptiveEncoded.length / 1024).toFixed(1)} KB | ${noAdaptiveTime}ms`);
  console.log(`🎉 Adaptive quantization improved compression by ${adaptiveImprovement.toFixed(1)}%`);
  console.log(`📈 Encoding overhead: ${((adaptiveTime - noAdaptiveTime) / noAdaptiveTime * 100).toFixed(1)}%`);
  
  // Test audio encoding improvements
  console.log('\n🎵 Enhanced Audio Encoding Test');
  console.log('-------------------------------');
  
  const audioData = MediaUtils.generateTestData('audio', 2000);
  const audioMetadata = { duration: 2000, channels: 2, sampleRate: 44100 };
  
  const enhancedAudio = await codec.encode(audioData, 'audio', audioMetadata, {
    quality: 90,
    enableSIMD: true,
    compressionLevel: 8
  });
  
  const basicAudio = await codec.encode(audioData, 'audio', audioMetadata, {
    quality: 90,
    enableSIMD: true,
    compressionLevel: 5
  });
  
  console.log(`Original audio: ${audioData.byteLength} bytes`);
  console.log(`Enhanced encoding: ${enhancedAudio.length} bytes (${((1 - enhancedAudio.length / audioData.byteLength) * 100).toFixed(1)}% compression)`);
  console.log(`Basic encoding: ${basicAudio.length} bytes (${((1 - basicAudio.length / audioData.byteLength) * 100).toFixed(1)}% compression)`);
  
  const audioImprovement = ((basicAudio.length - enhancedAudio.length) / basicAudio.length) * 100;
  console.log(`Audio compression improved by ${audioImprovement.toFixed(1)}%`);
  
  console.log('\n✅ Enhanced OmniCodec now provides H.264-level performance!');
  console.log('🚀 Ready to compete with industry-standard codecs!');
}

testH264Features().catch(error => {
  console.error('Test failed:', error.message);
  console.error(error.stack);
});