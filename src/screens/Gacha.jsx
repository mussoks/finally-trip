import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import Mascot from '../components/Mascot.jsx';
import { GhostButton, MatchBadge, PopButton, TopBar } from '../components/ui.jsx';
import { POP_BG } from '../lib/pop.js';
import { weightedPick } from '../lib/match.js';
import { buzz } from '../lib/storage.js';

// 돔(210px) 안쪽에 들어가도록 잡아 둔 캡슐 자리
const BALLS = [
  { x: 20, y: 120, c: 'tomato' },
  { x: 66, y: 136, c: 'mint' },
  { x: 112, y: 130, c: 'grape' },
  { x: 150, y: 110, c: 'sky' },
  { x: 40, y: 76, c: 'bubble' },
  { x: 90, y: 88, c: 'mango' },
  { x: 132, y: 66, c: 'tomato' },
  { x: 70, y: 40, c: 'mint' },
];

const capsuleBg = (c) => `linear-gradient(180deg, var(--${c}) 50%, var(--card) 50%)`;

export default function Gacha({ ranked, onPick, onBack }) {
  const [phase, setPhase] = useState('idle'); // idle | shaking | ready | open
  const [pick, setPick] = useState(null);
  const [count, setCount] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pull = () => {
    if (phase === 'shaking' || ranked.length === 0) return;
    buzz(30);
    setPick((prev) => weightedPick(ranked, prev?.id));
    setCount((c) => c + 1);
    setPhase('shaking');
    timer.current = setTimeout(() => setPhase('ready'), 950);
  };

  const open = () => {
    buzz(20);
    setPhase('open');
  };

  const status = {
    idle: '노란 레버를 돌려 보세요',
    shaking: '두구두구두구...',
    ready: '캡슐이 나왔어요! 눌러서 열어 보세요',
    open: count >= 3 ? '결정은 원래 어려운 거예요. 괜찮아요.' : '오늘의 운명은 여기!',
  }[phase];

  return (
    <div className="flex flex-col gap-5 pb-12">
      <TopBar onBack={onBack} />

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[34px] leading-tight text-ink">여행 캡슐 뽑기</h1>
          <p className="mt-1 text-soft" aria-live="polite">
            {status}
          </p>
        </div>
        <Mascot size={72} mood={phase === 'shaking' ? 'wow' : phase === 'open' ? 'love' : 'happy'} />
      </div>

      <div className="relative mx-auto w-[250px]">
        <motion.div
          className="sticker relative mx-auto h-[210px] w-[210px] overflow-hidden rounded-full"
          style={{ background: 'var(--glass)' }}
          animate={phase === 'shaking' ? { rotate: [0, -7, 7, -5, 5, -2, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 }}
        >
          {BALLS.map((b, i) => (
            <motion.span
              key={i}
              className="absolute h-12 w-12 rounded-full border-[3px] border-line"
              style={{ left: b.x, top: b.y, background: capsuleBg(b.c) }}
              animate={
                phase === 'shaking'
                  ? { y: [0, -44 - i * 4, 12, -22, 0], x: [0, i % 2 ? 16 : -16, 0], rotate: [0, 120, 260, 360] }
                  : { y: 0, x: 0, rotate: 0 }
              }
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />
          ))}
          <span aria-hidden className="absolute left-8 top-6 h-12 w-5 rotate-[25deg] rounded-full" style={{ background: '#ffffff', opacity: 0.55 }} />
        </motion.div>

        <div className="sticker relative mx-auto -mt-4 h-[124px] w-[250px] rounded-[30px] bg-tomato">
          <motion.button
            type="button"
            aria-label="레버 돌려서 캡슐 뽑기"
            onClick={pull}
            disabled={phase === 'shaking'}
            animate={{ rotate: count * 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 110, damping: 13 }}
            className="sticker-sm absolute left-6 top-[30px] grid h-16 w-16 place-items-center rounded-full bg-mango"
          >
            <span className="block h-3 w-11 rounded-full bg-line" />
          </motion.button>
          <div className="absolute right-6 top-[26px] h-[72px] w-[92px] overflow-visible rounded-2xl border-[3px] border-line bg-line">
            <AnimatePresence>
              {phase === 'ready' && pick && (
                <motion.button
                  type="button"
                  aria-label="캡슐 열기"
                  onClick={open}
                  initial={{ y: -70, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 9 }}
                  className="absolute left-[15px] top-[5px] h-14 w-14 rounded-full border-[3px] border-line"
                  style={{ background: capsuleBg(pick.color) }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {phase === 'idle' && (
        <PopButton color="mango" onClick={pull}>
          레버 돌리기
        </PopButton>
      )}

      <AnimatePresence mode="wait">
        {phase === 'open' && pick && (
          <motion.div
            key={pick.id + count}
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 14 }}
            className="sticker overflow-hidden rounded-[30px] bg-card text-ink"
          >
            <div className={`flex items-center gap-4 border-b-[3px] border-line p-5 text-onpop ${POP_BG[pick.color]}`}>
              <span className="sticker-sm grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card text-[36px] leading-none" aria-hidden>
                {pick.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold">{pick.country}</p>
                <p className="font-display text-[32px] leading-none">{pick.city}</p>
              </div>
              <MatchBadge value={pick.match} size="sm" className="-rotate-6" />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <p className="font-medium">{pick.tagline}</p>
              <PopButton onClick={() => onPick(pick.id)}>
                여기로 정했어요 <ArrowRight size={20} strokeWidth={2.8} />
              </PopButton>
              <GhostButton onClick={pull}>
                <RotateCcw size={18} strokeWidth={2.8} /> 한 번 더 돌리기
              </GhostButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {count > 0 && <p className="text-center text-[13px] font-bold text-soft tabular-nums">{count}번째 뽑기</p>}
    </div>
  );
}
