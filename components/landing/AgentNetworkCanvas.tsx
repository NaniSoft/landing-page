'use client';

// The hero's atmosphere (ticket 04's locked design): worker agents — each
// wearing one of the five pack inks — drifting around a central orchestration
// hub, hairline links, packets constantly traveling worker → hub → out. It is
// deliberately sparse and dim: the network is backdrop, and the display type
// carries the hero.
//
// Production laws inherited from the product sites' build tickets (ticket 13):
// - Theming via `usePrismThemeMode()` context — the effect is keyed on `mode`,
//   so a toggle re-renders and re-reads the palette after the class swap.
//   Never a MutationObserver token read: Chromium recalculates style only
//   after the callback, so a token read inside it returns the OUTGOING theme
//   (ticket 11 proved it by pixel-sampling).
// - Colours are token- or pack-driven, never raw hex: links come from
//   `--prism-color-border-secondary` (the prototype's hardcoded white link
//   vanishes on a light ground), worker dots from the pack's ink for the
//   *current* mode.
// - The host's size is definite (the hero's absolute-inset layer), measured
//   through a ResizeObserver; resizing redraws so the reduced-motion settled
//   frame survives.
// - Reduced motion draws one settled, fully-formed network and stops; the
//   ambient loop pauses while the tab is hidden.
import { useEffect, useRef, type ReactElement } from 'react';

import { usePrismThemeMode } from '@nanisoft/prism-ui/provider';
import { prismBrandPacks, type PrismMode, type PrismPackId } from '@nanisoft/prism-tokens';

const PACKS: PrismPackId[] = ['blue', 'green', 'lavender', 'rose', 'peach'];

/** The hub is the orchestration core — Nexus's ink. */
const HUB_PACK: PrismPackId = 'lavender';

const WORKER_COUNT = 14;
const PACKET_COUNT = 5;

interface Worker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pack: PrismPackId;
}

interface Packet {
  from: Worker;
  t: number;
  speed: number;
  phase: 'in' | 'out';
}

/** Hairline link colour from the pre-baked rulesets — token-driven. */
function readHairline(host: HTMLElement): string {
  return (
    getComputedStyle(host).getPropertyValue('--prism-color-border-secondary').trim() ||
    'rgba(127,127,127,0.35)'
  );
}

export function AgentNetworkCanvas(): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Mode-keyed: mode-only theming (ADR-0006) means mode is the only thing
  // that can change the palette, so keying the effect on it re-reads the
  // hairline token and the mode-correct pack inks after a toggle.
  const { mode } = usePrismThemeMode();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hairline = readHairline(host);
    const ink = (pack: PrismPackId, m: PrismMode): string => prismBrandPacks[pack].ink[m];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const workers: Worker[] = [];
    const packets: Packet[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const measure = (): void => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (): Worker => ({
      x: width * (0.12 + Math.random() * 0.76),
      y: height * (0.12 + Math.random() * 0.76),
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      pack: PACKS[Math.floor(Math.random() * PACKS.length)]!,
    });

    // Size before spawning — spawn positions are fractions of the canvas box.
    measure();
    for (let i = 0; i < WORKER_COUNT; i += 1) workers.push(spawn());

    const draw = (): void => {
      const hub = { x: width / 2, y: height / 2 };
      const hubInk = ink(HUB_PACK, mode);
      ctx.clearRect(0, 0, width, height);

      // Hub — the orchestration core, ringed.
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = hubInk;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = hubInk;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Workers + hairline links to the hub.
      for (const worker of workers) {
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = hairline;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(worker.x, worker.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.stroke();

        ctx.globalAlpha = 0.55;
        ctx.fillStyle = ink(worker.pack, mode);
        ctx.beginPath();
        ctx.arc(worker.x, worker.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Packets: worker → hub, then back out to another worker.
      for (const packet of packets) {
        const target = packet.phase === 'in' ? packet.from : workers[Math.floor(Math.random() * workers.length)]!;
        const from = packet.phase === 'in' ? packet.from : hub;
        const x = from.x + (target.x - from.x) * packet.t;
        const y = from.y + (target.y - from.y) * packet.t;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = ink(packet.from.pack, mode);
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = (): void => {
      for (const worker of workers) {
        worker.x += worker.vx;
        worker.y += worker.vy;
        if (worker.x < width * 0.06 || worker.x > width * 0.94) worker.vx *= -1;
        if (worker.y < height * 0.06 || worker.y > height * 0.94) worker.vy *= -1;
      }
      for (const packet of packets) {
        packet.t += packet.speed;
        if (packet.t >= 1) {
          packet.t = 0;
          if (packet.phase === 'in') packet.phase = 'out';
          else packet.from = workers[Math.floor(Math.random() * workers.length)]!;
        }
      }
      while (packets.length < PACKET_COUNT) {
        packets.push({
          from: workers[Math.floor(Math.random() * workers.length)]!,
          t: Math.random(),
          speed: 0.006 + Math.random() * 0.008,
          phase: 'in',
        });
      }
      draw();
      if (running) raf = requestAnimationFrame(step);
    };

    const resize = (): void => {
      measure();
      // Resizing clears the canvas — redraw so the reduced-motion settled
      // frame (drawn once, no loop behind it) survives the observer's
      // initial callback.
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    if (reduced) {
      // One settled frame: the network fully formed, mid-conversation.
      while (packets.length < PACKET_COUNT) {
        packets.push({
          from: workers[Math.floor(Math.random() * workers.length)]!,
          t: Math.random(),
          speed: 0,
          phase: 'in',
        });
      }
      draw();
    } else if (document.hidden) {
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }

    // The ambient loop pauses while the tab is hidden (nexus's polish —
    // a background canvas burns the battery for nobody).
    const onVisibility = (): void => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(step);
    };
    if (!reduced) document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (!reduced) document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [mode]);

  return (
    <div className="www-net" ref={hostRef} role="img" aria-hidden>
      <canvas ref={canvasRef} className="www-net__canvas" />
    </div>
  );
}
