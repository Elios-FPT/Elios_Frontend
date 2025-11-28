/**
 * Audio Service Utility
 * Handles base64 audio playback for interview questions
 */

class AudioService {
  constructor() {
    this.currentAudio = null;
    this.currentAudioUrl = null;
  }

  /**
   * Decode base64 string to binary data
   * @param {string} base64String - Base64 encoded audio string
   * @returns {Uint8Array} - Decoded binary data
   */
  decodeBase64(base64String) {
    try {
      // Remove data URL prefix if present (e.g., "data:audio/mpeg;base64,")
      const base64Data = base64String.includes(',')
        ? base64String.split(',')[1]
        : base64String;

      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes;
    } catch (error) {
      console.error('Error decoding base64 audio:', error);
      throw new Error('Invalid base64 audio data');
    }
  }

  /**
   * Extract MIME type from base64 data URL or return default
   * @param {string} base64String - Base64 encoded audio string (may include data URL prefix)
   * @returns {string} - MIME type (default: audio/mpeg)
   */
  getMimeType(base64String) {
    // Check if it's a data URL with MIME type
    if (base64String.includes('data:')) {
      const mimeMatch = base64String.match(/data:([^;]+)/);
      if (mimeMatch && mimeMatch[1]) {
        return mimeMatch[1];
      }
    }

    // Default to audio/mpeg if not specified
    return 'audio/mpeg';
  }

  /**
   * Stop currently playing audio if any
   */
  stopCurrentAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }

    // Clean up blob URL
    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
        this.currentAudioUrl = null;
      } catch (error) {
        console.error('Error revoking audio URL:', error);
      }
    }
  }

  /**
   * Play base64 encoded audio
   * @param {string} audioData - Base64 encoded audio string
   * @param {string} mimeType - Optional MIME type (will be detected if not provided)
   * @returns {Promise<HTMLAudioElement>} - Audio element instance
   */
  async playBase64Audio(audioData, mimeType = null) {
    // Stop any currently playing audio
    this.stopCurrentAudio();

    if (!audioData) {
      console.warn('No audio data provided');
      return null;
    }

    try {
      // Get MIME type
      const detectedMimeType = mimeType || this.getMimeType(audioData);

      // Decode base64 to binary
      const binaryData = this.decodeBase64(audioData);

      // Create blob from binary data
      const blob = new Blob([binaryData], { type: detectedMimeType });

      // Create object URL
      this.currentAudioUrl = URL.createObjectURL(blob);

      // Create and play audio element
      this.currentAudio = new Audio(this.currentAudioUrl);

      // Set up cleanup when audio finishes
      this.currentAudio.addEventListener('ended', () => {
        this.cleanup();
      });

      // Set up error handling
      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.cleanup();
      });

      // Play audio
      await this.currentAudio.play();

      return this.currentAudio;
    } catch (error) {
      console.error('Error playing base64 audio:', error);
      this.cleanup();
      return null;
    }
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    this.stopCurrentAudio();
  }
}

// Export singleton instance
const audioService = new AudioService();
export default audioService;

