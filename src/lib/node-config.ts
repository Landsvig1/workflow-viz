import { NodeType } from "@/types/workflow";

export const NODE_CONFIG: Record<
  NodeType,
  {
    color: string;
    border: string;
    badge: string;
    icon: string;
    glow: string;
    accent: string;
    handleColor: string;
  }
> = {
  trigger: {
    color: "bg-violet-950/60",
    border: "border-violet-500/60",
    badge: "bg-violet-500/20 text-violet-300",
    icon: "⚡",
    glow: "0 0 30px rgba(139,92,246,0.35), 0 0 60px rgba(139,92,246,0.15)",
    accent: "#8b5cf6",
    handleColor: "#8b5cf6",
  },
  llm: {
    color: "bg-blue-950/60",
    border: "border-blue-500/60",
    badge: "bg-blue-500/20 text-blue-300",
    icon: "🧠",
    glow: "0 0 30px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.15)",
    accent: "#3b82f6",
    handleColor: "#3b82f6",
  },
  api: {
    color: "bg-emerald-950/60",
    border: "border-emerald-500/60",
    badge: "bg-emerald-500/20 text-emerald-300",
    icon: "🔌",
    glow: "0 0 30px rgba(16,185,129,0.35), 0 0 60px rgba(16,185,129,0.15)",
    accent: "#10b981",
    handleColor: "#10b981",
  },
  erp: {
    color: "bg-orange-950/60",
    border: "border-orange-500/60",
    badge: "bg-orange-500/20 text-orange-300",
    icon: "🏢",
    glow: "0 0 30px rgba(249,115,22,0.35), 0 0 60px rgba(249,115,22,0.15)",
    accent: "#f97316",
    handleColor: "#f97316",
  },
  condition: {
    color: "bg-amber-950/60",
    border: "border-amber-500/60",
    badge: "bg-amber-500/20 text-amber-300",
    icon: "🔀",
    glow: "0 0 30px rgba(245,158,11,0.35), 0 0 60px rgba(245,158,11,0.15)",
    accent: "#f59e0b",
    handleColor: "#f59e0b",
  },
  action: {
    color: "bg-rose-950/60",
    border: "border-rose-500/60",
    badge: "bg-rose-500/20 text-rose-300",
    icon: "📤",
    glow: "0 0 30px rgba(244,63,94,0.35), 0 0 60px rgba(244,63,94,0.15)",
    accent: "#f43f5e",
    handleColor: "#f43f5e",
  },
  human: {
    color: "bg-slate-800/60",
    border: "border-slate-400/50",
    badge: "bg-slate-500/20 text-slate-300",
    icon: "👤",
    glow: "0 0 30px rgba(148,163,184,0.25), 0 0 60px rgba(148,163,184,0.1)",
    accent: "#94a3b8",
    handleColor: "#94a3b8",
  },
  transform: {
    color: "bg-cyan-950/60",
    border: "border-cyan-500/60",
    badge: "bg-cyan-500/20 text-cyan-300",
    icon: "⚙️",
    glow: "0 0 30px rgba(6,182,212,0.35), 0 0 60px rgba(6,182,212,0.15)",
    accent: "#06b6d4",
    handleColor: "#06b6d4",
  },
  webhook: {
    color: "bg-purple-950/60",
    border: "border-purple-500/60",
    badge: "bg-purple-500/20 text-purple-300",
    icon: "🪝",
    glow: "0 0 30px rgba(168,85,247,0.35), 0 0 60px rgba(168,85,247,0.15)",
    accent: "#a855f7",
    handleColor: "#a855f7",
  },
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  trigger: "Trigger",
  llm: "AI / LLM",
  api: "API",
  erp: "ERP / System",
  condition: "Condition",
  action: "Action",
  human: "Human",
  transform: "Transform",
  webhook: "Webhook",
};

export const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales",
  finance: "Finance",
  "customer-support": "Customer Support",
  operations: "Operations",
  hr: "HR",
  marketing: "Marketing",
};

export const CATEGORY_COLORS: Record<string, string> = {
  sales: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  finance: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "customer-support": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  operations: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  hr: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  marketing: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};

export const COMPLEXITY_COLORS: Record<string, string> = {
  simple: "text-emerald-400",
  medium: "text-amber-400",
  complex: "text-rose-400",
};
