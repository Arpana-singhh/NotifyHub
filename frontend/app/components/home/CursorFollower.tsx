'use client';

import { useEffect, useRef } from 'react';

export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip on touch devices and for users who prefer reduced motion
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!visible) {
        visible = true;
        x = targetX;
        y = targetY;
        el.classList.add('is-visible');
      }

      // Grow the ring over interactive elements
      const target = e.target as HTMLElement;
      el.classList.toggle('is-active', !!target.closest('a, button'));

      // Nearest data-section wins: "dark" → white dot, "light" (or none) → primary dot
      const zone = target.closest('[data-section]') as HTMLElement | null;
      el.classList.toggle('is-dark', zone?.dataset.section === 'dark');
    };

    const onLeave = () => {
      visible = false;
      el.classList.remove('is-visible');
    };

    const tick = () => {
      // Lerp towards the pointer for a smooth trailing effect
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-follower" aria-hidden="true">
      <span className="cursor-follower__ring" />
    </div>
  );
}
