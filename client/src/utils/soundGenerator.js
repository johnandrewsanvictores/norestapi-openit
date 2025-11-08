export const generateAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.type = "sine";
    oscillator2.type = "sine";

    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(
      400,
      audioContext.currentTime + 0.5
    );
    oscillator1.frequency.exponentialRampToValueAtTime(
      800,
      audioContext.currentTime + 1
    );

    oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(
      300,
      audioContext.currentTime + 0.5
    );
    oscillator2.frequency.exponentialRampToValueAtTime(
      600,
      audioContext.currentTime + 1
    );

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);

    oscillator1.stop(audioContext.currentTime + 3);
    oscillator2.stop(audioContext.currentTime + 3);

    return {
      stop: () => {
        try {
          oscillator1.stop();
          oscillator2.stop();
          audioContext.close();
        } catch (e) {}
      },
    };
  } catch (error) {
    console.error("Error generating alert sound:", error);
    return { stop: () => {} };
  }
};

export const playAlertSound = (audioElement) => {
  if (audioElement && audioElement.play) {
    audioElement.play().catch((error) => {
      console.warn(
        "Could not play audio file, generating synthetic sound:",
        error
      );
      return generateAlertSound();
    });
  } else {
    return generateAlertSound();
  }
};
