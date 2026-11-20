import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, MessageSquare } from 'lucide-react';
import { sound } from '../utils/audio.js';

const QUICK_MESSAGES = [
  'Good luck! ♟️',
  'Well played! 👏',
  'Thanks for the game! 🤝',
  'Nice move! 🔥',
  'Rematch? ⚔️'
];

const EMOJIS = ['♟️', '👑', '🔥', '👏', '🏆', '😮', '😂', '👍', '🤝'];

export function GameChat({ messages = [], onSendMessage, currentUser }) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender?.id !== currentUser?.id) {
        sound.playChat();
      }
    }
  }, [messages.length]);

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
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden h-64 md:h-72">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Game Chat</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">{messages.length} msgs</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center px-4">
            Say hi to your opponent! Send a message or quick reaction.
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

      {/* Input row */}
      <form onSubmit={handleSubmit} className="relative p-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2">
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-2 z-20 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl grid grid-cols-5 gap-1 animate-fade-in">
            {EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => sendEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-800 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
          title="Insert Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send message..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
