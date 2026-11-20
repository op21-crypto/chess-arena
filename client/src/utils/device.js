// Haptic Vibrations & Speech Commentary Engine

export function triggerHaptic(type = 'move') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'move':
        navigator.vibrate(15);
        break;
      case 'capture':
        navigator.vibrate([20, 30, 25]);
        break;
      case 'check':
        navigator.vibrate([35, 40, 50]);
        break;
      case 'gameover':
        navigator.vibrate([60, 40, 80, 40, 100]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (e) {}
}

const PIECE_NAMES = {
  N: 'Knight',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King'
};

export function speakMove(san, piece = 'p') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop prior sentence

    let text = san;
    if (san === 'O-O') {
      text = 'Castles kingside';
    } else if (san === 'O-O-O') {
      text = 'Castles queenside';
    } else {
      const firstChar = san[0];
      const isPiece = PIECE_NAMES[firstChar];
      if (isPiece) {
        text = isPiece + ' to ' + san.slice(1).replace('x', ' takes ').replace('+', ' check').replace('#', ' checkmate');
      } else {
        text = 'Pawn to ' + san.replace('x', ' takes ').replace('+', ' check').replace('#', ' checkmate');
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}
