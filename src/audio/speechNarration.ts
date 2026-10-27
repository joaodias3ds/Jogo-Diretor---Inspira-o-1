/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function speakRealityAnnouncement(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    // Cancela falas anteriores para não encavalar
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05; // Ritmo dinâmico de apresentador de TV
    utterance.pitch = 1.0;

    // Tenta encontrar uma voz pt-BR instalada
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.startsWith('pt')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('[Speech Synthesis] Erro ao narrar evento:', err);
    return false;
  }
}
