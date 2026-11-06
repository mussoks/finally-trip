import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Mascot from '../components/Mascot.jsx';
import { PopButton, Wordmark } from '../components/ui.jsx';

const STEPS = ['근속 연차', '여행 스타일', '음식 스와이프', '추천 여행지'];

export default function Intro({ onStart, onSample }) {
  return (
    <div className="flex flex-col gap-7 pb-10">
      <div className="flex h-[72px] items-center justify-between">
        <Wordmark />
        <motion.span
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 7, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.25 }}
          className="sticker-sm rounded-xl bg-mint px-3 py-1.5 text-[13px] font-bold text-onpop"
        >
          사표 아님 · 연차임
        </motion.span>
      </div>

      <div className="relative grid place-items-center pt-2">
        <motion.div
          aria-hidden
          className="sticker absolute h-[220px] w-[220px] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-tomato"
          animate={{ rotate: [0, 8, 0, -6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden
          className="sticker-sm absolute left-[12%] top-2 h-9 w-9 rounded-full bg-sky"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden
          className="sticker-sm absolute bottom-3 right-[14%] h-6 w-6 rotate-12 rounded-md bg-grape"
          animate={{ y: [0, 8, 0], rotate: [12, 30, 12] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Mascot size={170} mood="love" className="relative" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[46px] leading-[1.08] text-ink">
          드디어,
          <br />
          떠날 차례예요
        </h1>
        <p className="max-w-[34ch] text-[17px] text-soft">
          일만 하느라 여행이 막막했다면, 입맛에 맞는 여행지와 체력에 맞는 일정까지 대신 골라 드릴게요. 3분이면 돼요.
        </p>
      </div>

      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px] font-bold text-ink">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="rounded-full border-2 border-line bg-card px-2.5 py-0.5">
              {i + 1}. {s}
            </span>
            {i < STEPS.length - 1 && <ArrowRight size={14} strokeWidth={2.6} aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3">
        <PopButton onClick={onStart}>
          시작하기 <ArrowRight size={20} strokeWidth={2.8} />
        </PopButton>
        <button type="button" onClick={onSample} className="py-2 text-[15px] font-bold text-soft underline decoration-2 underline-offset-4">
          예시 결과 먼저 구경하기
        </button>
      </div>
    </div>
  );
}
