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
import { firebaseRoomService } from '../services/firebaseRoomService.js';

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
  triggerVoiceCall = 0,
  isLight = false,
  isOpponentTyping = false,
  onTyping,
  roomData = null
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socketOpponentTyping, setSocketOpponentTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const typingTimerRef = useRef(null);

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
  const remoteAudioRef = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const callTimerRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  // Auto-scroll ONLY inner chat container without moving the browser window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender?.id !== currentUser?.id) {
        sound.playChat();
      }
    }
  }, [messages.length]);

  const processedSignalsRef = useRef(new Set());

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
    if (remoteAudioRef.current) {
      try {
        remoteAudioRef.current.pause();
        remoteAudioRef.current.srcObject = null;
      } catch {}
    }
    iceCandidatesQueueRef.current = [];
    if (audioContext.current) {
      audioContext.current.close().catch(() => {});
      audioContext.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (gameId) {
      firebaseRoomService.sendRoomVoice(gameId, { action: 'end' }).catch(() => {});
    }
    setVoiceStatus('idle');
    setIsSpeaking(false);
  };

  const startWebRTC = async (isInitiator) => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported on this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      localStream.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ]
      });
      peerConnection.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.volume = 1.0;
          remoteAudioRef.current.muted = false;
          remoteAudioRef.current.play().catch(e => {
            console.warn('Remote audio playback notice:', e);
          });
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = event.candidate.toJSON ? event.candidate.toJSON() : {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
          };
          if (socket) {
            socket.emit('webrtc_signal', { gameId, signal: { candidate: candidateData } });
          }
          if (gameId) {
            firebaseRoomService.sendRoomVoice(gameId, { action: 'signal', from: currentUser, signal: { candidate: candidateData } }).catch(() => {});
          }
        }
      };

      setupAudioAnalyser(stream);

      if (isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        });
        await pc.setLocalDescription(offer);
        const offerData = { type: 'offer', sdp: offer.sdp };
        if (socket) {
          socket.emit('webrtc_signal', { gameId, signal: offerData });
        }
        if (gameId) {
          firebaseRoomService.sendRoomVoice(gameId, { action: 'signal', from: currentUser, signal: offerData }).catch(() => {});
        }
      }

      setVoiceStatus('connected');
    } catch (err) {
      console.warn('Microphone access notice:', err.message);
      setVoiceError('Microphone unavailable or permission denied.');
      setVoiceStatus('idle');
      setTimeout(() => setVoiceError(''), 4000);
    }
  };

  const handleSignal = async ({ signal }) => {
    try {
      if (!signal) return;

      // Handle remote ICE candidate
      if (signal.candidate) {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            console.warn('addIceCandidate notice:', e);
          }
        } else {
          iceCandidatesQueueRef.current.push(signal.candidate);
        }
        return;
      }

      if (!peerConnection.current) {
        await startWebRTC(false);
      }
      const pc = peerConnection.current;
      if (!pc) return;

      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));

        // Flush queued candidates
        while (iceCandidatesQueueRef.current.length > 0) {
          const cand = iceCandidatesQueueRef.current.shift();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn('Queued candidate apply error:', e);
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const answerData = { type: 'answer', sdp: answer.sdp };
        if (socket) {
          socket.emit('webrtc_signal', { gameId, signal: answerData });
        }
        if (gameId) {
          firebaseRoomService.sendRoomVoice(gameId, { action: 'signal', from: currentUser, signal: answerData }).catch(() => {});
        }
      } else if (signal.type === 'answer') {
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          // Flush queued candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const cand = iceCandidatesQueueRef.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('Queued candidate apply error:', e);
            }
          }
        }
      }
    } catch (err) {
      console.warn('WebRTC signal handling notice:', err.message);
    }
  };

  const handleRequestVoice = () => {
    if (!isPlayer) {
      setVoiceError('Only active players in this game can initiate voice calls.');
      setTimeout(() => setVoiceError(''), 4000);
      return;
    }
    if (!opponentUser) {
      setVoiceError('Waiting for your friend to enter the room before starting voice call 🎧');
      setTimeout(() => setVoiceError(''), 4000);
      return;
    }
    setVoiceStatus('requesting');
    if (socket) {
      socket.emit('request_voice_chat', { gameId, from: currentUser });
    }
    if (gameId) {
      firebaseRoomService.sendRoomVoice(gameId, { action: 'request', from: currentUser }).catch(() => {});
      fetch('/api/rooms/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: gameId, action: 'request', from: currentUser })
      }).catch(() => {});
    }
  };

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

    const handlePeerStatus = ({ isSpeaking: peerSpeaking }) => {
      setIsSpeaking(peerSpeaking);
    };

    const handleOpponentTyping = ({ user, isTyping }) => {
      if (user?.id !== currentUser?.id && user?.username !== currentUser?.username) {
        setSocketOpponentTyping(Boolean(isTyping));
      }
    };

    socket.on('voice_chat_invitation', handleInvitation);
    socket.on('voice_chat_response', handleResponse);
    socket.on('webrtc_signal', handleSignal);
    socket.on('voice_peer_status', handlePeerStatus);
    socket.on('game_chat_typing', handleOpponentTyping);

    return () => {
      socket.off('voice_chat_invitation', handleInvitation);
      socket.off('voice_chat_response', handleResponse);
      socket.off('webrtc_signal', handleSignal);
      socket.off('voice_peer_status', handlePeerStatus);
      socket.off('game_chat_typing', handleOpponentTyping);
      cleanupVoice();
    };
  }, [socket, gameId]);

  // Handle roomData voice updates (Calls & WebRTC Signals) from Firestore / REST
  useEffect(() => {
    if (!roomData?.voiceCall && (!roomData?.voiceSignals || roomData.voiceSignals.length === 0)) return;

    // 1. Voice Call Request / Response handling
    if (roomData.voiceCall) {
      const vc = roomData.voiceCall;
      const isFromOther = vc.from?.id !== currentUser?.id && vc.from?.username !== currentUser?.username;
      if (vc.status === 'requesting' && isFromOther) {
        if (voiceStatus !== 'invited' && voiceStatus !== 'connected') {
          setInviter(vc.from);
          setVoiceStatus('invited');
          sound.playChat();
        }
      } else if (vc.status === 'connected' && voiceStatus === 'requesting') {
        setVoiceStatus('connected');
        startWebRTC(true);
      } else if (vc.status === 'declined' && voiceStatus === 'requesting') {
        setVoiceStatus('idle');
        setVoiceError(`${vc.by?.username || 'Opponent'} declined voice call.`);
        setTimeout(() => setVoiceError(''), 4000);
      }
    }

    // 2. WebRTC Peer-to-Peer Signals from Firestore
    if (Array.isArray(roomData.voiceSignals) && roomData.voiceSignals.length > 0 && gameId) {
      const myId = String(currentUser?.id || '').trim();
      const myName = String(currentUser?.username || '').trim();

      roomData.voiceSignals.forEach(async (sigItem) => {
        if (!sigItem?.signal) return;
        const senderId = typeof sigItem.from === 'object'
          ? String(sigItem.from?.id || sigItem.from?.username || '').trim()
          : String(sigItem.from || '').trim();

        const isFromMe = (myId && senderId === myId) || (myName && senderId === myName);
        if (isFromMe) return;

        const sigKey = `${sigItem.timestamp || 0}_${sigItem.signal.type || 'candidate'}_${JSON.stringify(sigItem.signal).slice(0, 50)}`;
        if (processedSignalsRef.current.has(sigKey)) return;
        processedSignalsRef.current.add(sigKey);

        await handleSignal({ signal: sigItem.signal });
      });
    }
  }, [roomData?.voiceCall, roomData?.voiceSignals, currentUser?.id, currentUser?.username, voiceStatus, gameId]);

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

  const handleRespondInvitation = (accept) => {
    setVoiceStatus(accept ? 'connected' : 'idle');
    if (accept && remoteAudioRef.current) {
      remoteAudioRef.current.play().catch(() => {});
    }
    if (socket) {
      socket.emit('respond_voice_chat', { gameId, accept, by: currentUser });
    }
    if (gameId) {
      firebaseRoomService.sendRoomVoice(gameId, { action: 'respond', accept, by: currentUser }).catch(() => {});
      fetch('/api/rooms/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: gameId, action: 'respond', accept, by: currentUser })
      }).catch(() => {});
    }
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
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isDeafened;
      setIsDeafened(!isDeafened);
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    // Broadcast typing status
    if (onTyping) onTyping(true);
    if (socket && gameId) {
      socket.emit('game_chat_typing', { gameId, user: currentUser, isTyping: true });
    }

    // Auto-expire typing indicator after 2.5s of no keypress
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (onTyping) onTyping(false);
      if (socket && gameId) {
        socket.emit('game_chat_typing', { gameId, user: currentUser, isTyping: false });
      }
    }, 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (onTyping) onTyping(false);
    if (socket && gameId) {
      socket.emit('game_chat_typing', { gameId, user: currentUser, isTyping: false });
    }

    onSendMessage({ text: inputText.trim() });
    setInputText('');
  };

  const sendEmoji = (emoji) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (onTyping) onTyping(false);
    if (socket && gameId) {
      socket.emit('game_chat_typing', { gameId, user: currentUser, isTyping: false });
    }
    onSendMessage({ emoji });
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex flex-col border rounded-2xl overflow-hidden h-72 md:h-80 shadow-md transition-colors ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
    }`}>
      {/* Unified Chat & Voice Header */}
      <div className={`flex items-center justify-between px-3.5 py-2.5 border-b text-xs font-semibold ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/80 border-slate-800 text-white'
      }`}>
        {/* Left: Chat info */}
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Game Chat</span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>({messages.length})</span>
        </div>

        {/* Right: Embedded Voice Call Controls */}
        <div className="flex items-center gap-2">
          {voiceStatus === 'connected' ? (
            <div className={`flex items-center gap-1.5 border rounded-xl px-2 py-1 ${
              isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/70 border-emerald-500/40'
            }`}>
              {/* Speaking indicator and Call timer */}
              <div className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
                isLight ? 'text-emerald-800' : 'text-emerald-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                <span>{formatDuration(callDuration)}</span>
              </div>

              {/* Mute Mic */}
              <button
                onClick={toggleMute}
                className={`p-1 rounded-md transition-colors ${
                  isMuted
                    ? (isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-950 text-rose-400')
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-300 hover:text-white')
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
                    ? (isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-950 text-rose-400')
                    : (isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-300 hover:text-white')
                }`}
                title={isDeafened ? 'Undeafen audio' : 'Deafen audio'}
              >
                {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* End Call */}
              <button
                onClick={cleanupVoice}
                className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="End voice call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : voiceStatus === 'requesting' ? (
            <div className={`flex items-center gap-2 border rounded-xl px-2.5 py-1 text-[11px] font-bold animate-pulse ${
              isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span>Calling...</span>
              <button
                onClick={() => setVoiceStatus('idle')}
                className={`cursor-pointer ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                title="Cancel call"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isPlayer ? (
            <button
              onClick={handleRequestVoice}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200'
              }`}
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
        <div className={`px-3 py-1.5 border-b text-[11px] text-center font-medium ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          {voiceError}
        </div>
      )}

      {/* Incoming Call In-Chat Banner */}
      {voiceStatus === 'invited' && (
        <div className={`px-3 py-2 border-b flex items-center justify-between animate-fade-in ${
          isLight
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-gradient-to-r from-emerald-950/90 via-indigo-950/80 to-slate-950 border-emerald-500/50 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Radio className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>
              <strong>{inviter?.username || opponentUser?.username || 'Opponent'}</strong> is calling...
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleRespondInvitation(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Accept
            </button>
            <button
              onClick={() => handleRespondInvitation(false)}
              className={`px-2.5 py-1 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Message List */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-3 space-y-2 text-xs ${
          isLight ? 'bg-slate-50/50' : 'bg-transparent'
        }`}
      >
        {messages.length === 0 ? (
          <div className={`h-full flex items-center justify-center italic text-center px-4 ${
            isLight ? 'text-slate-500 font-medium' : 'text-slate-500'
          }`}>
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
                <div className={`flex items-center gap-1 text-[10px] mb-0.5 px-1 ${
                  isLight ? 'text-slate-500 font-medium' : 'text-slate-400'
                }`}>
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {msg.sender?.username}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                    isMe
                      ? (isLight ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-xs' : 'bg-amber-600 text-white rounded-tr-xs')
                      : (isLight ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs font-normal' : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60')
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

        {/* Live Typing Indicator */}
        {(isOpponentTyping || socketOpponentTyping) && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl max-w-[85%] animate-fade-in self-start shadow-xs border ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}>
            <span className="text-[11px] font-semibold">
              ✍️ {opponentUser?.username || 'Opponent'} is typing
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </div>

      {/* Quick canned phrases */}
      <div className={`flex items-center gap-1.5 px-2 py-1.5 overflow-x-auto border-t no-scrollbar ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
      }`}>
        {QUICK_MESSAGES.map((phrase, i) => (
          <button
            key={i}
            onClick={() => onSendMessage({ text: phrase })}
            className={`whitespace-nowrap px-2.5 py-0.5 text-[11px] font-medium rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border-slate-700/50'
            }`}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className={`p-2 border-t flex items-center justify-around ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
        }`}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Text Input Form */}
      <form onSubmit={handleSubmit} className={`flex items-center gap-1.5 p-2 border-t ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950/80 border-slate-800'
      }`}>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type message..."
          className={`flex-1 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden ${
            isLight
              ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500'
              : 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500/50'
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Hidden dedicated DOM Audio Element for Real-Time WebRTC Voice Playback */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        aria-hidden="true"
        style={{ display: 'none' }}
      />
    </div>
  );
}
