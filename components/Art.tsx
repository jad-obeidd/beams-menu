import { Children, cloneElement } from "react";
import type { Art as ArtName } from "@/lib/menu";

// Loose, hand-drawn line drawings in the spirit of the illustrations on Beams' printed menu.
// Every stroke uses pathLength=1 so CSS can "draw" it in when it scrolls into view.

const drawings: Record<ArtName, React.ReactNode> = {
  cup: (
    <>
      <path d="M14 30c-.4 9 .6 17 3 22 2 4 6 6 12 6h8c6 0 10-2 12-6 2.4-5 3.3-13 3-22z" />
      <path d="M52 34c6-1 10 1 10 6s-4 8-10 8" />
      <path d="M10 62c14 3 34 3 50 0" />
      <path d="M26 22c-3-4 3-6 0-11M35 22c-3-4 3-6 0-11M44 22c-3-4 3-6 0-11" />
    </>
  ),
  dripper: (
    <>
      <path d="M12 16h48l-15 24H27z" />
      <path d="M8 16h56" />
      <path d="M27 40h18v5H27z" />
      <path d="M22 45c-1 6 0 12 2 15h24c2-3 3-9 2-15z" />
      <path d="M36 4c-2 3 2 5 0 8" />
      <path d="M33 52c2 1 4 1 6 0" />
    </>
  ),
  iced: (
    <>
      <path d="M18 18l5 44h26l5-44z" />
      <path d="M15 18h42" />
      <path d="M44 18l6-14h6" />
      <path d="M25 30l7-2 2 7-7 2zM36 40l7-2 2 7-7 2zM27 46l6-1 1 6-6 1z" />
      <path d="M20 34c10 2 22 2 32-1" />
    </>
  ),
  blender: (
    <>
      <path d="M20 20c0 0 1 30 4 42h24c3-12 4-42 4-42" />
      <path d="M16 20h40" />
      <path d="M22 20c0-6 4-10 14-10s14 4 14 10" />
      <path d="M36 10V4M42 4l4-2" />
      <path d="M23 34c4 3 8-3 13 0s9-3 13 0" />
    </>
  ),
  bottle: (
    <>
      <path d="M29 4h14v8H29z" />
      <path d="M30 12c0 6-8 8-8 18v28c0 3 2 4 4 4h20c2 0 4-1 4-4V30c0-10-8-12-8-18" />
      <path d="M22 34h28M22 48h28" />
      <path d="M31 40c2-1 4 1 6 0s4-1 5 0" />
    </>
  ),
  croissant: (
    <>
      <path d="M6 46c4-14 16-24 30-24s26 10 30 24c-6-4-10-5-14-4-4-8-10-11-16-11s-12 3-16 11c-4-1-8 0-14 4z" />
      <path d="M22 42c2-7 6-11 14-11M50 42c-2-7-6-11-14-11" />
      <path d="M36 31v20" />
      <path d="M10 56c16 4 36 4 52 0" />
    </>
  ),
  cookie: (
    <>
      <path d="M36 8c15 0 27 12 27 27S51 62 36 62 9 50 9 35c0-9 5-17 12-22 1 4 4 6 8 5 0-5 3-9 7-10z" />
      <circle cx="28" cy="32" r="2.5" />
      <circle cx="44" cy="28" r="2.5" />
      <circle cx="40" cy="46" r="2.5" />
      <circle cx="24" cy="46" r="2" />
      <circle cx="50" cy="42" r="2" />
    </>
  ),
  sandwich: (
    <>
      <path d="M8 40L36 14l28 26z" />
      <path d="M8 40c2 3 6 3 8 0s6-3 8 0 6 3 8 0 6-3 8 0 6 3 8 0 6-3 8 0 6 3 8 0" />
      <path d="M8 46h56v6H8z" />
      <path d="M22 30c4 1 8-1 10-3M40 26c4 2 8 2 12 0" />
    </>
  ),
};

type Shape = React.ReactElement<{ pathLength?: number }>;

export const Art = ({ name, className = "" }: { name: ArtName; className?: string }) => {
  const shapes = Children.map((drawings[name] as React.ReactElement<{ children: Shape[] }>).props.children, (shape) =>
    cloneElement(shape, { pathLength: 1 }),
  );
  return (
    <svg
      className={`art ${className}`}
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes}
    </svg>
  );
};
