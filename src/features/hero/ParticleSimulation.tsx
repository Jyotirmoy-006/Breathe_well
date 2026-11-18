/**
 * @file ParticleSimulation.tsx
 * @description HTML5 canvas PM2.5 particle density simulation with motion reduction and visibility gating.
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface ParticleSimulationProps {
  readonly pm25: number;
  readonly className?: string;
}

function initParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.3 + 0.1,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.2,
    });
  }
  return particles;
}

function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(160, 140, 120, 0.5)';
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y > h) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Canvas particle simulator displaying floating particulate matter suspended in air.
 */
export function ParticleSimulation({
  pm25,
  className = '',
}: ParticleSimulationProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);
    const count = Math.min(100, Math.max(15, Math.floor(pm25 / 3.5)));
    const particles = initParticles(count, width, height);
    let animId = 0;

    const render = (): void => {
      if (isVisibleRef.current && document.visibilityState !== 'hidden') {
        updateAndDrawParticles(ctx, particles, width, height);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisibleRef.current = entry?.isIntersecting ?? false;
      });
      observer.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(animId);
      observer?.disconnect();
    };
  }, [pm25]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
