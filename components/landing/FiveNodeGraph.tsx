'use client';

// The five-node architecture map — the www landing's thesis made visible:
// Prism ↓ Nexus ↓ Atlas + AlphaLens ↓ Future Products, each node inked in its
// own pack, peach reserved for Future Products (the five-pack law: peach
// appears nowhere else on the page).
//
// A client component because the inks are mode-selected: the chrome flips
// prism-blue-dark ⇄ prism-blue-light at runtime (ADR-0006), and graph inks
// captured at mount would keep drawing dark-mode ink on a light page. The
// mode comes from `usePrismThemeMode()` — the context re-renders this tree
// after the class swap, so every fill/stroke re-derives from the current
// mode with no observer and no stale read.
//
// Edges carry a dash-flow animation (constant motion → linear timing) unless
// reduced motion asks for the settled drawing (landing.css gates it).
import type { ReactElement } from 'react';

import { usePrismThemeMode } from '@nanisoft/prism-ui/provider';
import { prismBrandPacks, type PrismPackId } from '@nanisoft/prism-tokens';

interface NodeSpec {
  id: string;
  name: string;
  role: string;
  pack: PrismPackId | null; // null → Future Products: peach hairline, no fill
  x: number;
  y: number;
  dashed?: boolean;
}

// viewBox 0 0 760 470 — Prism feeds Nexus; Nexus builds Atlas and AlphaLens;
// both products point at what the factory builds next.
const NODES: NodeSpec[] = [
  { id: 'prism', name: 'Prism', role: 'the shared language', pack: 'blue', x: 380, y: 62 },
  { id: 'nexus', name: 'Nexus', role: 'the engine', pack: 'lavender', x: 380, y: 196 },
  { id: 'atlas', name: 'Atlas', role: 'digital twins', pack: 'green', x: 205, y: 330 },
  { id: 'alphalens', name: 'AlphaLens', role: 'market research', pack: 'rose', x: 555, y: 330 },
  { id: 'future', name: 'Future Products', role: 'built next', pack: null, x: 380, y: 442, dashed: true },
];

const EDGES: Array<[string, string]> = [
  ['prism', 'nexus'],
  ['nexus', 'atlas'],
  ['nexus', 'alphalens'],
  ['atlas', 'future'],
  ['alphalens', 'future'],
];

const NODE_W = 168;
const NODE_H = 46;

function nodeMid(id: string): NodeSpec {
  return NODES.find((node) => node.id === id)!;
}

function edgePath(from: NodeSpec, to: NodeSpec): string {
  // Vertical-ish edges bow slightly toward the center line so the fan-out
  // from Nexus reads as one beam splitting, not two rigid diagonals.
  const midX = (from.x + to.x) / 2;
  const bend = from.id === 'nexus' || to.id === 'nexus' ? midX * 0.12 + from.x * 0.88 : midX;
  return `M ${from.x} ${from.y + NODE_H / 2} C ${bend} ${from.y + NODE_H / 2 + 40}, ${bend} ${to.y - NODE_H / 2 - 40}, ${to.x} ${to.y - NODE_H / 2}`;
}

export function FiveNodeGraph({ ariaLabel }: { ariaLabel: string }): ReactElement {
  const { mode } = usePrismThemeMode();

  return (
    <svg viewBox="0 0 760 470" className="www-graph www-graph--flow" role="img" aria-label={ariaLabel}>
      {EDGES.map(([fromId, toId]) => {
        const from = nodeMid(fromId);
        const to = nodeMid(toId);
        const d = edgePath(from, to);
        // The edge carries its source's pack ink — the beam visibly splits.
        const flow = prismBrandPacks[from.pack ?? 'peach'].ink[mode];
        return (
          <g key={`${fromId}-${toId}`}>
            <path d={d} fill="none" stroke="var(--prism-color-border-secondary)" strokeWidth="1" />
            <path d={d} fill="none" stroke={flow} strokeWidth="1.5" className="www-graph__flow" opacity={0.5} />
          </g>
        );
      })}

      {NODES.map((node) => {
        const pack = prismBrandPacks[node.pack ?? 'peach'];
        const stroke = pack.ink[mode];
        return (
          <g key={node.id} transform={`translate(${node.x - NODE_W / 2}, ${node.y - NODE_H / 2})`}>
            <rect
              width={NODE_W}
              height={NODE_H}
              rx={4}
              fill={node.pack ? pack.ground[mode] : 'transparent'}
              stroke={stroke}
              strokeOpacity={node.pack ? 0.55 : 0.7}
              strokeDasharray={node.dashed ? '4 4' : undefined}
            />
            <text x={14} y={20} className="www-graph__name" fill="currentColor">
              {node.name}
            </text>
            <text x={14} y={34} className="www-graph__role" fill="currentColor" opacity={0.6}>
              {node.role}
            </text>
            <circle cx={NODE_W - 16} cy={NODE_H / 2} r={4} fill={stroke} />
          </g>
        );
      })}
    </svg>
  );
}
