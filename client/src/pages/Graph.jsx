import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Share2, Users, BookOpen, RefreshCw } from 'lucide-react';

export default function Graph() {
  const canvasRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Physics simulation references
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const draggedNodeRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data.users);
      buildGraphData(res.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching graph profiles:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const buildGraphData = (userList) => {
    const nodes = [];
    const links = [];
    const skillSet = new Set();

    // 1. Gather all unique skills from users
    userList.forEach(u => {
      u.skillsOffered.forEach(s => skillSet.add(s));
      u.skillsWanted.forEach(s => skillSet.add(s));
    });

    const width = 800;
    const height = 500;

    // 2. Add skill nodes (hubs)
    let idx = 0;
    skillSet.forEach(skill => {
      nodes.push({
        id: `skill-${skill}`,
        label: skill,
        type: 'skill',
        x: width / 2 + (Math.random() - 0.5) * 150,
        y: height / 2 + (Math.random() - 0.5) * 150,
        vx: 0,
        vy: 0,
        radius: 20
      });
      idx++;
    });

    // 3. Add user nodes and link to skills
    userList.forEach((u, uIdx) => {
      const uId = `user-${u._id}`;
      nodes.push({
        id: uId,
        label: u.name,
        type: 'user',
        profile: u,
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 300,
        vx: 0,
        vy: 0,
        radius: 15
      });

      // Link offers
      u.skillsOffered.forEach(skill => {
        links.push({
          source: uId,
          target: `skill-${skill}`,
          relationship: 'teaches'
        });
      });

      // Link wants
      u.skillsWanted.forEach(skill => {
        links.push({
          source: uId,
          target: `skill-${skill}`,
          relationship: 'learns'
        });
      });
    });

    nodesRef.current = nodes;
    linksRef.current = links;

    // Start simulation loop
    startSimulation();
  };

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const nodes = nodesRef.current;
    const links = linksRef.current;

    const runFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      // --- SPRING PHYSICS SIMULATION ---
      const kRepulsion = 400; // Repulsion constant
      const kAttraction = 0.05; // Spring stiffness
      const linkLength = 80;
      const damping = 0.85;

      // 1. Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 300) {
            const force = kRepulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 2. Attraction along links
      links.forEach(link => {
        const n1 = nodes.find(n => n.id === link.source);
        const n2 = nodes.find(n => n.id === link.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const displacement = dist - linkLength;
        const force = kAttraction * displacement;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      // 3. Update positions
      nodes.forEach(n => {
        if (n === draggedNodeRef.current) {
          // Snap dragged node to mouse
          n.x = mouseRef.current.x;
          n.y = mouseRef.current.y;
          n.vx = 0;
          n.vy = 0;
        } else {
          n.vx *= damping;
          n.vy *= damping;
          n.x += n.vx;
          n.y += n.vy;

          // Containment boundaries
          n.x = Math.max(n.radius, Math.min(width - n.radius, n.x));
          n.y = Math.max(n.radius, Math.min(height - n.radius, n.y));
        }
      });

      // --- RENDERING CANVAS DRAW LOOPS ---
      ctx.clearRect(0, 0, width, height);

      // Draw Edges
      links.forEach(link => {
        const n1 = nodes.find(n => n.id === link.source);
        const n2 = nodes.find(n => n.id === link.target);
        if (!n1 || !n2) return;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = link.relationship === 'teaches' 
          ? 'rgba(74, 222, 128, 0.25)' // green for teaches
          : 'rgba(99, 102, 241, 0.25)'; // purple for learns
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        
        if (n.type === 'skill') {
          // Glowing Skill Node
          ctx.fillStyle = '#6366F1';
          ctx.shadowColor = '#6366F1';
          ctx.shadowBlur = 10;
        } else {
          // User Node
          ctx.fillStyle = '#A855F7';
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Node outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Label
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - n.radius - 5);
      });

      animationFrameRef.current = requestAnimationFrame(runFrame);
    };

    animationFrameRef.current = requestAnimationFrame(runFrame);
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clicked = nodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < n.radius;
    });

    if (clicked) {
      draggedNodeRef.current = clicked;
      setSelectedNode(clicked);
      mouseRef.current = { x, y };
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y };
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white flex items-center gap-2">
          <Share2 className="text-indigo-400" />
          <span>Interactive Skill Graph</span>
        </h1>
        <p className="text-sm text-slate-400">Click and drag nodes to explore matching hubs. Green connections imply teaches/mentors; Indigo links imply learning desires.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas graph renderer */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-4 overflow-hidden flex flex-col items-center select-none shadow-glass relative">
          <button 
            onClick={fetchData}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={14} />
          </button>
          
          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Mapping relationships...</span>
            </div>
          ) : (
            <canvas 
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full bg-[#070b14]/40 max-w-[800px] aspect-[8/5] cursor-grab active:cursor-grabbing rounded-xl"
            />
          )}
        </div>

        {/* Selected node card */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">Node Details</h3>
          
          {selectedNode ? (
            <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-glass border-indigo-500/10">
              <div className="space-y-1.5">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  selectedNode.type === 'skill' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {selectedNode.type} Node
                </span>
                <h4 className="font-display font-bold text-base text-white">{selectedNode.label}</h4>
              </div>

              {selectedNode.type === 'user' && selectedNode.profile && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400 leading-relaxed italic">"{selectedNode.profile.bio || 'Skill exchanging peer'}"</p>
                  
                  <div className="space-y-2 border-t border-brand-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role:</span>
                      <span className="font-semibold text-slate-300">{selectedNode.profile.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rating:</span>
                      <span className="font-semibold text-slate-300">{selectedNode.profile.rating?.toFixed(1) || 5.0} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Streak:</span>
                      <span className="font-semibold text-slate-300">{selectedNode.profile.streak || 0} Days 🔥</span>
                    </div>
                  </div>

                  <a 
                    href={`/chats?room=${[selectedNode.profile._id, selectedNode.id].sort().join('--')}`}
                    className="block w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-center font-semibold rounded-lg text-white transition text-xs shadow-glass-glow"
                  >
                    Direct Message
                  </a>
                </div>
              )}

              {selectedNode.type === 'skill' && (
                <div className="space-y-3 text-xs text-slate-400">
                  <p className="leading-relaxed">This node represents the <strong>{selectedNode.label}</strong> skill hub in the peer community. Multiple members are connected to this hub to exchange knowledge.</p>
                  <div className="text-[10px] bg-slate-900/50 p-2.5 rounded-lg border border-brand-border flex items-center gap-1.5 text-indigo-300 font-semibold select-none">
                    💡 Click and drag hubs around to arrange styling physics dynamically.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-5 text-center rounded-2xl text-xs text-slate-500">
              Click a node on the canvas network to inspect matching profiles or skill tags.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
