import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { Send, MessageSquare, ShieldAlert, Sparkles, Smile, Phone, Video } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const activeParamRoomId = searchParams.get('room');

  const { user } = useAuthStore();
  const { 
    chats, 
    messages, 
    activeRoomId, 
    activePartner, 
    onlineUsers,
    typingStatus,
    fetchChatsList, 
    joinRoom, 
    sendMessage, 
    sendTyping 
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  // Poll chats list on load
  useEffect(() => {
    fetchChatsList();
    const interval = setInterval(fetchChatsList, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle room query redirect
  useEffect(() => {
    if (activeParamRoomId && chats.length > 0) {
      const matchChat = chats.find(c => c.roomId === activeParamRoomId);
      if (matchChat) {
        joinRoom(matchChat.roomId, matchChat.partner);
      }
    }
  }, [activeParamRoomId, chats]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessage(messageText);
    setMessageText('');
    
    // Stop typing immediately on send
    if (typing) {
      sendTyping(false);
      setTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Emit typing status
    if (!typing) {
      sendTyping(true);
      setTyping(true);
    }

    // Reset stop typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
      setTyping(false);
    }, 2000);
  };

  const isOnline = (partnerId) => {
    return onlineUsers.includes(partnerId.toString());
  };

  return (
    <div className="glass-panel rounded-2xl h-[calc(100vh-120px)] flex overflow-hidden border border-brand-border shadow-glass">
      {/* Sidebar - Chats Contacts */}
      <div className="w-full md:w-80 border-r border-brand-border flex flex-col bg-slate-950/25">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white">Peer Conversations</h3>
          <span className="text-[10px] bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full select-none">
            {chats.length} Threads
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No conversations yet. Go to <a href="/discover" className="text-indigo-400 underline">Discover</a> to message peer partners.
            </div>
          ) : (
            chats.map((chat) => {
              const partnerOnline = isOnline(chat.partner._id);
              const isActive = activeRoomId === chat.roomId;
              return (
                <button
                  key={chat.roomId}
                  onClick={() => joinRoom(chat.roomId, chat.partner)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                    isActive ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative shrink-0">
                      <img 
                        src={chat.partner.profilePicture} 
                        alt={chat.partner.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-800"
                      />
                      {partnerOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-brand-dark animate-pulse" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs text-slate-200 truncate">{chat.partner.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {chat.lastMessage ? chat.lastMessage.text : 'Opened a dialogue...'}
                      </p>
                    </div>
                  </div>

                  {chat.unreadCount > 0 && (
                    <span className="bg-indigo-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-glass-glow">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Dialogue Area */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/10">
        {activeRoomId && activePartner ? (
          <>
            {/* Active partner banner */}
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-slate-950/25">
              <div className="flex items-center gap-3 overflow-hidden">
                <img 
                  src={activePartner.profilePicture} 
                  alt={activePartner.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-800 shrink-0"
                />
                <div>
                  <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <span>{activePartner.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline(activePartner._id) ? 'bg-green-500' : 'bg-slate-500'}`} />
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate line-clamp-1 italic max-w-md">"{activePartner.bio || 'Wants to swap coding expertise.'}"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href="/discover"
                  className="text-xs bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                >
                  Schedule Swap
                </a>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => {
                const isMe = m.sender === user._id;
                return (
                  <div 
                    key={m._id || idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl text-xs space-y-1 ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-glass-glow' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div className={`text-[8px] text-right font-medium ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Active typing indicator */}
              {typingStatus[activeRoomId] && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 border border-slate-800 text-slate-400 p-2.5 rounded-xl rounded-tl-none flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] italic">{typingStatus[activeRoomId].username} is drafting...</span>
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            {/* Chat message input form */}
            <form onSubmit={handleSend} className="p-4 border-t border-brand-border flex items-center gap-2 bg-slate-950/20">
              <input 
                type="text" 
                placeholder="Type your message..."
                value={messageText}
                onChange={handleInputChange}
                className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs"
              />
              <button 
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-glass-glow disabled:opacity-50 transition"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 p-6 text-center">
            <MessageSquare size={36} className="text-slate-600 animate-pulse" />
            <div>
              <h3 className="font-semibold text-slate-400">Select Peer Conversation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Exchange technical notes, share links, and schedule study sessions directly with your matched tutors.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
