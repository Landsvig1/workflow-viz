"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkflowCategory } from "@/types/workflow";
import { CATEGORY_LABELS } from "@/lib/node-config";
import clsx from "clsx";

export interface RailItem {
  id: string;
  title: string;
  category: WorkflowCategory;
}

const STORAGE_KEY = "wv-rail-collapsed";

function groupByCategory(items: RailItem[]) {
  const groups: { category: WorkflowCategory; items: RailItem[] }[] = [];
  for (const item of items) {
    let g = groups.find((x) => x.category === item.category);
    if (!g) {
      g = { category: item.category, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

/**
 * Slim, collapsible navigation rail. The only way to move between workflows.
 * Active item is derived from the URL (treating "/" as the featured workflow).
 * Collapse state is persisted to localStorage, read after mount to avoid a
 * hydration mismatch (default expanded on both server and first client render).
 */
export function Rail({
  items,
  featuredId,
}: {
  items: RailItem[];
  featuredId: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const match = pathname?.match(/^\/workflow\/(.+)$/);
  const activeId = match ? match[1] : pathname === "/" ? featuredId : null;
  const groups = groupByCategory(items);

  return (
    <aside
      className={clsx(
        "shrink-0 h-full border-r border-white/6 bg-[#050510]/80 backdrop-blur-xl flex flex-col transition-[width] duration-200",
        collapsed ? "w-12" : "w-60"
      )}
    >
      <div className="flex items-center justify-between h-12 px-3 border-b border-white/6 shrink-0">
        {!collapsed && (
          <Link
            href="/"
            className="text-white/80 font-semibold text-[13px] tracking-tight truncate"
          >
            Workflow Viz
          </Link>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Udvid menu" : "Skjul menu"}
          className="text-white/40 hover:text-white/80 transition-colors w-6 h-6 rounded-md hover:bg-white/8 shrink-0"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {!collapsed && (
        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map((g) => (
            <div key={g.category} className="mb-3">
              <p className="px-3 mb-1 text-[9px] uppercase tracking-widest text-white/25 font-semibold">
                {CATEGORY_LABELS[g.category]}
              </p>
              {g.items.map((item) => {
                const active = item.id === activeId;
                const href = item.id === featuredId ? "/" : `/workflow/${item.id}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "block px-3 py-1.5 text-[12px] truncate transition-colors border-l-2",
                      active
                        ? "bg-white/8 text-white border-violet-400"
                        : "text-white/45 hover:text-white/80 hover:bg-white/4 border-transparent"
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      )}

      {collapsed && <div className="flex-1" />}

      <div className="border-t border-white/6 p-2 shrink-0">
        <Link
          href="/import"
          className={clsx(
            "block text-[12px] text-white/40 hover:text-white/80 transition-colors",
            collapsed ? "text-center" : "px-1"
          )}
        >
          {collapsed ? "↘" : "Importér JSON"}
        </Link>
      </div>
    </aside>
  );
}
