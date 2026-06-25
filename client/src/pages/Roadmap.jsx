import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  CheckSquare, 
  Square, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Roadmap() {
  const [searchParams] = useSearchParams();
  const activeRoadmapId = searchParams.get('id');

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [targetGoal, setTargetGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const fetchRoadmaps = async (selectId = null) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/roadmaps');
      setRoadmaps(res.data.roadmaps);

      if (res.data.roadmaps.length > 0) {
        // Decide which roadmap to select
        const toSelect = selectId 
          ? res.data.roadmaps.find(r => r._id === selectId)
          : (activeRoadmapId ? res.data.roadmaps.find(r => r._id === activeRoadmapId) : res.data.roadmaps[0]);
        
        setSelectedRoadmap(toSelect || res.data.roadmaps[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roadmaps:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [activeRoadmapId]);

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!targetGoal) return;

    setGenerating(true);
    try {
      const res = await axios.post('/api/roadmaps', { targetGoal });
      setTargetGoal('');
      await fetchRoadmaps(res.data.roadmap._id);
    } catch (error) {
      alert('Error generating roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMilestone = async (weekId, milestoneId, currentVal) => {
    if (!selectedRoadmap) return;

    try {
      const res = await axios.put(`/api/roadmaps/${selectedRoadmap._id}/milestone`, {
        weekId,
        milestoneId,
        completed: !currentVal
      });

      // Update local state smoothly
      setSelectedRoadmap(res.data.roadmap);
      setRoadmaps(roadmaps.map(r => r._id === res.data.roadmap._id ? res.data.roadmap : r));
    } catch (error) {
      console.error('Error toggling milestone:', error);
    }
  };

  const toggleWeekExpand = (weekId) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  if (loading && roadmaps.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Loading learning paths...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Selector */}
      <div className="space-y-4 lg:col-span-1">
        <div className="space-y-2">
          <h2 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">Your Roadmaps</h2>
          <div className="flex flex-col gap-2">
            {roadmaps.map((r) => (
              <button
                key={r._id}
                onClick={() => setSelectedRoadmap(r)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                  selectedRoadmap?._id === r._id 
                    ? 'glass-panel-glow border-indigo-500/30 bg-indigo-500/5' 
                    : 'glass-panel hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 line-clamp-1">{r.title}</div>
                <div className="flex justify-between items-center w-full text-[10px] text-slate-500 font-medium">
                  <span className="truncate pr-1">Goal: {r.targetGoal}</span>
                  <span className="text-indigo-400 font-bold">{r.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Panel */}
        <div className="glass-panel p-4 rounded-xl border border-brand-border space-y-4">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles size={16} />
            <h3 className="font-semibold text-xs uppercase tracking-wider">Plan New Career</h3>
          </div>
          <form onSubmit={handleGenerateRoadmap} className="space-y-3">
            <input 
              type="text" 
              placeholder="e.g. Backend Architect"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
              required
            />
            <button 
              type="submit"
              disabled={generating || !targetGoal}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl text-xs font-semibold shadow-glass-glow transition disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Compass size={14} />
                  <span>Generate Path</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Roadmap Detail View */}
      <div className="lg:col-span-3 space-y-6">
        {selectedRoadmap ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />
              
              <div className="space-y-1.5">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Active Roadmap
                </span>
                <h1 className="font-display font-bold text-xl md:text-2xl text-white">{selectedRoadmap.title}</h1>
                <p className="text-xs text-slate-400">Target Career Path: <strong className="text-indigo-300 font-semibold">{selectedRoadmap.targetGoal}</strong></p>
              </div>

              {/* Skill gap info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-border pt-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Analyzed Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRoadmap.skillsAnalyzed?.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Identified Skill Gaps:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRoadmap.skillGaps?.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/20 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2 border-t border-brand-border pt-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Syllabus Completion</span>
                  <span className="text-indigo-400">{selectedRoadmap.progress}% Done</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedRoadmap.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Syllabus Checklist */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-white">Syllabus & Milestones</h2>
              <div className="space-y-3">
                {selectedRoadmap.weeks?.map((w) => {
                  const isExpanded = expandedWeeks[w._id] ?? true; // Default expanded
                  return (
                    <div key={w._id} className="glass-panel rounded-xl overflow-hidden">
                      {/* Week header accordions */}
                      <button 
                        onClick={() => toggleWeekExpand(w._id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-900/35 hover:bg-slate-900/60 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 flex items-center justify-center font-bold text-xs font-display">
                            W{w.week}
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-sm text-slate-200">{w.topic}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{w.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {w.completed ? (
                            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                              Passed
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">
                              Learning
                            </span>
                          )}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-brand-border/40"
                          >
                            <div className="p-4 space-y-4 bg-slate-950/20 text-xs">
                              {/* Resources */}
                              {w.resources?.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Recommended Resources:</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {w.resources.map((res, idx) => (
                                      <a 
                                        key={idx}
                                        href={res.url || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-brand-border rounded-lg text-indigo-300 font-medium transition"
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <BookOpen size={14} className="text-indigo-400 shrink-0" />
                                          <span className="truncate">{res.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1 select-none">
                                          <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0">
                                            {res.type}
                                          </span>
                                          <ExternalLink size={10} className="text-slate-500 shrink-0" />
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Milestones Tasks */}
                              <div className="space-y-2">
                                <div className="text-[10px] text-slate-500 uppercase font-semibold">Weekly Milestone Deliverables:</div>
                                <div className="space-y-2">
                                  {w.milestones?.map((ms) => (
                                    <button 
                                      key={ms._id}
                                      onClick={() => handleToggleMilestone(w._id, ms._id, ms.completed)}
                                      className="w-full flex items-start gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/60 border border-brand-border/60 rounded-xl transition text-left"
                                    >
                                      {ms.completed ? (
                                        <CheckSquare size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                                      ) : (
                                        <Square size={16} className="text-slate-600 mt-0.5 shrink-0" />
                                      )}
                                      <span className={`text-xs ${ms.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                        {ms.task}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-10 text-center rounded-2xl flex flex-col items-center justify-center gap-4">
            <Compass size={40} className="text-slate-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-slate-300">Generate Your First Learning Pathway</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Use the side panel to generate a customized 4-week roadmap containing hand-curated documentation resources, learning goals, and checklist items.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
