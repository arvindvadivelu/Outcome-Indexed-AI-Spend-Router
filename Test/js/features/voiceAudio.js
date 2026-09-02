/**
 * AURA Voice & Speech Audio Suite
 * Handles Web Speech API voice recognition input and TTS synthesis readout.
 */

export class VoiceAudioManager {
  constructor(options = {}) {
    this.onSpeechResult = options.onSpeechResult;
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.showVoiceModal(true);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onSpeechResult) {
          this.onSpeechResult(transcript);
        }
        this.stopListening();
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.stopListening();
      };
    }
  }

  startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        this.simulateVoiceInput();
      }
    } else {
      this.simulateVoiceInput();
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.showVoiceModal(false);
  }

  simulateVoiceInput() {
    this.showVoiceModal(true);
    setTimeout(() => {
      const sampleQueries = [
        "How do quantum computers differ from classical computers?",
        "NVDA stock price and earnings analysis",
        "Implement LRU Cache in Python with O(1) operations"
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      if (this.onSpeechResult) {
        this.onSpeechResult(randomQuery);
      }
      this.showVoiceModal(false);
    }, 2200);
  }

  showVoiceModal(show) {
    const modal = document.querySelector('#voice-modal');
    if (modal) {
      if (show) modal.classList.add('active');
      else modal.classList.remove('active');
    }
  }

  /**
   * Reads text aloud using browser SpeechSynthesis
   */
  speakText(text, onStateChange) {
    if (!this.synth) return;

    if (this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (onStateChange) onStateChange(false);
      return;
    }

    // Clean markdown symbols for cleaner TTS
    const cleanText = text
      .replace(/[#\*`_\[\]]/g, '')
      .replace(/\$[^$]+\$/g, 'formula')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStateChange) onStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onStateChange) onStateChange(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onStateChange) onStateChange(false);
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}
