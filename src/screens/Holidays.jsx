import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, X } from 'lucide-react';
import { GhostButton, PopButton, TopBar } from '../components/ui.jsx';
import { bestWindows, buildCalendar, longDate, shortDate, todayKey } from '../lib/holidays.js';

const MAX_LEAVE = 7;

function DayCell({ d, leave }) {
  const day = Number(d.key.slice(8));
  const style = d.holiday ? 'bg-tomato text-onpop' : d.weekend ? 'bg-grape text-onpop' : leave ? 'bg-mango text-onpop' : 'bg-card text-ink';
  return (
    <span
      title={d.holiday ?? (leave ? '연차' : d.weekend ? '주말' : '')}
      className={`flex h-[46px] w-[34px] flex-col items-center justify-center rounded-lg border-2 border-line leading-none ${style}`}
    >
      <span className="text-[10px] font-bold">{['일', '월', '화', '수', '목', '금', '토'][d.dow]}</span>
      <span className="mt-0.5 font-display text-[15px] tabular-nums">{day}</span>
      {leave && <span className="mt-0.5 text-[8px] font-bold">연차</span>}
    </span>
  );
}

function WindowCard({ w, best, onPick }) {
  const leaveSet = new Set(w.leave);
  return (
    <motion.li
      layout
      initial={{ y: 24, opacity: 0, rotate: best ? -1.5 : 0 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`sticker overflow-hidden rounded-[26px] ${best ? 'bg-mint text-onpop' : 'bg-card text-ink'}`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="font-display text-[40px] leading-none tabular-nums">{w.length}일</span>
          <span className="pb-1 text-[15px] font-bold">
            {w.leave.length ? `연차 ${w.leave.length}일로` : '연차 없이'}
          </span>
          {best && (
            <span className="sticker-sm mb-1 ml-auto rotate-3 rounded-lg bg-card px-2 py-0.5 text-[12px] font-bold text-ink">제일 길어요</span>
          )}
        </div>
        <p className="text-[15px] font-bold">
          {longDate(w.start)} ~ {shortDate(w.end)}
          {w.holidays.length > 0 && <span className="font-medium"> · {w.holidays.join(', ')}</span>}
        </p>
        <div className="flex flex-wrap gap-1" aria-hidden>
          {w.days.map((d) => (
            <DayCell key={d.key} d={d} leave={leaveSet.has(d.key)} />
          ))}
        </div>
        {w.leave.length > 0 && <p className="text-[13px] font-medium">연차 쓰는 날: {w.leave.map(shortDate).join(', ')}</p>}
        <PopButton color={best ? 'mango' : 'tomato'} className="mt-1 min-h-[48px] text-[15px]" onClick={() => onPick(w)}>
          이 연휴로 떠나기 <ArrowRight size={18} strokeWidth={2.8} />
        </PopButton>
      </div>
    </motion.li>
  );
}

export default function Holidays({ holidays, leave, onLeave, trip, onPick, onClearTrip, onBack }) {
  const today = todayKey();
  const windows = useMemo(() => {
    if (today > holidays.to) return [];
    return bestWindows(buildCalendar(today, holidays.to, holidays.days), leave, { limit: 6 });
  }, [today, holidays, leave]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <TopBar onBack={onBack} />

      <div>
        <h1 className="font-display text-[34px] leading-tight text-ink">연차 며칠이면 될까요?</h1>
        <p className="mt-1 text-soft">주말과 공휴일 사이에 연차를 끼워서 제일 길게 쉬는 날을 찾아 드려요.</p>
      </div>

      {trip && (
        <div className="sticker-sm flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-ink">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-soft">지금 고른 연휴</p>
            <p className="font-bold">
              {longDate(trip.start)} ~ {shortDate(trip.end)} · {trip.length}일
            </p>
          </div>
          <button type="button" onClick={onClearTrip} aria-label="고른 연휴 지우기" className="press sticker-sm grid h-9 w-9 place-items-center rounded-full bg-paper">
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      <div className="sticker flex items-center justify-between gap-3 rounded-[26px] bg-card p-4 text-ink">
        <button
          type="button"
          aria-label="연차 하루 줄이기"
          onClick={() => onLeave(Math.max(0, leave - 1))}
          disabled={leave === 0}
          className="press sticker-sm grid h-12 w-12 place-items-center rounded-full bg-paper disabled:opacity-40"
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="text-[13px] font-bold text-soft">쓸 수 있는 연차</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={leave}
              initial={{ y: -14, scale: 0.7, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
              className="font-display text-[44px] leading-none tabular-nums"
            >
              {leave === 0 ? '0일' : `${leave}일`}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-[12px] font-bold text-soft">{leave === 0 ? '공휴일 연휴만 볼게요' : `${leave}일까지 써 볼게요`}</p>
        </div>
        <button
          type="button"
          aria-label="연차 하루 늘리기"
          onClick={() => onLeave(Math.min(MAX_LEAVE, leave + 1))}
          disabled={leave === MAX_LEAVE}
          className="press sticker-sm grid h-12 w-12 place-items-center rounded-full bg-tomato text-onpop disabled:opacity-40"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-bold text-soft">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-line bg-tomato" />공휴일</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-line bg-grape" />주말</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-line bg-mango" />연차</span>
      </div>

      {windows.length === 0 ? (
        <p className="sticker rounded-3xl bg-card p-5 text-ink">
          남은 기간에 찾을 수 있는 연휴가 없어요. 공휴일 데이터가 새로 들어오면 다시 찾아 드릴게요.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {windows.map((w, i) => (
              <WindowCard key={`${w.start}-${w.end}`} w={w} best={i === 0} onPick={onPick} />
            ))}
          </AnimatePresence>
        </ol>
      )}

      <div className="flex flex-col gap-1 text-[13px] text-soft">
        <p>공휴일 출처: {holidays.source} · {holidays.to.slice(0, 4)}년 {Number(holidays.to.slice(5, 7))}월까지 반영</p>
        <p>관공서 공휴일 기준이에요. 5인 미만 사업장이나 교대 근무라면 쉬는 날이 다를 수 있어요.</p>
      </div>

      <GhostButton onClick={onBack}>나중에 정할래요</GhostButton>
    </div>
  );
}
