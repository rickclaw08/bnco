"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  CheckCircle,
  XCircle,
  X,
  Users,
  Mail,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Activity,
  Plus,
  DollarSign,
  Target,
  Layers,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  title: string;
  emoji: string;
  color: string;
  status: string;
  current_task: string | null;
  parent_id: string | null;
  office_x: number;
  office_y: number;
}

interface Plan {
  id: number;
  title: string;
  summary: string;
  department: string;
  file_path: string;
  status: string;
  submitted_by: string;
  created_at: string;
}

interface ProjectTask {
  id: number;
  project_id: string;
  title: string;
  status: string;
  assigned_to: string;
  priority: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  status: string;
  revenue: number;
  leads: number;
  clients: number;
  details: Record<string, Array<{ label: string; value: string }>>;
  tasks: ProjectTask[];
}

// OpenClaw lobster logo - exact replica from openclaw.ai with per-agent color tinting
function ClawAvatar({
  color,
  size = 48,
  status,
}: {
  color: string;
  size?: number;
  status: string;
}) {
  const isActive = status === "active" || status === "working";
  // Generate a unique gradient ID per instance to avoid SVG id collisions
  const gradId = `lg-${color.replace('#', '')}-${size}`;
  // Derive darker end color by mixing toward black
  const darkerColor = color.length === 7
    ? '#' + [1,3,5].map(i => Math.max(0, Math.round(parseInt(color.slice(i, i+2), 16) * 0.55)).toString(16).padStart(2, '0')).join('')
    : color;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={isActive ? { animation: 'lobsterFloat 4s ease-in-out infinite' } : undefined}
    >
      {/* Lobster body silhouette */}
      <path
        d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
        fill={`url(#${gradId})`}
      />

      {/* Left claw */}
      <path
        d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
        fill={`url(#${gradId})`}
        style={isActive ? { animation: 'clawSnapLeft 4s ease-in-out infinite', transformOrigin: '25px 55px' } : undefined}
      />

      {/* Right claw */}
      <path
        d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
        fill={`url(#${gradId})`}
        style={isActive ? { animation: 'clawSnapRight 4s ease-in-out 0.2s infinite', transformOrigin: '95px 55px' } : undefined}
      />

      {/* Antennae */}
      <path
        d="M45 15 Q35 5 30 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={isActive ? { animation: 'antennaWiggle 2s ease-in-out infinite' } : undefined}
      />
      <path
        d="M75 15 Q85 5 90 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={isActive ? { animation: 'antennaWiggle 2s ease-in-out infinite' } : undefined}
      />

      {/* Eyes */}
      <circle cx="45" cy="35" r="6" fill="#050810" />
      <circle cx="75" cy="35" r="6" fill="#050810" />
      {/* Eye glow */}
      <circle cx="46" cy="34" r="2" fill="#00e5cc">
        {isActive && (
          <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="76" cy="34" r="2" fill="#00e5cc">
        {isActive && (
          <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Drop shadow glow when active */}
      {isActive && (
        <circle cx="60" cy="60" r="50" fill="none" style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={darkerColor} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Header logo - exact OpenClaw lobster from openclaw.ai
function OpenClawLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'lobsterFloat 4s ease-in-out infinite' }}
    >
      <path
        d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
        fill="url(#hq-logo-grad)"
      />
      <path
        d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
        fill="url(#hq-logo-grad)"
        style={{ animation: 'clawSnapLeft 4s ease-in-out infinite', transformOrigin: '25px 55px' }}
      />
      <path
        d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
        fill="url(#hq-logo-grad)"
        style={{ animation: 'clawSnapRight 4s ease-in-out 0.2s infinite', transformOrigin: '95px 55px' }}
      />
      <path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" fill="none"
        style={{ animation: 'antennaWiggle 2s ease-in-out infinite' }} />
      <path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" fill="none"
        style={{ animation: 'antennaWiggle 2s ease-in-out infinite' }} />
      <circle cx="45" cy="35" r="6" fill="#050810" />
      <circle cx="75" cy="35" r="6" fill="#050810" />
      <circle cx="46" cy="34" r="2" fill="#00e5cc">
        <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="76" cy="34" r="2" fill="#00e5cc">
        <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <defs>
        <linearGradient id="hq-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function OfficeBox({
  agent,
  children,
  isRick,
  plans,
  onOpenFolder,
}: {
  agent: Agent;
  children?: Agent[];
  isRick?: boolean;
  plans: Plan[];
  onOpenFolder: (agent: Agent) => void;
}) {
  const agentPlans = plans.filter(
    (p) => p.submitted_by === agent.id || (isRick && p.status === "pending_approval")
  );
  const hasPending = agentPlans.some((p) => p.status === "pending_approval");
  const completedCount = agentPlans.filter(
    (p) => p.status === "approved" || p.status === "denied"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl border-2 p-3 ${
        isRick
          ? "border-[#4ade80]/50 bg-[#0f1a2e] col-span-1 row-span-1 min-h-[220px]"
          : "border-white/10 bg-[#111827] min-h-[180px]"
      } hover:border-white/20 transition-all`}
    >
      {/* Office label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{agent.emoji}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: agent.color }}>
              {agent.name}
            </p>
            <p className="text-[10px] text-gray-500">{agent.title}</p>
          </div>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
            agent.status === "active"
              ? "bg-green-500/20 text-green-400"
              : agent.status === "working"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {agent.status}
        </div>
      </div>

      {/* Agent avatar at desk */}
      <div className="flex justify-center mb-1">
        <ClawAvatar color={agent.color} size={isRick ? 56 : 44} status={agent.status} />
      </div>

      {agent.current_task && (
        <p className="text-[9px] text-gray-400 text-center truncate px-1">
          {agent.current_task}
        </p>
      )}

      {/* Sub-agents (employees) */}
      {children && children.length > 0 && (
        <div className="mt-2 flex gap-1 justify-center flex-wrap">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex flex-col items-center"
              title={`${child.name} - ${child.title}`}
            >
              <ClawAvatar color={child.color} size={24} status={child.status} />
              <span className="text-[8px] text-gray-500">{child.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Folder icon - bottom right */}
      <button
        onClick={() => onOpenFolder(agent)}
        className="absolute bottom-2 right-2 flex items-center gap-1 group"
        title={isRick ? "Plans for Approval" : `${agent.name}'s Completed Work`}
      >
        <Folder
          size={16}
          className={`${
            hasPending
              ? "text-yellow-400 animate-pulse"
              : completedCount > 0
              ? "text-[#4ade80]"
              : "text-gray-600"
          } group-hover:text-white transition-colors`}
        />
        {(hasPending || completedCount > 0) && (
          <span className="text-[9px] text-gray-400">
            {isRick
              ? agentPlans.filter((p) => p.status === "pending_approval").length
              : completedCount}
          </span>
        )}
      </button>
    </motion.div>
  );
}

function PlanModal({
  agent,
  plans,
  isRick,
  onClose,
  onApprove,
  onDeny,
  onViewContent,
  viewingContent,
}: {
  agent: Agent;
  plans: Plan[];
  isRick: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onDeny: (id: number) => void;
  onViewContent: (path: string) => void;
  viewingContent: { content: string; full_length: number } | null;
}) {
  const relevantPlans = isRick
    ? plans.filter((p) => p.status === "pending_approval")
    : plans.filter((p) => p.submitted_by === agent.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#111827] border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111827] z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">{agent.emoji}</span>
            <div>
              <h2 className="text-sm font-bold" style={{ color: agent.color }}>
                {isRick ? "Plans Awaiting Approval" : `${agent.name}'s Work`}
              </h2>
              <p className="text-[10px] text-gray-500">
                {relevantPlans.length} item{relevantPlans.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {relevantPlans.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No items</p>
          ) : (
            relevantPlans.map((plan) => (
              <div
                key={plan.id}
                className="border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{plan.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {plan.department} / {plan.file_path}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      plan.status === "pending_approval"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : plan.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {plan.status.replace("_", " ")}
                  </span>
                </div>

                {plan.summary && (
                  <p className="text-xs text-gray-400 mb-2">{plan.summary}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewContent(plan.file_path)}
                    className="text-[10px] px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-gray-300"
                  >
                    Preview
                  </button>
                  {plan.status === "pending_approval" && (
                    <>
                      <button
                        onClick={() => onApprove(plan.id)}
                        className="text-[10px] px-2 py-1 bg-green-600/20 rounded hover:bg-green-600/40 text-green-400 flex items-center gap-1"
                      >
                        <CheckCircle size={10} /> Approve
                      </button>
                      <button
                        onClick={() => onDeny(plan.id)}
                        className="text-[10px] px-2 py-1 bg-red-600/20 rounded hover:bg-red-600/40 text-red-400 flex items-center gap-1"
                      >
                        <XCircle size={10} /> Deny
                      </button>
                    </>
                  )}
                </div>

                {viewingContent && (
                  <div className="mt-2 bg-black/30 rounded p-2 max-h-48 overflow-y-auto">
                    <pre className="text-[10px] text-gray-300 whitespace-pre-wrap font-mono">
                      {viewingContent.content}
                    </pre>
                    {viewingContent.full_length > 3000 && (
                      <p className="text-[9px] text-gray-600 mt-1">
                        Showing first 3000 of {viewingContent.full_length.toLocaleString()} chars
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SidePanel({
  title,
  icon,
  children,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-lg bg-[#111827] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-xs font-medium">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-gray-500" />
        ) : (
          <ChevronDown size={14} className="text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2.5 pt-0 border-t border-white/5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GatewayData {
  connected: boolean;
  status?: {
    heartbeat?: { lastPingMs?: number };
    sessions?: Array<{
      key: string;
      kind: string;
      displayName?: string;
      agentId?: string;
      channel?: string;
      lastActivityMs?: number;
    }>;
  };
  agents?: {
    agents?: Array<{ id: string; name: string }>;
  };
  sessions?: {
    sessions?: Array<{
      key: string;
      kind: string;
      displayName?: string;
      agentId?: string;
      lastActivityMs?: number;
    }>;
    count?: number;
  };
  cron?: {
    jobs?: Array<{
      id: string;
      name: string;
      enabled: boolean;
      schedule?: { kind?: string; at?: string; cron?: string };
      state?: { nextRunAtMs?: number; lastRunAtMs?: number };
    }>;
  };
  timestamp?: string;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewingContent, setViewingContent] = useState<{
    content: string;
    full_length: number;
  } | null>(null);
  const [gatherMsg, setGatherMsg] = useState("");
  const [gateway, setGateway] = useState<GatewayData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchData = useCallback(() => {
    fetch("/api/agents").then((r) => r.json()).then(setAgents);
    fetch("/api/plans").then((r) => r.json()).then(setPlans);
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
    fetch("/api/gateway").then((r) => r.json()).then((gw: GatewayData & { activeAgentIds?: string[] }) => {
      setGateway(gw);
      // Sync agent statuses from gateway sessions - use activeAgentIds from server
      const activeIds = new Set(gw.activeAgentIds || []);
      const activeSessions = gw.sessions?.sessions || [];
      
      setAgents((prev) => {
        const updated = [...prev];
        for (const agent of updated) {
          // Check if agent has an active subagent session
          const isActive = activeIds.has(agent.id) ||
            activeSessions.some((s) => {
              const key = s.key || "";
              return key.includes(`:${agent.id}:`) && key.includes("subagent");
            });
          
          if (isActive) {
            agent.status = "active";
          } else if (agent.id === "rick") {
            // Rick (main) is always active if gateway is connected
            agent.status = gw.connected ? "active" : "idle";
          }
        }
        return updated;
      });
    }).catch(() => setGateway({ connected: false }));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const rick = agents.find((a) => a.id === "rick");
  const cSuite = agents.filter(
    (a) => !a.parent_id && a.id !== "rick" && ["cfo", "cmo", "cto", "coo", "cro", "chro", "clo"].includes(a.role)
  );
  const getChildren = (parentId: string) => agents.filter((a) => a.parent_id === parentId);

  const handleApprove = async (id: number) => {
    await fetch("/api/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    fetchData();
  };

  const handleDeny = async (id: number) => {
    await fetch("/api/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "denied" }),
    });
    fetchData();
  };

  const handleViewContent = async (filePath: string) => {
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_path: filePath }),
    });
    const data = await res.json();
    setViewingContent(data);
  };

  const handleGather = async () => {
    const res = await fetch("/api/inbox", { method: "POST" });
    const data = await res.json();
    setGatherMsg(data.message);
    setTimeout(() => setGatherMsg(""), 3000);
    fetchData();
  };

  const pendingCount = plans.filter((p) => p.status === "pending_approval").length;

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Gather all project tasks for the activity bar
  const allProjectTasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, projectName: p.name, projectColor: p.color, projectEmoji: p.emoji }))
  );
  const runningTasks = allProjectTasks.filter((t) => t.status === "running");
  const pendingTasks = allProjectTasks.filter((t) => t.status === "pending");
  const doneTasks = allProjectTasks.filter((t) => t.status === "done");

  // Layout: 5 columns, rick in center
  // Row 0: Morgan(0,0) Victoria(1,0) [gap] Ethan(3,0) Harper(4,0)
  // Row 1: Jordan(0,1) [gap] RICK(2,1) [gap] Avery(4,1)
  // Row 2: Quinn(0,2) Atlas(1,2) [gap] Kai(3,2) Nadia(4,2)

  return (
    <div className="min-h-screen flex">
      {/* Main office area */}
      <div className="flex-1 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <OpenClawLogo size={28} />
              <h1 className="text-lg font-bold text-[#4ade80]">ClawOps HQ</h1>
            </div>
            {/* Gateway connection status */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] ${
              gateway?.connected
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
            }`}>
              {gateway?.connected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {gateway?.connected ? "Gateway Connected" : "Gateway Offline"}
            </div>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
              {gateway?.sessions?.count || 0} sessions
            </span>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
              {agents.length} agents
            </span>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
              {plans.length} plans
            </span>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded animate-pulse">
                {pendingCount} pending approval
              </span>
            )}
            <button
              onClick={handleGather}
              className="flex items-center gap-1 text-[10px] bg-[#4ade80]/10 text-[#4ade80] px-2.5 py-1 rounded hover:bg-[#4ade80]/20 transition-colors"
            >
              <RefreshCw size={10} /> Gather All Work
            </button>
          </div>
        </div>

        {gatherMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-[10px] text-[#4ade80] bg-[#4ade80]/10 px-3 py-1.5 rounded"
          >
            {gatherMsg}
          </motion.div>
        )}

        {/* Office Grid */}
        <div className="grid grid-cols-5 gap-3 max-w-6xl mx-auto">
          {/* Row 0 */}
          {cSuite.slice(0, 2).map((agent) => (
            <OfficeBox
              key={agent.id}
              agent={agent}
              children={getChildren(agent.id)}
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          ))}
          <div /> {/* empty center-top */}
          {cSuite.slice(2, 4).map((agent) => (
            <OfficeBox
              key={agent.id}
              agent={agent}
              children={getChildren(agent.id)}
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          ))}

          {/* Row 1 */}
          {cSuite[4] && (
            <OfficeBox
              agent={cSuite[4]}
              children={getChildren(cSuite[4].id)}
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          )}
          <div /> {/* gap */}
          {rick && (
            <OfficeBox
              agent={rick}
              isRick
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          )}
          <div /> {/* gap */}
          {cSuite[5] && (
            <OfficeBox
              agent={cSuite[5]}
              children={getChildren(cSuite[5].id)}
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          )}

          {/* Row 2 */}
          {cSuite[6] && (
            <OfficeBox
              agent={cSuite[6]}
              children={getChildren(cSuite[6].id)}
              plans={plans}
              onOpenFolder={setSelectedAgent}
            />
          )}
          {/* Remaining specialist agents */}
          {agents
            .filter(
              (a) =>
                a.parent_id &&
                !cSuite.find((c) => c.id === a.id) &&
                a.id !== "rick"
            )
            .slice(0, 3)
            .map((agent) => (
              <OfficeBox
                key={agent.id}
                agent={agent}
                plans={plans}
                onOpenFolder={setSelectedAgent}
              />
            ))}
          <div /> {/* fill row */}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-80 border-l border-white/10 bg-[#0d1220] p-3 space-y-3 overflow-y-auto">

        {/* ===== PROJECTS ===== */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={12} /> Projects
        </h2>

        {projects.map((project) => {
          const isExpanded = expandedProjects.has(project.id);
          const taskStats = {
            running: project.tasks.filter((t) => t.status === "running").length,
            pending: project.tasks.filter((t) => t.status === "pending").length,
            done: project.tasks.filter((t) => t.status === "done").length,
          };

          return (
            <div key={project.id} className="border border-white/10 rounded-lg bg-[#111827] overflow-hidden">
              {/* Project header - always visible */}
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{project.emoji}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold" style={{ color: project.color }}>{project.name}</p>
                    <p className="text-[9px] text-gray-500">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] px-1 py-0.5 rounded ${
                    project.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {project.status}
                  </span>
                  {isExpanded ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
                </div>
              </button>

              {/* Quick stats bar - always visible */}
              <div className="flex items-center gap-2 px-2.5 pb-2 text-[9px]">
                <span className="flex items-center gap-0.5 text-green-400">
                  <DollarSign size={8} />${project.revenue.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-blue-400">
                  <Target size={8} />{project.leads} leads
                </span>
                <span className="flex items-center gap-0.5 text-gray-400">
                  {taskStats.done}/{taskStats.done + taskStats.pending + taskStats.running} tasks
                </span>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 p-2.5 space-y-2">
                      {/* Detail categories */}
                      {Object.entries(project.details).map(([category, items]) => {
                        const catKey = `${project.id}-${category}`;
                        const catExpanded = expandedCategories.has(catKey);
                        const categoryLabels: Record<string, string> = {
                          accounts: "🔗 Accounts & Links",
                          financials: "💰 Financials",
                          tools: "🛠️ Tools & Integrations",
                          content: "📝 Content",
                          legal: "⚖️ Legal",
                          overview: "📋 Overview",
                          products: "📦 Products",
                          status: "📊 Status",
                        };

                        return (
                          <div key={catKey}>
                            <button
                              onClick={() => toggleCategory(catKey)}
                              className="w-full flex items-center gap-1.5 text-left hover:bg-white/5 rounded px-1 py-0.5 transition-colors"
                            >
                              <ChevronRight
                                size={10}
                                className={`text-gray-600 transition-transform ${catExpanded ? "rotate-90" : ""}`}
                              />
                              <span className="text-[10px] font-medium text-gray-300">
                                {categoryLabels[category] || category}
                              </span>
                              <span className="text-[8px] text-gray-600">{items.length}</span>
                            </button>

                            <AnimatePresence>
                              {catExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 mt-1 space-y-0.5">
                                    {items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-start gap-2 py-0.5">
                                        <span className="text-[9px] text-gray-500 shrink-0">{item.label}</span>
                                        <span className="text-[9px] text-gray-300 text-right break-words min-w-0">{item.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Tasks inside project */}
                      {project.tasks.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleCategory(`${project.id}-tasks`)}
                            className="w-full flex items-center gap-1.5 text-left hover:bg-white/5 rounded px-1 py-0.5 transition-colors"
                          >
                            <ChevronRight
                              size={10}
                              className={`text-gray-600 transition-transform ${expandedCategories.has(`${project.id}-tasks`) ? "rotate-90" : ""}`}
                            />
                            <span className="text-[10px] font-medium text-gray-300">📋 Tasks</span>
                            <span className="text-[8px] text-gray-600">{project.tasks.length}</span>
                          </button>

                          <AnimatePresence>
                            {expandedCategories.has(`${project.id}-tasks`) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 mt-1 space-y-1">
                                  {project.tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        task.status === "running" ? "bg-blue-400 animate-pulse"
                                        : task.status === "done" ? "bg-green-400"
                                        : "bg-gray-600"
                                      }`} />
                                      <span className={`text-[9px] flex-1 ${
                                        task.status === "done" ? "text-gray-600 line-through" : "text-gray-400"
                                      }`}>
                                        {task.title}
                                      </span>
                                      {task.assigned_to && (
                                        <span className="text-[7px] text-gray-600 bg-white/5 px-1 rounded">
                                          {task.assigned_to}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Add Project button */}
        <button className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-500 border border-dashed border-white/10 rounded-lg py-2 hover:border-white/20 hover:text-gray-400 transition-colors">
          <Plus size={10} /> New Project
        </button>

        {/* ===== ACTIVITY BAR ===== */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10">
          <Activity size={12} /> Activity
        </h2>

        {/* Running tasks */}
        {runningTasks.length > 0 && (
          <div>
            <p className="text-[9px] text-blue-400 uppercase font-medium mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Running ({runningTasks.length})
            </p>
            <div className="space-y-1">
              {runningTasks.map((t) => (
                <div key={t.id} className="bg-blue-500/5 border border-blue-500/10 rounded px-2 py-1.5">
                  <p className="text-[9px] text-gray-300">{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px]" style={{ color: t.projectColor }}>{t.projectEmoji} {t.projectName}</span>
                    {t.assigned_to && <span className="text-[7px] text-gray-600">/ {t.assigned_to}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <p className="text-[9px] text-yellow-400 uppercase font-medium mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Pending ({pendingTasks.length})
            </p>
            <div className="space-y-1">
              {pendingTasks.slice(0, 6).map((t) => (
                <div key={t.id} className="bg-yellow-500/5 border border-yellow-500/10 rounded px-2 py-1.5">
                  <p className="text-[9px] text-gray-300">{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px]" style={{ color: t.projectColor }}>{t.projectEmoji} {t.projectName}</span>
                    {t.assigned_to && <span className="text-[7px] text-gray-600">/ {t.assigned_to}</span>}
                  </div>
                </div>
              ))}
              {pendingTasks.length > 6 && (
                <p className="text-[8px] text-gray-600 text-center">+{pendingTasks.length - 6} more</p>
              )}
            </div>
          </div>
        )}

        {/* Done tasks */}
        {doneTasks.length > 0 && (
          <div>
            <p className="text-[9px] text-green-400 uppercase font-medium mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Done ({doneTasks.length})
            </p>
            <div className="space-y-1">
              {doneTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="bg-green-500/5 border border-green-500/10 rounded px-2 py-1">
                  <p className="text-[9px] text-gray-500 line-through">{t.title}</p>
                  <span className="text-[8px]" style={{ color: t.projectColor }}>{t.projectEmoji} {t.projectName}</span>
                </div>
              ))}
              {doneTasks.length > 4 && (
                <p className="text-[8px] text-gray-600 text-center">+{doneTasks.length - 4} more</p>
              )}
            </div>
          </div>
        )}

        {/* ===== CHANNELS ===== */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 pt-3 border-t border-white/10">
          Channels
        </h2>

        {/* Gateway Status Panel */}
        <SidePanel
          title="OpenClaw Gateway"
          icon={<Activity size={14} />}
          color="#4ade80"
        >
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Status</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                gateway?.connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {gateway?.connected ? "Connected" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Sessions</span>
              <span className="text-[10px] text-gray-300">
                {gateway?.sessions?.count || 0} total
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Registered Agents</span>
              <span className="text-[10px] text-gray-300">
                {gateway?.agents?.agents?.length || 0}
              </span>
            </div>

            {/* Active Sessions */}
            {gateway?.sessions?.sessions && gateway.sessions.sessions.length > 0 && (
              <div className="mt-1">
                <p className="text-[9px] text-gray-500 uppercase mb-1">Recent Sessions</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {gateway.sessions.sessions
                    .filter((s) => {
                      if (!s.lastActivityMs) return false;
                      return Date.now() - s.lastActivityMs < 600000;
                    })
                    .slice(0, 8)
                    .map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5"
                      >
                        <span className="text-[9px] text-gray-400 truncate max-w-[120px]">
                          {s.displayName || s.agentId || s.key}
                        </span>
                        <span className="text-[8px] text-gray-600">
                          {s.lastActivityMs
                            ? `${Math.round((Date.now() - s.lastActivityMs) / 60000)}m ago`
                            : ""}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Cron Jobs */}
            {gateway?.cron?.jobs && gateway.cron.jobs.length > 0 && (
              <div className="mt-1">
                <p className="text-[9px] text-gray-500 uppercase mb-1">
                  <Clock size={8} className="inline mr-1" />
                  Scheduled Jobs
                </p>
                <div className="space-y-1">
                  {gateway.cron.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between bg-white/5 rounded px-1.5 py-0.5"
                    >
                      <span className="text-[9px] text-gray-400 truncate max-w-[120px]">
                        {job.name}
                      </span>
                      <span className={`text-[8px] px-1 py-0.5 rounded ${
                        job.enabled
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-700 text-gray-500"
                      }`}>
                        {job.enabled ? (
                          job.state?.nextRunAtMs
                            ? `in ${Math.max(0, Math.round((job.state.nextRunAtMs - Date.now()) / 60000))}m`
                            : "active"
                        ) : "off"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gateway?.timestamp && (
              <p className="text-[8px] text-gray-600 mt-1">
                Last sync: {new Date(gateway.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </SidePanel>

        <SidePanel
          title="Social Media / Marketing"
          icon={<Users size={14} />}
          color="#ec4899"
        >
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Reddit</span>
              <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Instagram</span>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                Paused
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">LinkedIn</span>
              <span className="text-[9px] bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">
                Not Connected
              </span>
            </div>
            <p className="text-[9px] text-gray-600 mt-1">
              Connect accounts to receive recommendations
            </p>
          </div>
        </SidePanel>

        <SidePanel title="Email / Outreach" icon={<Mail size={14} />} color="#f59e0b">
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Gmail</span>
              <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                Connected
              </span>
            </div>
            <p className="text-[10px] text-gray-400">rickclaw08@gmail.com</p>
            <div className="bg-white/5 rounded p-1.5 mt-1">
              <p className="text-[9px] text-gray-500">Today: 6 emails sent</p>
              <p className="text-[9px] text-gray-500">Replies: 0</p>
              <p className="text-[9px] text-gray-500">Open rate: pending</p>
            </div>
          </div>
        </SidePanel>

        <SidePanel
          title="Upwork / Fiverr Jobs"
          icon={<Briefcase size={14} />}
          color="#10b981"
        >
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Upwork</span>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                Pending Setup
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Fiverr</span>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                Pending Setup
              </span>
            </div>
            <p className="text-[9px] text-gray-600 mt-1">
              Link accounts to receive job recommendations and auto-proposals
            </p>
          </div>
        </SidePanel>

        {/* Quick Stats */}
        <div className="border border-white/10 rounded-lg bg-[#111827] p-2.5 mt-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Sprint Status</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Target</span>
              <span className="text-[10px] text-[#4ade80]">First Client by Wed Feb 26</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Revenue</span>
              <span className="text-[10px] text-gray-400">$0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Emails Sent</span>
              <span className="text-[10px] text-gray-400">6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Replies</span>
              <span className="text-[10px] text-gray-400">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Plans Ready</span>
              <span className="text-[10px] text-yellow-400">{pendingCount} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <PlanModal
            agent={selectedAgent}
            plans={plans}
            isRick={selectedAgent.id === "rick"}
            onClose={() => {
              setSelectedAgent(null);
              setViewingContent(null);
            }}
            onApprove={handleApprove}
            onDeny={handleDeny}
            onViewContent={handleViewContent}
            viewingContent={viewingContent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
