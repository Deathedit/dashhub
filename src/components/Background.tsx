import { useRef, useEffect } from "react";
import type { AnimatedBg } from "@/types";
import { text } from "@/text";

const BG_OPTIONS: { value: AnimatedBg; label: string }[] = [
  { value: "none", label: text.settings.bgNone },
  { value: "matrix", label: text.settings.bgMatrix },
];

const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";
const FRAME_MS = 65;

interface Drop {
  y: number;
  speed: number;
}

function makeDrop(maxRow: number): Drop {
  return {
    y: Math.random() * maxRow - 30,
    speed: 0.3 + Math.random() * 0.5,
  };
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 14;
    let columns = 0;
    let drops: Drop[][] = [];

    function initDrops(numCols: number) {
      const maxRow = Math.max(1, canvas!.height / fontSize);
      columns = numCols;
      drops = Array.from({ length: columns }, () => {
        const count = 2 + Math.floor(Math.random() * 2);
        return Array.from({ length: count }, () => makeDrop(maxRow));
      });
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const numCols = Math.floor(canvas.width / fontSize);
      if (numCols !== columns) {
        initDrops(numCols);
      }
    }

    function draw() {
      if (!ctx || !canvas) return;
      const maxRow = canvas.height / fontSize + 50 / fontSize;

      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let col = 0; col < drops.length; col++) {
        for (let d = drops[col].length - 1; d >= 0; d--) {
          const drop = drops[col][d];
          const yPx = drop.y * fontSize;
          const xPx = col * fontSize;

          ctx.fillStyle = "#3b82f6";
          ctx.globalAlpha = 0.3;
          ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], xPx, yPx);

          const headY = (drop.y + 1) * fontSize;
          if (headY < canvas.height && headY > 0) {
            ctx.fillStyle = "#93c5fd";
            ctx.globalAlpha = 0.6;
            ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], xPx, headY);
          }

          ctx.globalAlpha = 1;

          drop.y += drop.speed;

          if (drop.y * fontSize > canvas.height + 50) {
            drops[col][d] = makeDrop(maxRow);
          }
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let animId: number;
    let lastFrame = 0;
    function loop(now: number) {
      animId = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      draw();
    }
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-animated-matrix" aria-hidden="true" />;
}

export default function Background({ variant }: { variant: AnimatedBg }) {
  if (variant === "matrix") {
    return <MatrixRain />;
  }

  return null;
}

export { BG_OPTIONS };