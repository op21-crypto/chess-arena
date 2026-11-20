import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneCall, PhoneOff, Radio } from 'lucide-react';

export function VoiceControls({
  socket,
  gameId,
  currentUser,
  opponentUser,
  isPlayer
}) {
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle', 'requesting', 'invited', 'connected'
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inviter, setInviter] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const audioContext = useRef(null);
  const analyser = useRef(null);

  // Setup WebRTC and Socket listeners
  useEffect(() => {
    if (!socket) return;

    // 1. Incoming Voice Invitation
    socket.on('voice_chat_invitation', ({ from }) => {
      setInviter(from);
      setVoiceStatus('invited');
    });

    // 2. Voice Chat Accepted
    socket.on('voice_chat_response', async ({ accepted, by }) => {
      if (accepted) {
        setVoiceStatus('connected');
        startWebRTC(true); // Initiator creates offer
      } else {
        setVoiceStatus('idle');
        setErrorMessage(`${by?.username || 'Opponent'} declined voice chat.`);
        setTimeout(() => setErrorMessage(''), 4000);
      }
    });

    // 3. WebRTC Signaling: Offer, Answer, ICE
    socket.on('webrtc_signal', async ({ signal, from }) => {
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
        console.error('WebRTC signal error:', err);
      }
    });

    return () => {
      socket.off('voice_chat_invitation');
      socket.off('voice_chat_response');
      socket.off('webrtc_signal');
      cleanupVoice();
    };
  }, [socket, gameId]);

  const startWebRTC = async (isInitiator) => {
    try {
      // Access user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;

      // Create PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnection.current = pc;

      // Add local audio tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle incoming remote audio track
      pc.ontrack = (event) => {
        if (remoteAudio.current) {
          remoteAudio.current.srcObject = event.streams[0];
          remoteAudio.current.play().catch(e => console.log('Audio autoplay blocked:', e));
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_signal', { gameId, signal: { candidate: event.candidate } });
        }
      };

      // Voice Activity Detection (AnalyserNode)
      setupAudioAnalyser(stream);

      // If initiator, create and send Offer
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_signal', { gameId, signal: offer });
      }

      setVoiceStatus('connected');
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err.message);
      setErrorMessage('Microphone access is unavailable.');
      setVoiceStatus('idle');
      setTimeout(() => setErrorMessage(''), 4000);
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
    setVoiceStatus('idle');
    setIsSpeaking(false);
  };

  const requestVoice = () => {
    setVoiceStatus('requesting');
    socket.emit('request_voice_chat', { gameId });
  };

  const respondInvitation = (accept) => {
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

  if (!isPlayer) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
      {errorMessage && (
        <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-red-300 text-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Invitation Modal Banner */}
      {voiceStatus === 'invited' && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span><strong>{inviter?.username || 'Opponent'}</strong> requested voice chat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => respondInvitation(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => respondInvitation(false)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Connected Voice Bar */}
      {voiceStatus === 'connected' ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Voice Live</span>
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
                <span className="w-1 bg-emerald-400 rounded-full voice-wave-bar" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'bg-red-950/60 border-red-500/50 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleDeafen}
              className={`p-2 rounded-lg border transition-colors ${
                isDeafened
                  ? 'bg-red-950/60 border-red-500/50 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isDeafened ? 'Undeafen audio' : 'Deafen audio'}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={cleanupVoice}
              className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 border border-red-500 text-white transition-colors"
              title="Disconnect voice"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : voiceStatus === 'requesting' ? (
        <div className="flex items-center justify-between text-xs text-amber-400 py-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Waiting for opponent to accept voice chat...</span>
          </div>
          <button
            onClick={() => setVoiceStatus('idle')}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-4 h-4 text-slate-500" />
            <span>WebRTC Voice Chat (Mutual Consent)</span>
          </div>
          <button
            onClick={requestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Invite to Voice</span>
          </button>
        </div>
      )}
    </div>
  );
}
