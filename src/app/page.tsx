import { workflows } from "@/data";
import { WorkflowCard } from "@/components/WorkflowCard";
import { NODE_CONFIG, NODE_TYPE_LABELS } from "@/lib/node-config";
import { NodeType } from "@/types/workflow";

export default function HomePage() {
  const totalNodes = workflows.reduce((sum, w) => sum + w.nodes.length, 0);
  const totalEdges = workflows.reduce((sum, w) => sum + w.edges.length, 0);

  const allNodeTypes = workflows
    .flatMap((w) => w.nodes)
    .reduce(
      (acc, node) => {
        acc[node.data.type] = (acc[node.data.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  return (
    <main className="min-h-screen bg-[#03030a] bg-grid">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-0 w-[500px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[400px] bg-cyan-600/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/2 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-violet-300/80 bg-violet-500/8 border border-violet-500/15 rounded-full px-4 py-1.5 mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            AI Automation Workflows
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Workflow
            <br />
            <span className="gradient-text">Visualizer</span>
          </h1>
          <p className="text-white/35 text-xl max-w-xl leading-relaxed font-light">
            Interaktive node-grafer over AI automation workflows. Klik på et
            workflow for at udforske arkitekturen.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { label: "Workflows", value: workflows.length, color: "#a78bfa" },
            { label: "Noder total", value: totalNodes, color: "#38bdf8" },
            { label: "Forbindelser", value: totalEdges, color: "#34d399" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="stat-card relative bg-white/[0.03] border border-white/8 rounded-2xl px-6 py-6 text-center overflow-hidden transition-all duration-300"
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}60, transparent)` }}
              />
              <div
                className="text-3xl font-bold mb-1.5"
                style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/30 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-12">
          {(Object.keys(NODE_CONFIG) as NodeType[]).map((type) => {
            const config = NODE_CONFIG[type];
            const count = allNodeTypes[type] || 0;
            if (count === 0) return null;
            return (
              <span
                key={type}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-opacity ${config.badge}`}
              >
                {config.icon} {NODE_TYPE_LABELS[type]}
                <span className="opacity-50 ml-1">({count})</span>
              </span>
            );
          })}
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </div>
    </main>
  );
}
