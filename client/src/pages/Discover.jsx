import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Search, Sparkles, MessageSquare, Calendar, Award, Star, Flame, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Discover() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Booking Modal State
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Message redirection state
  const [startingChat, setStartingChat] = useState(false);

  const fetchDiscoveryData = async () => {
    try {
      setLoadingMatches(true);
      const resMatches = await axios.get('/api/matches');
      setMatches(resMatches.data.matches);
      setLoadingMatches(false);
    } catch (error) {
      console.error('Error fetching matches:', error.message);
      setLoadingMatches(false);
    }

    try {
      setLoadingUsers(true);
      const resUsers = await axios.get(`/api/users?search=${searchTerm}`);
      setAllUsers(resUsers.data.users);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, [searchTerm]);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!bookingDate) return alert('Please select a date and time.');

    setBookingLoading(true);
    try {
      await axios.post('/api/sessions', {
        mentorId: bookingMentor._id,
        date: bookingDate,
        duration: Number(bookingDuration)
      });

      alert(`Session successfully booked with ${bookingMentor.name}! 5 credits deducted.`);
      setBookingMentor(null);
      setBookingDate('');
      setBookingDuration(60);
      fetchDiscoveryData(); // Refresh metrics
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking session.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleStartChat = async (partner) => {
    setStartingChat(true);
    const roomId = [user._id.toString(), partner._id.toString()].sort().join('--');
    try {
      // Send a dummy handshake message to open the chat thread if empty
      await axios.post('/api/chats/message', {
        receiverId: partner._id,
        text: `Hey ${partner.name}, I found you via SkillSwap and would love to exchange knowledge!`,
        roomId
      });
      window.location.hash = `/chats?room=${roomId}`;
      // In normal React Router we'd use navigate(), let's direct to window location for simplicity
      window.location.pathname = '/chats';
    } catch (error) {
      console.error('Error starting chat:', error);
      window.location.pathname = '/chats';
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">Discover Peers</h1>
            <p className="text-sm text-slate-400">Search for skills, explore smart matches, and book coaching sessions.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* AI Smart Matches */}
      {!searchTerm && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Sparkles className="text-indigo-400 animate-pulse" size={18} />
            <span>AI Smart Matches</span>
          </h2>

          {loadingMatches ? (
            <div className="flex py-10 justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-panel p-6 text-center rounded-xl text-slate-500 text-sm">
              Add more desired skills in your profile setting to unlock personalized matches.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <div key={match._id} className="glass-panel-glow p-5 rounded-xl flex flex-col justify-between gap-4 border-indigo-500/25 relative overflow-hidden">
                  {/* Match percentage tag */}
                  <div className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-glass-glow">
                    {match.matchPercentage}% Match
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={match.mentor.profilePicture} 
                        alt={match.mentor.name} 
                        className="w-12 h-12 rounded-full object-cover border border-indigo-500/20"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-200 text-sm md:text-base flex items-center gap-1.5">
                          {match.mentor.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-yellow-400 mt-0.5 font-semibold">
                          <Star size={12} className="fill-yellow-400" />
                          <span>{match.mentor.rating.toFixed(1)}</span>
                          <span className="text-slate-500">({match.mentor.streak}d streak)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {match.mentor.bio || 'Experienced developer swapping code architecture skills.'}
                    </p>

                    <div className="space-y-1.5 border-t border-brand-border pt-3">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Skills compatible:</div>
                      <div className="flex flex-wrap gap-1">
                        {match.skillsMatched.map((skill, idx) => (
                          <span key={idx} className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-lg text-[10px] text-indigo-200 leading-relaxed italic space-y-0.5">
                      {match.breakdownReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span>✨</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => handleStartChat(match.mentor)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5 text-slate-300"
                    >
                      <MessageSquare size={13} /> Chat
                    </button>
                    <button 
                      onClick={() => setBookingMentor(match.mentor)}
                      className="py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 text-white shadow-glass-glow"
                    >
                      <Calendar size={13} /> Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* General Directory */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-white">General Directory</h2>

        {loadingUsers ? (
          <div className="flex py-10 justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : allUsers.length === 0 ? (
          <div className="glass-panel p-6 text-center rounded-xl text-slate-500 text-sm">
            No profiles found matching search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((userObj) => (
              <div key={userObj._id} className="glass-panel p-5 rounded-xl flex flex-col justify-between gap-4 hover:border-slate-700 transition duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={userObj.profilePicture} 
                      alt={userObj.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-800"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm md:text-base flex items-center gap-1">
                        {userObj.name}
                        {userObj.role === 'Mentor' && (
                          <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Mentor
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-yellow-400 mt-0.5 font-semibold">
                        <Star size={12} className="fill-yellow-400" />
                        <span>{userObj.rating.toFixed(1)}</span>
                        <span className="text-slate-500">({userObj.streak || 0}d streak)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {userObj.bio || 'Exploring skill swaps and code mentoring.'}
                  </p>

                  <div className="space-y-2 border-t border-brand-border pt-3">
                    {userObj.skillsOffered.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-slate-500 uppercase font-semibold">Offers to Teach:</div>
                        <div className="flex flex-wrap gap-1">
                          {userObj.skillsOffered.map((skill, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium border border-slate-700/50">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {userObj.skillsWanted.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[9px] text-slate-500 uppercase font-semibold">Wants to Learn:</div>
                        <div className="flex flex-wrap gap-1">
                          {userObj.skillsWanted.map((skill, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md font-medium border border-slate-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={() => handleStartChat(userObj)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5 text-slate-300"
                  >
                    <MessageSquare size={13} /> Chat
                  </button>
                  <button 
                    onClick={() => setBookingMentor(userObj)}
                    className="py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 text-white shadow-glass-glow"
                  >
                    <Calendar size={13} /> Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-panel-glow rounded-2xl p-6 shadow-glass space-y-4"
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="font-display font-bold text-base text-white">Book Mentorship Session</h3>
                <button 
                  onClick={() => setBookingMentor(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-slate-900/50 p-3 border border-brand-border rounded-xl">
                  <img src={bookingMentor.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-slate-200">{bookingMentor.name}</div>
                    <div className="text-xs text-slate-500">Will teach you: {bookingMentor.skillsOffered.join(', ')}</div>
                  </div>
                </div>

                <form onSubmit={handleBookSession} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Duration (Minutes)</label>
                    <select 
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-slate-800 focus:border-indigo-500 text-slate-200 px-3 py-2 rounded-xl text-sm transition"
                    >
                      <option value={30}>30 Minutes (Cost: 5 Credits)</option>
                      <option value={60}>60 Minutes (Cost: 5 Credits)</option>
                      <option value={90}>90 Minutes (Cost: 5 Credits)</option>
                    </select>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl text-xs text-indigo-300 leading-relaxed">
                    💡 <strong>Credits Exchange Policy:</strong> Scheduling a coaching session costs <strong>5 credits</strong>, which are deducted from your balance immediately. When the session is completed, <strong>10 credits</strong> will be awarded to your mentor.
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setBookingMentor(null)}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={bookingLoading}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-xl text-white shadow-glass-glow transition disabled:opacity-50"
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
