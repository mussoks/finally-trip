import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Mascot from '../components/Mascot.jsx';
import { PopButton, TopBar } from '../components/ui.jsx';
import { POP_BG } from '../lib/pop.js';

const MIN = 1;
const MAX = 35;

export function tierOf(years) {
  if (years >= 20) return { name: '살아있는 전설', line: '회사보다 당신이 더 오래됐을지도 몰라요.', color: 'grape', mood: 'sleepy' };
  if (years >= 15) return { name: '전설의 근속', line: '이 정도면 여행은 권리예요.', color: 'tomato', mood: 'sleepy' };
  if (years >= 10) return { name: '철인 근속', line: '10년 넘게 버틴 당신, 진짜 대단해요.', color: 'mango', mood: 'wow' };
  if (years >= 5) return { name: '단단한 근속', line: '중간 점검 겸 한번 떠나 봐요.', color: 'mint', mood: 'happy' };
  return { name: '열정 근속', line: '쉬는 것도 일 잘하는 방법이에요.', color: 'sky', mood: 'happy' };
}

export default function Years({ years, onChange, onNext, onBack }) {
  const tier = tierOf(years);
  const workdays = years * 240;
  const coffee = workdays * 2;
  const fill = `${((years - MIN) / (MAX - MIN)) * 100}%`;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <TopBar onBack={onBack} step={1} />

      <div>
        <h1 className="font-display text-[34px] leading-tight text-ink">몇 년 동안 일하셨어요?</h1>
        <p className="mt-1 text-soft">대충이어도 괜찮아요. 근속 기념 뱃지를 만들어 드릴게요.</p>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={years}
              initial={{ y: -18, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="font-display text-[96px] leading-none text-ink tabular-nums"
            >
              {years}
            </motion.span>
          </AnimatePresence>
          <span className="font-display text-3xl text-ink">년</span>
        </div>
        <Mascot size={96} mood={tier.mood} />
      </div>

      <div>
        <label htmlFor="years-range" className="sr-only">
          근속 연차
        </label>
        <input
          id="years-range"
          type="range"
          min={MIN}
          max={MAX}
          value={years}
          onChange={(e) => onChange(Number(e.target.value))}
          className="years-range"
          style={{ '--fill': fill }}
        />
        <div className="mt-2 flex justify-between text-[13px] font-bold text-soft tabular-nums">
          <span>{MIN}년</span>
          <span>{MAX}년+</span>
        </div>
      </div>

      <motion.div
        key={tier.name}
        initial={{ scale: 0.92, rotate: -3 }}
        animate={{ scale: 1, rotate: -1.5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        className="sticker rounded-[26px] bg-card p-5"
      >
        <div className="flex items-center gap-3">
          <span className={`sticker-sm grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-[22px] text-onpop ${POP_BG[tier.color]}`}>
            {years}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-soft">근속 기념 뱃지</p>
            <p className="font-display text-[24px] leading-tight text-ink">{tier.name}</p>
          </div>
        </div>
        <p className="mt-3 text-ink">{tier.line}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-dashed border-rule pt-4">
          <div>
            <dt className="text-[12px] font-bold text-soft">출근한 날</dt>
            <dd className="font-display text-[22px] text-ink tabular-nums">약 {workdays.toLocaleString('ko-KR')}일</dd>
          </div>
          <div>
            <dt className="text-[12px] font-bold text-soft">마신 커피 (하루 두 잔)</dt>
            <dd className="font-display text-[22px] text-ink tabular-nums">약 {coffee.toLocaleString('ko-KR')}잔</dd>
          </div>
        </dl>
      </motion.div>

      <PopButton onClick={onNext}>
        다음 <ArrowRight size={20} strokeWidth={2.8} />
      </PopButton>
    </div>
  );
}
