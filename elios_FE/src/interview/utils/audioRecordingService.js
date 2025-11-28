/**
 * Audio Recording Service
 * Handles microphone access, audio recording, and conversion to WAV/PCM 16kHz mono format
 */

class AudioRecordingService {
  constructor() {
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.audioLevelCallback = null;
    this.analyserNode = null;
    this.dataArray = null;
    this.animationFrameId = null;
  }

  /**
   * Request microphone access
   * @returns {Promise<MediaStream>}
   */
  async requestMicrophoneAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error(
        error.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access.'
          : 'Failed to access microphone. Please check your microphone settings.'
      );
    }
  }

  /**
   * Start recording audio
   * @param {Function} onAudioLevel - Optional callback for audio level updates (0-1)
   * @returns {Promise<void>}
   */
  async startRecording(onAudioLevel = null) {
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    try {
      // Request microphone access
      this.mediaStream = await this.requestMicrophoneAccess();
      this.audioChunks = [];
      this.isRecording = true;

      // Set up audio level monitoring if callback provided
      if (onAudioLevel) {
        this.audioLevelCallback = onAudioLevel;
        await this.setupAudioLevelMonitoring();
      }

      // Create MediaRecorder with PCM format if supported, otherwise use default
      const options = {
        mimeType: 'audio/webm;codecs=pcm', // Try PCM first
      };

      // Fallback to other formats if PCM not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.isRecording = false;
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      this.isRecording = false;
      this.cleanup();
      throw error;
    }
  }

  /**
   * Set up audio level monitoring using Web Audio API
   */
  async setupAudioLevelMonitoring() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;
      source.connect(this.analyserNode);

      this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!this.isRecording || !this.analyserNode) {
          return;
        }

        this.analyserNode.getByteFrequencyData(this.dataArray);
        const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
        const normalizedLevel = average / 255; // Normalize to 0-1

        if (this.audioLevelCallback) {
          this.audioLevelCallback(normalizedLevel);
        }

        this.animationFrameId = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio level monitoring:', error);
    }
  }

  /**
   * Stop recording and get audio data
   * @returns {Promise<Blob>}
   */
  async stopRecording() {
    if (!this.isRecording) {
      console.warn('No recording in progress');
      return null;
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        this.stopAudioLevelMonitoring();

        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
          this.cleanup();
          resolve(audioBlob);
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Stop audio level monitoring
   */
  stopAudioLevelMonitoring() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.audioLevelCallback = null;
    this.analyserNode = null;
    this.dataArray = null;
  }

  /**
   * Convert audio blob to WAV/PCM 16kHz mono format
   * @param {Blob} audioBlob - Audio blob from MediaRecorder
   * @returns {Promise<Uint8Array>} - WAV file as Uint8Array
   */
  async convertToWavPCM(audioBlob) {
    if (!audioBlob) {
      throw new Error('No audio data to convert');
    }

    try {
      // Create audio context for processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });

      // Decode audio blob
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Get audio data
      const inputSampleRate = audioBuffer.sampleRate;
      const inputChannels = audioBuffer.numberOfChannels;
      const inputLength = audioBuffer.length;

      // Calculate output length after resampling to 16kHz
      const outputLength = Math.floor((inputLength * 16000) / inputSampleRate);
      const outputData = new Float32Array(outputLength);

      // Convert to mono (mix channels if stereo) and resample to 16kHz
      if (inputChannels === 1) {
        // Mono input - just resample
        const channel0 = audioBuffer.getChannelData(0);
        const ratio = inputSampleRate / 16000;

        for (let i = 0; i < outputLength; i++) {
          const srcIndex = i * ratio;
          const srcIndexFloor = Math.floor(srcIndex);
          const srcIndexCeil = Math.min(srcIndexFloor + 1, inputLength - 1);
          const t = srcIndex - srcIndexFloor;

          outputData[i] = channel0[srcIndexFloor] * (1 - t) + channel0[srcIndexCeil] * t;
        }
      } else {
        // Stereo input - mix to mono and resample
        const channel0 = audioBuffer.getChannelData(0);
        const channel1 = audioBuffer.getChannelData(1);
        const ratio = inputSampleRate / 16000;

        for (let i = 0; i < outputLength; i++) {
          const srcIndex = i * ratio;
          const srcIndexFloor = Math.floor(srcIndex);
          const srcIndexCeil = Math.min(srcIndexFloor + 1, inputLength - 1);
          const t = srcIndex - srcIndexFloor;

          // Interpolate both channels, then mix
          const sample0 = channel0[srcIndexFloor] * (1 - t) + channel0[srcIndexCeil] * t;
          const sample1 = channel1[srcIndexFloor] * (1 - t) + channel1[srcIndexCeil] * t;
          outputData[i] = (sample0 + sample1) / 2;
        }
      }

      // Convert to 16-bit PCM
      const pcmData = new Int16Array(outputLength);
      for (let i = 0; i < outputLength; i++) {
        const s = Math.max(-1, Math.min(1, outputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Create WAV file
      const wavBuffer = this.createWavFile(pcmData, 16000, 1);
      return new Uint8Array(wavBuffer);
    } catch (error) {
      console.error('Error converting audio to WAV/PCM:', error);
      throw new Error('Failed to convert audio to required format');
    }
  }

  /**
   * Create WAV file from PCM data
   * @param {Int16Array} pcmData - 16-bit PCM audio data
   * @param {number} sampleRate - Sample rate (16000)
   * @param {number} channels - Number of channels (1 for mono)
   * @returns {ArrayBuffer} - WAV file as ArrayBuffer
   */
  createWavFile(pcmData, sampleRate, channels) {
    const length = pcmData.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true); // byte rate
    view.setUint16(32, channels * 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Write PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      view.setInt16(offset, pcmData[i], true);
      offset += 2;
    }

    return buffer;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAudioLevelMonitoring();

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch((error) => {
        console.error('Error closing AudioContext:', error);
      });
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Check if recording is in progress
   * @returns {boolean}
   */
  getIsRecording() {
    return this.isRecording;
  }
}

// Export singleton instance
const audioRecordingService = new AudioRecordingService();
export default audioRecordingService;

