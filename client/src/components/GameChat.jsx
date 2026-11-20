import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  Radio,
  X,
  PhoneForwarded
} from 'lucide-react';
import { sound } from '../utils/audio.js';

const QUICK_MESSAGES = [
  'Good luck! ♟️',
  'Well played! 👏',
  'Thanks for the game! 🤝',
  'Nice move! 🔥',
  'Rematch? ⚔️'
];

const EMOJIS = ['♟️', '👑', '🔥', '👏', '🏆', '😮', '😂', '👍', '🤝'];

export function GameChat({
  messages = [],
  onSendMessage,
  currentUser,
  opponentUser,
  socket,
  gameId,
  isPlayer = false,
  triggerVoiceCall = 0
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice Chat State
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'requesting' | 'invited' | 'connected'
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inviter, setInviter] = useState(null);
  const [voiceError, setVoiceError] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const callTimerRef = useRef(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender?.id !== currentUser?.id) {
        sound.playChat();
      }
    }
  }, [messages.length]);

  // Handle external voice trigger (from GameControls "Voice Call Friend" button)
  useEffect(() => {
    if (triggerVoiceCall > 0 && voiceStatus === 'idle' && isPlayer) {
      handleRequestVoice();
    }
  }, [triggerVoiceCall]);

  // Setup WebRTC and Socket listeners for Voice Call
  useEffect(() => {
    if (!socket || !gameId) return;

    const handleInvitation = ({ from }) => {
      setInviter(from);
      setVoiceStatus('invited');
      sound.playChat();
    };

    const handleResponse = async ({ accepted, by }) => {
      if (accepted) {
        setVoiceStatus('connected');
        startWebRTC(true);
      } else {
        setVoiceStatus('idle');
        setVoiceError(`${by?.username || 'Opponent'} declined voice call.`);
        setTimeout(() => setVoiceError(''), 4000);
      }
    };

    const handleSignal = async ({ signal }) => {
      try {
        if (!peerConnection.current) {
          await startWebRTC(false);
        }

        if (signal.type === 'offer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('webrtc_signal', { gameId, signal: answer });
        } else if (signal.type === 'answer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('WebRTC signal handling notice:', err.message);
      }
    };

    const handlePeerStatus = ({ isSpeaking: peerSpeaking }) => {
      setIsSpeaking(peerSpeaking);
    };

    socket.on('voice_chat_invitation', handleInvitation);
    socket.on('voice_chat_response', handleResponse);
    socket.on('webrtc_signal', handleSignal);
    socket.on('voice_peer_status', handlePeerStatus);

    return () => {
      socket.off('voice_chat_invitation', handleInvitation);
      socket.off('voice_chat_response', handleResponse);
      socket.off('webrtc_signal', handleSignal);
      socket.off('voice_peer_status', handlePeerStatus);
      cleanupVoice();
    };
  }, [socket, gameId]);

  // Call duration timer
  useEffect(() => {
    if (voiceStatus === 'connected') {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [voiceStatus]);

  const startWebRTC = async (isInitiator) => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported on this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnection.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteAudio.current) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play().catch(() => {});
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc_signal', { gameId, signal: { candidate: event.candidate } });
        }
      };

      setupAudioAnalyser(stream);

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_signal', { gameId, signal: offer });
      }

      setVoiceStatus('connected');
    } catch (err) {
      console.warn('Microphone access notice:', err.message);
      setVoiceError('Microphone unavailable or permission denied.');
      setVoiceStatus('idle');
      setTimeout(() => setVoiceError(''), 4000);
    }
  };

  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext.current = new AudioCtx();
      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);

      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      const checkAudio = () => {
        if (!analyser.current) return;
        analyser.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
        const speaking = average > 25;
        if (speaking !== isSpeaking) {
          setIsSpeaking(speaking);
          socket?.emit('voice_status_update', { gameId, isMuted, isSpeaking: speaking });
        }
        if (voiceStatus === 'connected') {
          requestAnimationFrame(checkAudio);
        }
      };
      checkAudio();
    } catch (e) {
      console.warn('VAD setup skipped:', e);
    }
  };

  const cleanupVoice = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close().catch(() => {});
      audioContext.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setVoiceStatus('idle');
    setIsSpeaking(false);
  };

  const handleRequestVoice = () => {
    if (!socket || !isPlayer) return;
    setVoiceStatus('requesting');
    socket.emit('request_voice_chat', { gameId });
  };

  const handleRespondInvitation = (accept) => {
    if (!socket) return;
    setVoiceStatus(accept ? 'connected' : 'idle');
    socket.emit('respond_voice_chat', { gameId, accept });
    if (accept) {
      startWebRTC(false);
    }
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket?.emit('voice_status_update', { gameId, isMuted: !audioTrack.enabled, isSpeaking });
      }
    }
  };

  const toggleDeafen = () => {
    if (remoteAudio.current) {
      remoteAudio.current.muted = !isDeafened;
      setIsDeafened(!isDeafened);
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage({ text: inputText.trim() });
    setInputText('');
  };

  const sendEmoji = (emoji) => {
    onSendMessage({ emoji });
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden h-72 md:h-80 shadow-lg">
      {/* Unified Chat & Voice Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold">
        {/* Left: Chat info */}
        <div className="flex items-center gap-2 text-slate-300">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Game Chat</span>
          <span className="text-[10px] text-slate-500 font-mono">({messages.length})</span>
        </div>

        {/* Right: Embedded Voice Call Controls */}
        <div className="flex items-center gap-2">
          {voiceStatus === 'connected' ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl px-2 py-1">
              {/* Speaking indicator and Call timer */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                <span>{formatDuration(callDuration)}</span>
              </div>

              {/* Mute Mic */}
              <button
                onClick={toggleMute}
                className={`p-1 rounded-md transition-colors ${
                  isMuted
                    ? 'bg-rose-950 text-rose-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Deafen Audio */}
              <button
                onClick={toggleDeafen}
                className={`p-1 rounded-md transition-colors ${
                  isDeafened
                    ? 'bg-rose-950 text-rose-400'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={isDeafened ? 'Undeafen audio' : 'Deafen audio'}
              >
                {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* End Call */}
              <button
                onClick={cleanupVoice}
                className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                title="End voice call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : voiceStatus === 'requesting' ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1 text-[11px] font-bold text-amber-400 animate-pulse">
              <span>Calling...</span>
              <button
                onClick={() => setVoiceStatus('idle')}
                className="text-slate-400 hover:text-white"
                title="Cancel call"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isPlayer ? (
            <button
              onClick={handleRequestVoice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Start Voice Call with opponent"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Voice Call</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Voice Error Notification */}
      {voiceError && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-b border-rose-500/40 text-[11px] text-rose-300 text-center font-medium">
          {voiceError}
        </div>
      )}

      {/* Incoming Call In-Chat Banner */}
      {voiceStatus === 'invited' && (
        <div className="px-3 py-2 bg-gradient-to-r from-emerald-950/90 via-indigo-950/80 to-slate-950 border-b border-emerald-500/50 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              <strong>{inviter?.username || opponentUser?.username || 'Opponent'}</strong> is calling...
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleRespondInvitation(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
            >
              Accept
            </button>
            <button
              onClick={() => handleRespondInvitation(false)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center px-4">
            Say hi to your opponent! Send a message or tap Voice Call.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?.id === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                  <span className="font-semibold text-slate-300">{msg.sender?.username}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                    isMe
                      ? 'bg-amber-600 text-white rounded-tr-xs'
                      : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                  }`}
                >
                  {msg.emoji ? (
                    <span className="text-xl">{msg.emoji}</span>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick canned phrases */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 overflow-x-auto bg-slate-950/40 border-t border-slate-800/80 no-scrollbar">
        {QUICK_MESSAGES.map((phrase, i) => (
          <button
            key={i}
            onClick={() => onSendMessage({ text: phrase })}
            className="whitespace-nowrap px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] rounded-full border border-slate-700/50 transition-colors"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="p-2 bg-slate-800 border-t border-slate-700 flex items-center justify-around">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Text Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 p-2 bg-slate-950/80 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
        >
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
