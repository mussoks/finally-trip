import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Undo2, X } from 'lucide-react';
import { TopBar } from '../components/ui.jsx';
import { FOODS, TAG_LABELS } from '../data/foods.js';
import { POP_BG } from '../lib/pop.js';
import { buzz } from '../lib/storage.js';

const flyOff = {
  exit: (dir) => ({
    x: dir * 520,
    rotate: dir * 28,
    opacity: 0,
    transition: { duration: 0.38, ease: 'easeIn' },
  }),
};

function FoodCard({ food, top, onDecide }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -24], [1, 0]);

  return (
    <motion.div
      className={`sticker absolute inset-0 flex select-none flex-col overflow-hidden rounded-[32px] text-onpop ${POP_BG[food.color]} ${top ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ x, rotate, zIndex: top ? 2 : 1, touchAction: 'pan-y' }}
      variants={flyOff}
      initial={{ scale: 0.9, y: 22, opacity: 0 }}
      animate={top ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.94, y: 16, opacity: 1 }}
      exit="exit"
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      drag={top ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      whileDrag={{ scale: 1.03 }}
      onDragEnd={(_, info) => {
        const o = info.offset.x;
        const v = info.velocity.x;
        if (o > 110 || v > 650) onDecide(true);
        else if (o < -110 || v < -650) onDecide(false);
      }}
      aria-hidden={!top}
    >
      <div className="relative grid flex-1 place-items-center">
        <motion.div
          className="sticker grid h-40 w-40 place-items-center rounded-full bg-card text-[88px] leading-none"
          animate={top ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          {food.emoji}
        </motion.div>
        <motion.span
          style={{ opacity: likeOpacity }}
          className="sticker-sm absolute left-5 top-5 -rotate-12 rounded-xl bg-mint px-3 py-1 font-display text-[24px] text-onpop"
        >
          먹고 싶다!
        </motion.span>
        <motion.span
          style={{ opacity: passOpacity }}
          className="sticker-sm absolute right-5 top-5 rotate-12 rounded-xl bg-card px-3 py-1 font-display text-[24px] text-ink"
        >
          패스
        </motion.span>
      </div>
      <div className="border-t-[3px] border-line bg-card p-5 text-ink">
        <h2 className="font-display text-[28px] leading-tight">{food.title}</h2>
        <p className="mt-0.5 text-soft">{food.sub}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {food.tags.map((t) => (
            <span key={t} className="rounded-full border-2 border-line px-2.5 py-0.5 text-[12px] font-bold">
              #{TAG_LABELS[t]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Swipe({ decisions, onDecide, onUndo, onDone, onBack }) {
  const index = decisions.length;
  const done = index >= FOODS.length;
  const [dir, setDir] = useState(1);
  const likes = decisions.filter((d) => d.like).length;

  const decideRef = useRef(null);
  decideRef.current = (like) => {
    if (done) return;
    setDir(like ? 1 : -1);
    buzz(like ? 18 : 8);
    onDecide(FOODS[index].id, like);
  };

  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (!done) return undefined;
    const t = setTimeout(() => doneRef.current(), 450);
    return () => clearTimeout(t);
  }, [done]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') decideRef.current(true);
      if (e.key === 'ArrowLeft') decideRef.current(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const visible = FOODS.slice(index, index + 2);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <TopBar onBack={onBack} step={3} />

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[34px] leading-tight text-ink">먹고 싶은 걸 골라요</h1>
          <p className="mt-1 text-soft">카드를 옆으로 밀거나 아래 버튼을 눌러요.</p>
        </div>
        <span className="sticker-sm shrink-0 rounded-xl bg-card px-3 py-1.5 font-display text-[18px] text-ink tabular-nums">
          {Math.min(index + 1, FOODS.length)}/{FOODS.length}
        </span>
      </div>

      <div className="relative mx-1 h-[410px]">
        <AnimatePresence custom={dir} initial={false}>
          {[...visible].reverse().map((f) => (
            <FoodCard key={f.id} food={f} top={f.id === visible[0].id} onDecide={(like) => decideRef.current(like)} />
          ))}
        </AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid h-full place-items-center text-center"
          >
            <p className="font-display text-[26px] text-ink">
              입맛 분석 끝!
              <br />
              여행지 고르는 중...
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-center gap-5">
        <motion.button
          type="button"
          aria-label="패스"
          whileTap={{ scale: 0.85, rotate: -10 }}
          onClick={() => decideRef.current(false)}
          disabled={done}
          className="press sticker grid h-[68px] w-[68px] place-items-center rounded-full bg-card text-ink disabled:opacity-40"
        >
          <X size={30} strokeWidth={3} />
        </motion.button>
        <button
          type="button"
          aria-label="방금 고른 것 되돌리기"
          onClick={onUndo}
          disabled={index === 0}
          className="press sticker-sm grid h-12 w-12 place-items-center rounded-full bg-mango text-onpop disabled:opacity-40"
        >
          <Undo2 size={20} strokeWidth={2.8} />
        </button>
        <motion.button
          type="button"
          aria-label="먹고 싶다"
          whileTap={{ scale: 0.85, rotate: 10 }}
          onClick={() => decideRef.current(true)}
          disabled={done}
          className="press sticker grid h-[68px] w-[68px] place-items-center rounded-full bg-tomato text-onpop disabled:opacity-40"
        >
          <Heart size={30} strokeWidth={3} fill="currentColor" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between text-[14px] font-bold text-soft">
        <span>먹고 싶다 {likes}개 · ← → 키도 돼요</span>
        {index >= 5 && !done && (
          <button type="button" onClick={onDone} className="text-ink underline decoration-2 underline-offset-4">
            그만 고르고 결과 보기
          </button>
        )}
      </div>
    </div>
  );
}
