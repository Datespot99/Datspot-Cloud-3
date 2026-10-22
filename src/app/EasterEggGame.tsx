import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, RotateCcw } from 'lucide-react';

const B1 = '#FF6A1F';
const B2 = '#E5520C';
const ACCENT = '#111111';
const HERO_GRAD = `linear-gradient(135deg, ${B1} 0%, ${B2} 100%)`;

// ─── Game constants ─────────────────────────────────────────────────────────
const GROUND_Y_RATIO = 0.78;   // ground line as fraction of canvas height
const PLAYER_SIZE = 34;
const GRAVITY = 0.0022;
const JUMP_VELOCITY = -0.72;
const BASE_SPEED = 0.32;       // px/ms
const SPEED_RAMP = 0.000006;   // speed increase per ms survived
const OBSTACLE_MIN_GAP = 900;  // ms
const OBSTACLE_MAX_GAP = 1700;
const HEART_MIN_GAP = 1400;
const HEART_MAX_GAP = 2600;

type Entity = { x: number; y: number; w: number; h: number; kind: 'flag' | 'heart'; caught?: boolean };

function loadHighScore() {
  try { return Number(localStorage.getItem('ds_game_high') ?? 0); } catch { return 0; }
}
function saveHighScore(v: number) {
  try { localStorage.setItem('ds_game_high', String(v)); } catch {}
}

export default function EasterEggGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    running: false,
    startedAt: 0,
    lastTs: 0,
    playerY: 0,
    velocity: 0,
    jumping: false,
    obstacles: [] as Entity[],
    nextObstacleAt: 0,
    nextHeartAt: 0,
    score: 0,
    hearts: 0,
    dead: false,
  });
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [heartsCollected, setHeartsCollected] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore());

  const dims = { w: 340, h: 220 };

  const resetGame = () => {
    const s = stateRef.current;
    s.running = false;
    s.startedAt = 0;
    s.lastTs = 0;
    s.playerY = 0;
    s.velocity = 0;
    s.jumping = false;
    s.obstacles = [];
    s.nextObstacleAt = 500;
    s.nextHeartAt = 1200;
    s.score = 0;
    s.hearts = 0;
    s.dead = false;
    setScore(0);
    setHeartsCollected(0);
    setPhase('ready');
  };

  const startGame = () => {
    const s = stateRef.current;
    resetGame();
    s.running = true;
    setPhase('playing');
  };

  const jump = () => {
    const s = stateRef.current;
    if (phase === 'ready') { startGame(); return; }
    if (phase === 'over') { startGame(); return; }
    if (!s.jumping) {
      s.jumping = true;
      s.velocity = JUMP_VELOCITY;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    const groundY = dims.h * GROUND_Y_RATIO;

    const drawFlag = (x: number, y: number, w: number, h: number) => {
      ctx.save();
      ctx.strokeStyle = '#8B8FA3';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h * 0.28);
      ctx.lineTo(x, y + h * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (x: number, y: number, size: number, pulse: number) => {
      ctx.save();
      const s = size * (1 + Math.sin(pulse) * 0.06);
      ctx.translate(x, y);
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      const topCurveHeight = s * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, topCurveHeight);
      ctx.bezierCurveTo(-s / 2, s * 0.65, 0, s * 0.85, 0, s);
      ctx.bezierCurveTo(0, s * 0.85, s / 2, s * 0.65, s / 2, topCurveHeight);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPlayer = (x: number, y: number, pulse: number) => {
      ctx.save();
      ctx.translate(x, y);
      const s = PLAYER_SIZE * (1 + Math.sin(pulse * 2) * 0.03);
      ctx.fillStyle = B1;
      ctx.shadowColor = `${B1}80`;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const topCurveHeight = s * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, topCurveHeight);
      ctx.bezierCurveTo(-s / 2, s * 0.65, 0, s * 0.85, 0, s);
      ctx.bezierCurveTo(0, s * 0.85, s / 2, s * 0.65, s / 2, topCurveHeight);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const loop = (ts: number) => {
      const s = stateRef.current;
      if (!s.startedAt) s.startedAt = ts;
      if (!s.lastTs) s.lastTs = ts;
      const dt = Math.min(ts - s.lastTs, 40);
      s.lastTs = ts;
      const elapsed = ts - s.startedAt;
      const speed = BASE_SPEED + elapsed * SPEED_RAMP;

      // clear
      ctx.clearRect(0, 0, dims.w, dims.h);

      // ground
      ctx.strokeStyle = 'rgba(122,136,170,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(dims.w, groundY);
      ctx.stroke();

      if (s.running && !s.dead) {
        // physics
        s.velocity += GRAVITY * dt;
        s.playerY += s.velocity * dt;
        if (s.playerY > 0) { s.playerY = 0; s.velocity = 0; s.jumping = false; }

        // spawn
        if (elapsed > s.nextObstacleAt) {
          s.obstacles.push({ x: dims.w + 10, y: groundY, w: 16, h: 28, kind: 'flag' });
          s.nextObstacleAt = elapsed + OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
        }
        if (elapsed > s.nextHeartAt) {
          const hy = groundY - 60 - Math.random() * 30;
          s.obstacles.push({ x: dims.w + 10, y: hy, w: 20, h: 20, kind: 'heart' });
          s.nextHeartAt = elapsed + HEART_MIN_GAP + Math.random() * (HEART_MAX_GAP - HEART_MIN_GAP);
        }

        // move + collide
        const playerX = 46;
        const playerTop = groundY - PLAYER_SIZE + s.playerY;
        const playerBox = { x: playerX - PLAYER_SIZE / 2, y: playerTop, w: PLAYER_SIZE, h: PLAYER_SIZE };

        for (const o of s.obstacles) {
          o.x -= speed * dt;
          if (o.kind === 'flag') {
            const box = { x: o.x, y: o.y - o.h, w: o.w, h: o.h };
            const hit = playerBox.x < box.x + box.w && playerBox.x + playerBox.w * 0.6 > box.x &&
                        playerBox.y + playerBox.h > box.y + 4;
            if (hit) { s.dead = true; }
          } else if (o.kind === 'heart' && !o.caught) {
            const box = { x: o.x - o.w / 2, y: o.y - o.h / 2, w: o.w, h: o.h };
            const hit = playerBox.x < box.x + box.w && playerBox.x + playerBox.w > box.x &&
                        playerBox.y < box.y + box.h && playerBox.y + playerBox.h > box.y;
            if (hit) { o.caught = true; s.hearts += 1; s.score += 25; }
          }
        }
        s.obstacles = s.obstacles.filter(o => o.x > -40 && !o.caught);
        s.score += dt * 0.01;

        if (s.dead) {
          s.running = false;
          const finalScore = Math.floor(s.score);
          setScore(finalScore);
          setHeartsCollected(s.hearts);
          if (finalScore > highScore) { setHighScore(finalScore); saveHighScore(finalScore); }
          setPhase('over');
        }
      }

      // draw obstacles
      for (const o of s.obstacles) {
        if (o.kind === 'flag') drawFlag(o.x, o.y - o.h, o.w, o.h);
        else if (!o.caught) drawHeart(o.x, o.y, o.w, ts * 0.005 + o.x);
      }

      // draw player
      const playerTop = groundY - PLAYER_SIZE + s.playerY;
      drawPlayer(46, playerTop, ts * 0.003);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#111111', border: `2px solid ${B1}` }}>

        <div className="h-[3px]" style={{ background: HERO_GRAD }} />

        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="w-4 h-4 text-white/80" />
        </button>

        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: HERO_GRAD }}>
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-white leading-none">Flag Dodger</div>
            <div className="text-[10px] mt-0.5 font-medium text-white/40">Secret you found it 👀</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] font-bold uppercase tracking-wide text-white/40">Best</div>
            <div className="font-black text-sm" style={{ color: ACCENT }}>{highScore}</div>
          </div>
        </div>

        <div
          className="mx-3 mb-3 rounded-2xl overflow-hidden relative cursor-pointer select-none"
          style={{ background: 'linear-gradient(180deg, rgba(25,68,241,0.08), rgba(0,0,0,0))', touchAction: 'none' }}
          onPointerDown={jump}
        >
          <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h, display: 'block', margin: '0 auto' }} />

          {phase !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55">
              {phase === 'ready' && (
                <>
                  <p className="text-white font-bold text-sm">Dodge red flags, catch hearts 💛</p>
                  <p className="text-white/60 text-[11px]">Tap or press Space to jump</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="mt-1 px-5 py-2 rounded-xl font-bold text-xs text-white active:scale-95 transition-transform"
                    style={{ background: HERO_GRAD }}>
                    Start
                  </button>
                </>
              )}
              {phase === 'over' && (
                <>
                  <p className="text-white font-black text-lg">Game Over</p>
                  <p className="text-white/70 text-xs">Score: {score} · Hearts caught: {heartsCollected}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-[11px] font-bold" style={{ color: ACCENT }}>New high score! 🎉</p>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="mt-1 px-5 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 active:scale-95 transition-transform"
                    style={{ background: HERO_GRAD }}>
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-white/30 pb-3 font-medium">shh, don't tell anyone 🤫</p>
      </motion.div>
    </div>
  );
}
