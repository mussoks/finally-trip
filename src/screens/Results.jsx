import { motion } from 'framer-motion';
import { CalendarDays, ChevronRight, Footprints, Plane, RotateCcw, Shuffle, Sun, TrainFront } from 'lucide-react';
import { longDate, shortDate } from '../lib/holidays.js';
import { GhostButton, MatchBadge, Pill, PopButton, Wordmark } from '../components/ui.jsx';
import { TAG_LABELS } from '../data/foods.js';
import { COMPANIONS, DAYS, DEST_STAMINA_LABEL, STAMINA, labelOf } from '../data/prefs.js';
import { POP_BG } from '../lib/pop.js';
import { travelShort } from '../lib/match.js';
import { tierOf } from './Years.jsx';

export const travelIcon = (d) => (d.travel.includes('KTX') ? TrainFront : Plane);

function DestCard({ d, rank, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ y: 30, opacity: 0, rotate: rank % 2 ? -2 : 2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      whileHover={{ y: -4, rotate: rank % 2 ? -0.8 : 0.8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: rank * 0.08 }}
      className="sticker block w-full overflow-hidden rounded-[30px] bg-card text-left text-ink"
    >
      <div className={`flex items-center gap-4 border-b-[3px] border-line p-5 text-onpop ${POP_BG[d.color]}`}>
        <span className="sticker-sm grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card text-[36px] leading-none" aria-hidden>
          {d.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
            <span className="rounded-full border-2 border-line bg-card px-2 py-px text-ink">{rank}등</span>
            <span>{d.country}</span>
          </div>
          <h3 className="mt-1 font-display text-[30px] leading-none">{d.city}</h3>
          <p className="mt-1.5 text-[14px] font-medium leading-snug">{d.tagline}</p>
        </div>
        <MatchBadge value={d.match} size="sm" className="rotate-6" />
      </div>
      <div className="flex flex-col gap-3 p-5">
        {d.points.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[12px] font-bold text-soft">궁합 포인트</span>
            {d.points.map((t) => (
              <span key={t} className="rounded-full bg-mango px-2.5 py-0.5 text-[12px] font-bold text-onpop">
                #{TAG_LABELS[t]}
              </span>
            ))}
          </div>
        )}
        <p className="text-[15px]">
          <b>꼭 먹을 것</b> · {d.eat.map((e) => e.title).join(', ')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill icon={travelIcon(d)}>{travelShort(d)}</Pill>
          <Pill icon={Footprints}>{DEST_STAMINA_LABEL[d.stamina]}</Pill>
          <Pill icon={Sun}>{d.best}</Pill>
        </div>
        <span className="flex items-center justify-end gap-0.5 text-[15px] font-bold underline decoration-2 underline-offset-4">
          일정까지 보기 <ChevronRight size={18} strokeWidth={2.8} />
        </span>
      </div>
    </motion.button>
  );
}

export default function Results({ years, prefs, ranked, trip, onOpen, onGacha, onHolidays, onRedoFood, onRestart }) {
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const tier = tierOf(years);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex h-[72px] items-center justify-between">
        <Wordmark />
        <button type="button" onClick={onRestart} className="text-[14px] font-bold text-soft underline decoration-2 underline-offset-4">
          처음부터
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <motion.span
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 380, damping: 11 }}
          className={`sticker-sm self-start rounded-xl px-3 py-1.5 text-[14px] font-bold text-onpop ${POP_BG[tier.color]}`}
        >
          {years}년 근속 기념 · {tier.name}
        </motion.span>
        <h1 className="font-display text-[38px] leading-[1.1] text-ink">당신 입맛엔 여기!</h1>
        <p className="text-soft">
          {labelOf(COMPANIONS, prefs.companion)} · {labelOf(DAYS, prefs.days)} · 하루 {labelOf(STAMINA, prefs.stamina)}
        </p>
        <button
          type="button"
          onClick={onHolidays}
          className="press sticker-sm flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left text-ink"
        >
          <span className="sticker-sm grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mango text-onpop">
            <CalendarDays size={20} strokeWidth={2.6} />
          </span>
          <span className="min-w-0 flex-1">
            {trip ? (
              <>
                <span className="block text-[12px] font-bold text-soft">고른 연휴 · {trip.leave.length ? `연차 ${trip.leave.length}일` : '연차 없이'}</span>
                <span className="block font-bold">
                  {longDate(trip.start)} ~ {shortDate(trip.end)} · {trip.length}일
                </span>
              </>
            ) : (
              <>
                <span className="block font-bold">언제 갈지 아직이라면?</span>
                <span className="block text-[13px] text-soft">연차를 끼워 제일 길게 쉬는 날을 찾아 드려요</span>
              </>
            )}
          </span>
          <span className="shrink-0 text-[13px] font-bold underline decoration-2 underline-offset-4">{trip ? '바꾸기' : '연휴 찾기'}</span>
        </button>
      </div>

      {top.length === 0 ? (
        <p className="sticker rounded-3xl bg-card p-5 text-ink">조건에 맞는 여행지가 없어요. 여행 스타일을 바꿔 보세요.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {top.map((d, i) => (
            <DestCard key={d.id} d={d} rank={i + 1} onOpen={() => onOpen(d.id)} />
          ))}
        </div>
      )}

      <div className="sticker relative overflow-hidden rounded-[30px] bg-grape p-5 text-onpop">
        <p className="font-display text-[24px] leading-tight">그래도 못 고르겠다면?</p>
        <p className="mt-1 text-[15px] font-medium">캡슐 하나 뽑아서 운명에 맡겨요. 궁합 높은 곳이 더 잘 나와요.</p>
        <PopButton color="mango" className="mt-4 w-full" onClick={onGacha}>
          <Shuffle size={20} strokeWidth={2.8} /> 여행 캡슐 뽑기
        </PopButton>
      </div>

      {rest.length > 0 && (
        <section>
          <h2 className="font-display text-[22px] text-ink">다른 후보도 있어요</h2>
          <ul className="sticker mt-3 overflow-hidden rounded-[26px] bg-card">
            {rest.map((d, i) => (
              <li key={d.id} className={i > 0 ? 'border-t-2 border-dashed border-rule' : ''}>
                <button
                  type="button"
                  onClick={() => onOpen(d.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-ink hover:bg-paper"
                >
                  <span className="w-6 shrink-0 text-center font-display text-[15px] text-soft tabular-nums">{i + 4}</span>
                  <span className={`sticker-sm grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[20px] ${POP_BG[d.color]}`} aria-hidden>
                    {d.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">
                      {d.city} <span className="text-[13px] font-medium text-soft">{d.country}</span>
                    </span>
                    <span className="block truncate text-[13px] text-soft">{d.tagline}</span>
                  </span>
                  <span className="shrink-0 font-display text-[17px] tabular-nums">{d.match}%</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-3">
        <GhostButton onClick={onRedoFood}>
          <RotateCcw size={18} strokeWidth={2.8} /> 음식 다시 고르기
        </GhostButton>
      </div>

      <p className="text-center text-[13px] text-soft">
        여행지 정보는 MVP용 샘플이에요. 떠나기 전에 영업시간과 교통편은 꼭 다시 확인하세요.
      </p>
    </div>
  );
}
